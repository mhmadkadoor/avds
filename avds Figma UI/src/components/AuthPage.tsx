import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../lib/translations';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';

interface AuthPageProps {
  onSuccess: () => void;
}

export function AuthPage({ onSuccess }: AuthPageProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [searchParams, setSearchParams] = useSearchParams();
  const isSignUp = searchParams.get('mode') === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast.error('Please enter your email');
      return;
    }
    setResetLoading(true);
    try {
      await api.requestPasswordReset(resetEmail);
      toast.success('Password reset link generated! Check the backend terminal/console.');
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isSignUp) {
        if (!name || !email || !password) {
          toast.error(t.pleaseFillAllFields);
          return;
        }
        await signup(name, email, password);
        toast.success(t.accountCreated);
      } else {
        if (!email || !password) {
          toast.error(t.pleaseFillAllFields);
          return;
        }
        await login(email, password);
        toast.success(t.signedInSuccess);
      }
      onSuccess();
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || (isSignUp ? 'Registration failed' : 'Login failed. Please check your credentials.');
      toast.error(errorMessage);
    }
  };

  if (isForgotPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md bg-card border-border relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 right-2" 
            onClick={() => navigate('/')}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resetEmail" className="text-foreground">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  placeholder="name@example.com"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <Button type="submit" className="w-full" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-card border-border relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2" 
          onClick={() => navigate('/')}
        >
          <X className="h-4 w-4" />
        </Button>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-foreground">
            {isSignUp ? t.createAccount : t.signIn}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isSignUp
              ? t.enterDetails
              : t.enterEmailPassword}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">{t.name}</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">{t.usernameOrEmail}</Label>
              <Input
                id="email"
                type="text"
                placeholder="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground">{t.password}</Label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <Button type="submit" className="w-full">
              {isSignUp ? t.signUp : t.loginButton}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <button
              onClick={() => setSearchParams({ mode: isSignUp ? 'login' : 'signup' })}
              className="text-primary hover:underline"
            >
              {isSignUp
                ? `${t.alreadyHaveAccount} ${t.signInHere}`
                : `${t.dontHaveAccount} ${t.signUp}`}
            </button>
          </div>


        </CardContent>
      </Card>
    </div>
  );
}
