import { Inter } from 'next/font/google';

import AuthGuard, { type AuthEnabledComponentConfig } from '@/components/authGuard';
import Header from '@/components/header';
import Toaster from '@/components/ui/toast/toaster';
import { SessionProvider } from '@/context/useSession';
import '@/styles/globals.css';
import { cn } from '@/utils/tailwind';

import type { AppProps } from 'next/app';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

type AppAuthProps<T = unknown> = AppProps<T> & {
  Component: Partial<AuthEnabledComponentConfig>;
};

export default function App({ Component, ...pageProps }: AppAuthProps) {
  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main
          className={cn(
            inter.variable,
            'relative flex flex-grow flex-col overflow-hidden font-sans'
          )}
        >
          {Component.authenticationEnabled ? (
            <AuthGuard config={Component.authenticationEnabled}>
              <Component {...pageProps} />
            </AuthGuard>
          ) : (
            <Component {...pageProps} />
          )}
        </main>
      </div>
      <Toaster />
    </SessionProvider>
  );
}
