import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut, Settings, Heart, HelpCircle, BarChart3, X, Car, Languages } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { AccountManagementPage } from './AccountManagementPage';
import { SupportPage } from './SupportPage';
import { AdminPage } from './AdminPage';

interface NavbarProps {
  onSearch: (query: string) => void;
  onVehicleClick?: (vehicleId: string) => void;
  searchQuery?: string;
}

type ModalType = 'account' | 'favorites' | 'support' | 'admin' | null;

export function Navbar({ onSearch, onVehicleClick, searchQuery = '' }: NavbarProps) {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [searchValue, setSearchValue] = useState(searchQuery);
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchValue)}`);
      onSearch(searchValue); // Keep for compatibility if needed, but navigation handles it
    }
  };

  const handleClearSearch = () => {
    setSearchValue('');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    // onNavigate(path); // No longer needed for internal routing
  };

  return (
    <>
      <nav className="sticky top-0 z-[100] border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => handleNavClick('/')}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="hidden sm:block text-foreground">VehicleHub</span>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  type="text"
                  name="search"
                  placeholder={t.searchVehicles}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 pr-10 bg-muted/50 border-border"
                />
                {searchValue && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {/* Auth Buttons or User Menu */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border z-[150]">
                  <DropdownMenuItem
                    onClick={() => setLanguage('en')}
                    className={`cursor-pointer ${language === 'en' ? 'bg-accent' : ''}`}
                  >
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage('tr')}
                    className={`cursor-pointer ${language === 'tr' ? 'bg-accent' : ''}`}
                  >
                    Türkçe
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLanguage('ar')}
                    className={`cursor-pointer ${language === 'ar' ? 'bg-accent' : ''}`}
                  >
                    العربية
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar>
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover border-border z-[150]">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={() => setOpenModal('account')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t.accountSettings}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpenModal('favorites')} className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>{t.myFavorites}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpenModal('support')} className="cursor-pointer">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>{t.support}</span>
                    </DropdownMenuItem>
                    {user.isAdmin && (
                      <DropdownMenuItem onClick={() => setOpenModal('admin')} className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>{t.adminDashboard}</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => handleNavClick('/auth?mode=login')}
                    className="hidden sm:inline-flex"
                  >
                    {t.login}
                  </Button>
                  <Button
                    onClick={() => handleNavClick('/auth?mode=signup')}
                  >
                    {t.signUp}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

      </nav>

      {/* Account Settings Modal */}
      <Dialog open={openModal === 'account'} onOpenChange={(open) => !open && setOpenModal(null)} modal>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border z-[200]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t.accountSettings}</DialogTitle>
          <AccountManagementPage
            onVehicleClick={(id) => {
              setOpenModal(null);
              onVehicleClick?.(id);
            }}
            defaultTab="settings"
          />
        </DialogContent>
      </Dialog>

      {/* Favorites Modal */}
      <Dialog open={openModal === 'favorites'} onOpenChange={(open) => !open && setOpenModal(null)} modal>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border z-[200]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t.myFavorites}</DialogTitle>
          <AccountManagementPage
            onVehicleClick={(id) => {
              setOpenModal(null);
              onVehicleClick?.(id);
            }}
            defaultTab="favorites"
          />
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={openModal === 'support'} onOpenChange={(open) => !open && setOpenModal(null)} modal>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background border-border z-[200]" aria-describedby={undefined}>
          <DialogTitle className="sr-only">{t.support}</DialogTitle>
          <SupportPage onBack={() => setOpenModal(null)} isModal />
        </DialogContent>
      </Dialog>

      {/* Admin Dashboard Modal */}
      {user?.isAdmin && (
        <Dialog open={openModal === 'admin'} onOpenChange={(open) => !open && setOpenModal(null)} modal>
          <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] max-h-[90vh] overflow-y-auto bg-background border-border z-[200]" aria-describedby={undefined}>
            <DialogTitle className="sr-only">{t.adminDashboard}</DialogTitle>
            <AdminPage />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
