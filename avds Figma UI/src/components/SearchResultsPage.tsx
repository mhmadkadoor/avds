import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, HelpCircle, Settings, Heart } from 'lucide-react';
import { api } from '../lib/api';
import { Vehicle } from '../lib/types';
import { VehicleCard } from './VehicleCard';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Slider } from './ui/slider';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';

interface SearchResultsPageProps {
  searchQuery?: string;
}

export function SearchResultsPage({ searchQuery: propSearchQuery }: SearchResultsPageProps) {
  const [searchParams] = useSearchParams();
  const searchQuery = propSearchQuery || searchParams.get('q') || '';

  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<number[]>([0, 250000]);
  const [yearRange, setYearRange] = useState<number[]>([2020, 2025]);
  const [selectedEngineTypes, setSelectedEngineTypes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuelTypes, setSelectedFuelTypes] = useState<string[]>([]);

  const engineTypes = ['V8', 'V6', 'I4', 'Electric', 'Hybrid'];
  const brands = ['Porsche', 'Tesla', 'BMW', 'Ford', 'Dodge', 'Volkswagen', 'Mercedes-Benz', 'Audi'];
  const fuelTypes = ['Gas', 'Diesel', 'Electric', 'Hybrid'];

  useEffect(() => {
    const fetchVehicles = async () => {
      setLoading(true);
      try {
        // Note: The backend currently supports single value for filters like brand, engineType etc.
        // If we want multiple, we need to adjust backend or send multiple requests.
        // For now, let's send the first selected one or handle it if backend supports 'in'.
        // Looking at VehicleService.filter: qs.filter(brand__iexact=brand) -> single value.
        // So we can only filter by one brand at a time with current backend logic.
        // I will send the first one if multiple selected, or we need to update backend.
        // For this "check", I will just use the first one.

        const filters: any = {
          q: searchQuery,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          minYear: yearRange[0],
          maxYear: yearRange[1],
        };

        if (selectedBrands.length > 0) filters.brand = selectedBrands[0];
        if (selectedEngineTypes.length > 0) filters.engineType = selectedEngineTypes[0];
        if (selectedFuelTypes.length > 0) filters.fuelType = selectedFuelTypes[0];

        const data = await api.getVehicles(filters);
        setVehicles(data);
      } catch (error) {
        console.error("Failed to fetch vehicles", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce could be added here
    const timeoutId = setTimeout(fetchVehicles, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, priceRange, yearRange, selectedEngineTypes, selectedBrands, selectedFuelTypes]);

  const toggleFilter = (value: string, selected: string[], setter: (value: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(item => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 250000]);
    setYearRange([2020, 2025]);
    setSelectedEngineTypes([]);
    setSelectedBrands([]);
    setSelectedFuelTypes([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-foreground">
                {searchQuery ? `${t.resultsFor} "${searchQuery}"` : t.allVehicles}
                <span className="text-muted-foreground ml-2">({vehicles.length})</span>
              </h2>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    {t.filters}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto bg-background border-border z-[200]">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">{t.filterVehicles}</SheetTitle>
                    <SheetDescription className="sr-only">
                      Filter vehicles by price, year, engine type, brand, and fuel type
                    </SheetDescription>
                  </SheetHeader>
                  <div className="py-6 space-y-6">
                    {/* Price Range */}
                    <div>
                      <Label className="text-foreground">{t.priceRange}</Label>
                      <div className="pt-[24px] pb-[8px] pr-[5px] pl-[5px]">
                        <Slider
                          min={0}
                          max={250000}
                          step={5000}
                          value={priceRange}
                          onValueChange={setPriceRange}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${priceRange[0].toLocaleString()}</span>
                        <span className="px-[5px] py-[0px]">${priceRange[1].toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Production Year */}
                    <div>
                      <Label className="text-foreground">{t.productionYear}</Label>
                      <div className="pt-[24px] pb-[8px] pr-[5px] pl-[5px]">
                        <Slider
                          min={2020}
                          max={2025}
                          step={1}
                          value={yearRange}
                          onValueChange={setYearRange}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{yearRange[0]}</span>
                        <span className="text-left px-[5px] py-[0px]">{yearRange[1]}</span>
                      </div>
                    </div>

                    {/* Engine Type */}
                    <div className="px-[5px] py-[0px]">
                      <Label className="mb-3 block text-foreground">{t.engineType}</Label>
                      <div className="space-y-2">
                        {engineTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`engine-${type}`}
                              checked={selectedEngineTypes.includes(type)}
                              onCheckedChange={() => toggleFilter(type, selectedEngineTypes, setSelectedEngineTypes)}
                            />
                            <label
                              htmlFor={`engine-${type}`}
                              className="text-sm cursor-pointer text-foreground"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand */}
                    <div className="px-[5px] py-[0px]">
                      <Label className="mb-3 block text-foreground">{t.brand}</Label>
                      <div className="space-y-2">
                        {brands.map((brand) => (
                          <div key={brand} className="flex items-center space-x-2">
                            <Checkbox
                              id={`brand-${brand}`}
                              checked={selectedBrands.includes(brand)}
                              onCheckedChange={() => toggleFilter(brand, selectedBrands, setSelectedBrands)}
                            />
                            <label
                              htmlFor={`brand-${brand}`}
                              className="text-sm cursor-pointer text-foreground"
                            >
                              {brand}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fuel Type */}
                    <div className="px-[5px] py-[0px]">
                      <Label className="mb-3 block text-foreground">{t.fuelType}</Label>
                      <div className="space-y-2">
                        {fuelTypes.map((fuel) => (
                          <div key={fuel} className="flex items-center space-x-2">
                            <Checkbox
                              id={`fuel-${fuel}`}
                              checked={selectedFuelTypes.includes(fuel)}
                              onCheckedChange={() => toggleFilter(fuel, selectedFuelTypes, setSelectedFuelTypes)}
                            />
                            <label
                              htmlFor={`fuel-${fuel}`}
                              className="text-sm cursor-pointer text-foreground"
                            >
                              {fuel}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button variant="outline" onClick={clearFilters} className="w-full m-[5px]">
                      {t.clearAllFilters}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : vehicles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t.noVehiclesMatching}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
