import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Vehicle } from '../lib/types';
import { VehicleCard } from './VehicleCard';
import { Button } from './ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { useFeatures } from '../contexts/FeaturesContext';
import { translations } from '../lib/translations';

export function HomePage() {
  const { language } = useLanguage();
  const { features } = useFeatures();
  const t = translations[language];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [mostViewedVehicles, setMostViewedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const [allVehicles, mostViewed] = await Promise.all([
          api.getVehicles({ sortBy: 'year_desc' }),
          api.getMostViewedVehicles(3)
        ]);
        setVehicles(allVehicles);
        setMostViewedVehicles(mostViewed);
      } catch (err) {
        console.error(err);
        setError('Failed to load vehicles');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const visibleVehicles = vehicles.slice(0, visibleCount);
  const hasMore = visibleCount < vehicles.length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center bg-gradient-to-b from-muted/50 to-background px-[16px] py-[10px] m-[0px]">
        <div className="container mx-auto max-w-4xl">
          <h1 className="mb-6 text-foreground text-[32px]">{t.findYourDreamVehicle}</h1>
          <p className="text-xl text-muted-foreground mb-8 text-[18px]">
            {t.searchThousands}
          </p>
        </div>
      </section>

      {/* Most Viewed Vehicles */}
      {mostViewedVehicles.length > 0 && (
        <section className="py-16 px-4 bg-muted/30">
          <div className="container mx-auto">
            <h2 className="mb-8 text-center text-foreground">Most Viewed Vehicles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mostViewedVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Vehicles */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="mb-8 text-center text-foreground">
            Latest Vehicles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
              />
            ))}
          </div>

          {/* Show More Button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <Button
                onClick={() => setVisibleCount(prev => prev + 15)}
                variant="outline"
                size="lg"
              >
                Show More
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{feature.emoji}</span>
                </div>
                <h3 className="mb-2 text-foreground">
                  {language === 'en' ? feature.titleEn : language === 'ar' ? feature.titleAr : feature.titleTr}
                </h3>
                <p className="text-muted-foreground">
                  {language === 'en' ? feature.descriptionEn : language === 'ar' ? feature.descriptionAr : feature.descriptionTr}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
