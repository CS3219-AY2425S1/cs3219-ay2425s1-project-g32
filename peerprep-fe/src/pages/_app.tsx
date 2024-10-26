import { useEffect } from 'react';

import { Inter } from 'next/font/google';
import { useRouter } from 'next/router';

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
  const router = useRouter();

  useEffect(() => {
    const node = document.getElementById('__next');
    if (node) {
      node.classList.forEach((className: string) => node.classList.remove(className));
      node.classList.add(`page-${router.pathname.slice(1)}`);
    }
  }, [router.pathname]);

  return (
    <SessionProvider>
      <div className="flex min-h-screen flex-col">
        {router.pathname.slice(1) !== 'collab/[roomId]' && <Header />}
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
