import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { ApiError } from '@/lib/api';
import { FullPageSpinner } from '@/components/RequireAuth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

type Mode = 'login' | 'signup';
type Errors = Partial<Record<'email' | 'password' | 'confirm' | 'form', string>>;

export default function LoginPage() {
  const { user, loading, notice, login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as { from?: string } | null)?.from || '/form/personal';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <FullPageSpinner />;
  if (user) return <Navigate to={redirectTo} replace />;

  const isSignup = mode === 'signup';

  const validate = (): Errors => {
    const next: Errors = {};
    if (!email.trim()) next.email = 'Email is required';
    else if (!EMAIL_RE.test(email.trim())) next.email = 'Please enter a valid email address';
    if (!password) next.password = 'Password is required';
    else if (isSignup && password.length < MIN_PASSWORD) {
      next.password = `Password must be at least ${MIN_PASSWORD} characters`;
    }
    if (isSignup && confirm !== password) next.confirm = 'Passwords do not match';
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      if (isSignup) await signup(email.trim(), password);
      else await login(email.trim(), password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.code === 'EMAIL_TAKEN') setErrors({ email: apiErr.message });
      else if (apiErr.code === 'WEAK_PASSWORD') setErrors({ password: apiErr.message });
      else if (apiErr.code === 'INVALID_EMAIL') setErrors({ email: apiErr.message });
      else setErrors({ form: apiErr.message || 'Something went wrong. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(isSignup ? 'login' : 'signup');
    setErrors({});
    setPassword('');
    setConfirm('');
  };

  const fieldClass = (key: keyof Errors) => (errors[key] ? 'border-red-500 focus-visible:ring-red-500' : '');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#1e3a5f]">
            JAYPEE UNIVERSITY OF INFORMATION TECHNOLOGY
          </h1>
          <p className="text-sm text-slate-600 mt-1">Annual Self Assessment - Faculty (PBAS)</p>
        </div>

        <div className="border border-slate-200 rounded-lg bg-white shadow-sm p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-slate-800">{isSignup ? 'Create your account' : 'Log in'}</h2>
          <p className="text-sm text-slate-500 mt-1 mb-5">
            {isSignup
              ? 'Sign up with your email to start your self-assessment.'
              : 'Log in to continue your self-assessment.'}
          </p>

          {(errors.form || notice) && (
            <div
              role="alert"
              className={`mb-4 rounded-md border px-3 py-2 text-sm ${
                errors.form ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-800'
              }`}
            >
              {errors.form || notice}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="auth-email" className="block text-sm font-medium mb-1.5 text-slate-700">Email</label>
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@juit.ac.in"
                className={fieldClass('email')}
                aria-invalid={Boolean(errors.email)}
                data-testid="input-email"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm font-medium mb-1.5 text-slate-700">Password</label>
              <Input
                id="auth-password"
                type="password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignup ? `At least ${MIN_PASSWORD} characters` : 'Enter your password'}
                className={fieldClass('password')}
                aria-invalid={Boolean(errors.password)}
                data-testid="input-password"
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>

            {isSignup && (
              <div>
                <label htmlFor="auth-confirm" className="block text-sm font-medium mb-1.5 text-slate-700">Confirm password</label>
                <Input
                  id="auth-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your password"
                  className={fieldClass('confirm')}
                  aria-invalid={Boolean(errors.confirm)}
                  data-testid="input-confirm"
                />
                {errors.confirm && <p className="text-red-600 text-xs mt-1">{errors.confirm}</p>}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#1e3a5f] hover:bg-[#2d5a87] text-white"
              data-testid="button-submit"
            >
              {submitting ? 'Please wait…' : isSignup ? 'Sign Up' : 'Log In'}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={switchMode}
              className="font-medium text-[#1e3a5f] hover:underline"
              data-testid="button-toggle-mode"
            >
              {isSignup ? 'Log in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
