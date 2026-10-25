import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@store/slices/authSlice';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { authService } from '@features/../services/auth.service';

const RESEND_COOLDOWN = 30; // seconds

const schema = z.object({
  code: z.string().min(6, 'Enter the 6-digit code').max(6, 'Code must be 6 digits'),
});
type FormData = z.infer<typeof schema>;

export default function MFAPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const sessionToken = (location.state as any)?.sessionToken ?? '';

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resendLoading, setResendLoading] = React.useState(false);
  const [resendSuccess, setResendSuccess] = React.useState('');
  const [cooldown, setCooldown] = React.useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // Countdown timer
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  if (!sessionToken) {
    navigate('/login', { replace: true });
    return null;
  }

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError('');
    setResendSuccess('');
    try {
      const result = await authService.verifyMFA(sessionToken, data.code);
      dispatch(setCredentials({
        user: result.data.user,
        accessToken: result.data.accessToken,
        refreshToken: result.data.refreshToken,
      }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');
    setResendSuccess('');
    try {
      await authService.resendMFA(sessionToken);
      setResendSuccess('A new code has been sent.');
      setCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to resend code. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-light p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">HRMS</h1>
          <p className="text-gray-500 mt-2">Two-Factor Authentication</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger">
              {error}
            </div>
          )}
          {resendSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {resendSuccess}
            </div>
          )}

          <p className="text-sm text-gray-500">
            Enter the 6-digit code from your authenticator app to continue.
          </p>

          <Input
            label="Authentication Code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            error={errors.code?.message}
            {...register('code')}
          />

          <Button type="submit" loading={loading} className="w-full" size="lg">
            Verify
          </Button>
        </form>

        {/* Resend code */}
        <div className="mt-4 text-center">
          {cooldown > 0 ? (
            <p className="text-sm text-gray-400">
              Resend code in <span className="font-medium text-gray-600">{cooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resendLoading ? 'Sending…' : "Didn't receive a code? Resend"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
