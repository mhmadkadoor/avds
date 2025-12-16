import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { toast } from 'sonner';
import { Pencil, Check, X } from 'lucide-react';

interface SupportPageProps {
  onBack?: () => void;
  isModal?: boolean;
}

export function SupportPage({ onBack, isModal = false }: SupportPageProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [message, setMessage] = useState('');

  // Contact info state
  const [contactInfo, setContactInfo] = useState({
    email: 'support@vehiclehub.com',
    phone: '+1 (555) 123-4567',
    hours: 'Monday - Friday, 9am - 6pm EST'
  });

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editedContactInfo, setEditedContactInfo] = useState(contactInfo);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast.error(t.pleaseFillAllFields);
      return;
    }

    toast.success(t.messageSent);
    setMessage('');
  };

  const handleEditContact = () => {
    setEditedContactInfo(contactInfo);
    setIsEditingContact(true);
  };

  const handleSaveContact = () => {
    setContactInfo(editedContactInfo);
    setIsEditingContact(false);
    toast.success(t.contactInfoUpdated);
  };

  const handleCancelEdit = () => {
    setEditedContactInfo(contactInfo);
    setIsEditingContact(false);
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={isModal ? 'bg-background' : 'min-h-screen bg-background'}>
      <div className={isModal ? 'px-4 py-8' : 'container mx-auto px-4 py-12'}>
        <div className="max-w-2xl mx-auto">
          {!isModal && (
            <Button variant="ghost" onClick={handleBackClick} className="mb-6">
              ← {t.back}
            </Button>
          )}

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">{t.contactSupport}</CardTitle>
              <CardDescription className="text-muted-foreground">
                {t.supportDescription}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">{t.name}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t.yourName}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.yourEmail}
                    className="bg-background border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-foreground">{t.message}</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t.howCanWeHelp}
                    rows={8}
                    className="bg-background border-border"
                  />
                </div>

                <Button type="submit" className="w-full">
                  {t.sendMessageButton}
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground">{t.otherWaysToReach}</h3>
                  {user?.isAdmin && !isEditingContact && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEditContact}
                      className="gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      {t.edit}
                    </Button>
                  )}
                  {user?.isAdmin && isEditingContact && (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        {t.cancel}
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveContact}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        {t.save}
                      </Button>
                    </div>
                  )}
                </div>

                {!isEditingContact ? (
                  <div className="space-y-2 text-muted-foreground">
                    <p>📧 {t.email}: {contactInfo.email}</p>
                    <p>📞 {t.phone}: {contactInfo.phone}</p>
                    <p>🕐 {t.hours}: {contactInfo.hours}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact-email" className="text-foreground">{t.email}</Label>
                      <Input
                        id="contact-email"
                        value={editedContactInfo.email}
                        onChange={(e) => setEditedContactInfo({ ...editedContactInfo, email: e.target.value })}
                        placeholder="support@vehiclehub.com"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone" className="text-foreground">{t.phone}</Label>
                      <Input
                        id="contact-phone"
                        value={editedContactInfo.phone}
                        onChange={(e) => setEditedContactInfo({ ...editedContactInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-hours" className="text-foreground">{t.hours}</Label>
                      <Input
                        id="contact-hours"
                        value={editedContactInfo.hours}
                        onChange={(e) => setEditedContactInfo({ ...editedContactInfo, hours: e.target.value })}
                        placeholder="Monday - Friday, 9am - 6pm EST"
                        className="bg-background border-border"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
