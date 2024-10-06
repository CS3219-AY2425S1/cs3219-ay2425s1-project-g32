import { Inter } from 'next/font/google';
import { SessionProvider } from 'next-auth/react';

import Header from '@/components/header';
import Toaster from '@/components/ui/toast/toaster';
import '@/styles/globals.css';
import { cn } from '@/utils/tailwind';

import type { AppProps } from 'next/app';
import type { Session } from 'next-auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps<{ session: Session | null }>) {
  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main
          className={cn(
            inter.variable,
            'relative flex flex-grow flex-col overflow-hidden font-sans'
          )}
        >
          <Component {...pageProps} />
        </main>
      </div>
      <Toaster />
    </SessionProvider>
  );
}
