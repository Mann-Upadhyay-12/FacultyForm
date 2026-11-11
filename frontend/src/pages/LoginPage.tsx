import { useState } from 'react';
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, signup } = useAuth();
  const [, setLocation] = useLocation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLogin && !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (isLogin) {
      const success = await login(formData.email, formData.password);
      if (success) {
        setLocation('/');
      } else {
        setErrors({ email: 'Invalid credentials' });
      }
    } else {
      const success = await signup(formData.name, formData.email, formData.password);
      if (success) {
        setLocation('/');
      } else {
        setErrors({ email: 'Email already exists' });
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center" 
              style={{ backgroundColor: '#74AF87' }}
            >
              <span className="text-white font-bold text-2xl">P</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">Padh.ai</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {isLogin ? 'Login to continue' : 'Create your account'}
          </p>
        </div>

        <div className="border border-border rounded-lg bg-card p-8">
          <div className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your name"
                  className={errors.name ? 'border-red-500' : ''}
                  data-testid="input-name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1" data-testid="error-name">
                    {errors.name}
                  </p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your email"
                className={errors.email ? 'border-red-500' : ''}
                data-testid="input-email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1" data-testid="error-email">
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your password"
                className={errors.password ? 'border-red-500' : ''}
                data-testid="input-password"
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1" data-testid="error-password">
                  {errors.password}
                </p>
              )}
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              style={{ backgroundColor: '#74AF87' }}
              data-testid="button-submit"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-sm text-muted-foreground hover:text-foreground"
              data-testid="button-toggle-mode"
            >
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <span className="font-medium" style={{ color: '#74AF87' }}>
                {isLogin ? 'Sign up' : 'Login'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}