import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Heart, Share2, ArrowLeft, Send, Trash2, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../lib/api';
import { Vehicle, Review } from '../lib/types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AIAssistant } from './AIAssistant';
import { EditVehicleDialog } from './EditVehicleDialog';
import { toast } from 'sonner';

interface VehicleDetailsPageProps {
  vehicleId?: string; // Optional now
  onBack?: () => void; // Optional now
}

export function VehicleDetailsPage({ vehicleId: propVehicleId, onBack }: VehicleDetailsPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const vehicleId = propVehicleId || id;

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };
  const { user, toggleFavorite } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const data = await api.getVehicle(vehicleId);
        setVehicle(data);
      } catch (err) {
        console.error(err);
        setError('Failed to load vehicle details');
      } finally {
        setLoading(false);
      }
    };
    if (vehicleId) {
      fetchVehicle();
    }
  }, [vehicleId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !vehicle) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || 'Vehicle not found'}</div>;

  const isFavorite = user?.favorites.includes(vehicle.id);

  const handleToggleFavorite = () => {
    if (!user) {
      toast.error(`${t.pleaseSignIn} ${t.myFavorites.toLowerCase()}`);
      return;
    }
    toggleFavorite(vehicle.id);
    toast.success(isFavorite ? t.removedFromFavorites : t.addedToFavorites);
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(t.confirmDeleteReview || 'Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      toast.success(t.reviewDeleted || 'Review deleted successfully');
      // Refresh vehicle data
      const updatedVehicle = await api.getVehicle(vehicleId);
      setVehicle(updatedVehicle);
    } catch (error) {
      console.error(error);
      toast.error(t.failedToDeleteReview || 'Failed to delete review');
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error(`${t.pleaseSignIn} ${t.writeReview.toLowerCase()}`);
      return;
    }
    if (!reviewText.trim()) {
      toast.error(t.pleaseWriteReview);
      return;
    }

    try {
      await api.addReview(vehicle.id, rating, reviewText);
      toast.success(t.reviewSubmitted);
      setReviewText('');
      // Refresh vehicle data to show new review
      const updatedVehicle = await api.getVehicle(vehicleId);
      setVehicle(updatedVehicle);
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit review');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={handleBack} className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          {t.backToResults}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted mb-4">
              <ImageWithFallback
                src={vehicle.images[currentImageIndex]}
                alt={vehicle.title}
                className="w-full h-full object-cover"
              />
              {vehicle.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {vehicle.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {vehicle.images.map((image, index) => (
                  <div
                    key={index}
                    className={`aspect-video rounded-lg overflow-hidden cursor-pointer border-2 ${currentImageIndex === index ? 'border-primary' : 'border-transparent'
                      }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <ImageWithFallback
                      src={image}
                      alt={`${vehicle.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="mb-2 text-foreground">{vehicle.title}</h1>
                <p className="text-2xl text-primary">${vehicle.price.toLocaleString()}</p>
              </div>
              {user && (
                <div className="flex gap-2">
                  {user.isAdmin && (
                    <EditVehicleDialog
                      vehicle={vehicle}
                      onUpdate={setVehicle}
                    />
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleToggleFavorite}
                    className={isFavorite ? 'text-red-500 border-red-500' : ''}
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="mb-4 text-foreground">{t.specifications}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">{t.brand}</p>
                  <p className="text-foreground">{vehicle.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.productionYear}</p>
                  <p className="text-foreground">{vehicle.productionYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.engineType}</p>
                  <p className="text-foreground">{vehicle.engineType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t.fuelTypeLabel}</p>
                  <p className="text-foreground">{vehicle.fuelType}</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-3 text-foreground">{t.description}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {vehicle.detailedDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="mb-6 text-foreground">{t.reviews}</h2>

          {/* Write Review */}
          {user && (
            <div className="bg-card border border-border rounded-lg p-6 mb-6">
              <h3 className="mb-4 text-foreground">{t.writeReview}</h3>
              <div className="mb-4">
                <p className="text-sm mb-2 text-foreground">{t.rating}</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this vehicle..."
                className="mb-4 bg-background border-border"
                rows={4}
              />
              <Button onClick={handleSubmitReview}>
                <MessageCircle className="mr-2 h-4 w-4" />
                {t.submitReview}
              </Button>
            </div>
          )}

          {/* Existing Reviews */}
          <div className="space-y-4">
            {vehicle.reviews && vehicle.reviews.length > 0 ? (
              vehicle.reviews.map((review: Review) => (
                <div key={review.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="text-foreground">{review.userName}</p>
                      {user && (user.id === review.userId || user.isAdmin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDeleteReview(review.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{review.date}</p>
                  <p className="text-muted-foreground">{review.comment}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {t.noReviewsYet} {t.beFirstToReview}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant for Vehicle Advice */}
      <AIAssistant context="vehicle" vehicleContext={vehicle} />
    </div>
  );
}
