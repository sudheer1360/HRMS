import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@store/index';
import { Spinner } from '@components/ui/Input';
import App from './App';

export function Providers() {
  return (
    <Provider store={store}>
      {/* PersistGate delays rendering until persisted auth state is rehydrated.
          Without this, AuthGuard fires before tokens are loaded and redirects to /login. */}
      <PersistGate loading={<Spinner />} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
}
