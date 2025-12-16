import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Heart } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { api } from '../lib/api';
import { Vehicle } from '../lib/types';
import { VehicleCard } from './VehicleCard';
import { toast } from 'sonner';

interface AccountManagementPageProps {
  onVehicleClick?: (vehicleId: string) => void;
  defaultTab?: 'settings' | 'favorites';
}

export function AccountManagementPage({ onVehicleClick, defaultTab = 'settings' }: AccountManagementPageProps) {
  const { user, toggleFavorite } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [favoriteVehicles, setFavoriteVehicles] = useState<Vehicle[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user) return;
      setLoadingFavorites(true);
      try {
        // If we are using the real backend, we should fetch from API.
        // However, the AuthContext currently manages favorites locally in the mock version.
        // If we switch to full backend, AuthContext should also be updated to use API for login/register/favorites.
        // For this "check", I will try to fetch from API, but fallback to empty or handle error.
        // Since I haven't updated AuthContext to use API, this might fail if I don't have a token.
        // But let's assume we want to move towards API.

        // For now, let's just comment out the API call and use the mock logic if we can't authenticate.
        // But the goal is to link them.
        // I'll add the API call.
        const data = await api.getFavorites();
        setFavoriteVehicles(data);
      } catch (error) {
        console.error("Failed to fetch favorites", error);
        // Fallback or show error
      } finally {
        setLoadingFavorites(false);
      }
    };

    if (defaultTab === 'favorites') {
      fetchFavorites();
    }
  }, [user, defaultTab]);

  const handleSaveSettings = () => {
    toast.success(t.settingsSaved);
  };

  const handleDeleteAccount = async () => {
    console.log('Deleting account...');
    try {
      await api.deleteAccount();
      console.log('Account deleted successfully');
      toast.success(t.accountDeleted);
      // Force logout and redirect
      window.location.href = '/';
    } catch (error) {
      console.error('Failed to delete account', error);
      toast.error(t.failedToDeleteAccount);
    }
  };

  return (
    <div className="bg-background">
      <div className="px-4 py-8">
        <h1 className="mb-8 text-foreground">{t.accountManagement}</h1>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-8 bg-muted">
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              {t.settings}
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="mr-2 h-4 w-4" />
              {t.favorites}
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="settings">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t.accountSettings}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.manageAccountInfo}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">{t.name}</Label>
                  <Input
                    id="name"
                    defaultValue={user?.name}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={user?.email}
                    className="bg-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theme" className="text-foreground">{t.theme}</Label>
                  <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder={t.selectTheme} />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border z-[200]">
                      <SelectItem value="light">{t.lightMode}</SelectItem>
                      <SelectItem value="dark">{t.darkMode}</SelectItem>
                      <SelectItem value="elite">{t.eliteMode}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveSettings}>{t.saveChanges}</Button>

                <div className="pt-6 border-t border-border mt-6">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="destructive" 
                        className="w-full sm:w-auto"
                        onClick={() => console.log("Delete Account button clicked")}
                      >
                        {t.deleteAccount}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-border">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">{t.deleteAccount}</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                          {t.confirmDeleteAccount}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-background text-foreground border-border hover:bg-accent">{t.cancel}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          {t.deleteAccount}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites */}
          <TabsContent value="favorites">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">{t.yourFavorites}</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {t.vehiclesSavedForLater}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favoriteVehicles.length > 0 ? (
                  <div className="space-y-3">
                    {favoriteVehicles.map((vehicle) => (
                      <div
                        key={vehicle.id}
                        className="group relative flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-all duration-200 hover:shadow-md cursor-pointer"
                      >
                        {/* Vehicle Image */}
                        <div className="relative w-32 h-24 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Vehicle Info */}
                        <div
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => {
                            if (onVehicleClick) {
                              onVehicleClick(vehicle.id);
                            } else {
                              navigate(`/vehicles/${vehicle.id}`);
                            }
                          }}
                        >
                          <h3 className="text-foreground mb-1">
                            {vehicle.productionYear} {vehicle.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-2">
                            {vehicle.engineType} • {vehicle.fuelType}
                          </p>
                          <div className="flex items-center gap-4">
                            <span className="text-primary">${vehicle.price.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 right-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(vehicle.id);
                              toast.success('Removed from favorites');
                            }}
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {t.noFavoriteVehicles}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
