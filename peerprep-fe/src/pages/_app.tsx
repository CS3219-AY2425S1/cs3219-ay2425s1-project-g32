import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { cn } from '@/utils/tailwind';
import Toaster from '@/components/ui/toast/toaster';
import Header from '@/components/header';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const Footer = () => <></>;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
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
        <Footer />
      </div>
      <Toaster />
    </>
  );
}
