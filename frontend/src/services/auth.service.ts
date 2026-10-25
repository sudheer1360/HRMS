import api from '@lib/axios';

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/auth/login', credentials).then(r => r.data),

  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }).then(r => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then(r => r.data),

  logout: () =>
    api.post('/auth/logout').then(r => r.data),

  me: () =>
    api.get('/auth/me').then(r => r.data.data),

  verifyMFA: (sessionToken: string, code: string) =>
    api.post('/auth/mfa/verify', { sessionToken, code }).then(r => r.data),

  resendMFA: (sessionToken: string) =>
    api.post('/auth/mfa/resend', { sessionToken }).then(r => r.data),
};
