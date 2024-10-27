import Link from 'next/link';

import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="layout my-6 flex max-w-screen-lg flex-col justify-between gap-8 sm:my-12 sm:flex-row sm:items-center">
      <div className="text-center sm:text-left">
        <div className="mb-3 text-6xl font-semibold">404</div>
        <div className="text-xl font-bold">PAGE NOT FOUND</div>
        <hr className="mx-auto mb-4 mt-6 w-16 sm:ml-0" />
        <div className="text-sm text-muted-foreground">
          We can&apos;t seem to find the page you&apos;re looking for
        </div>
        <div className="mt-5">
          <Link href="/">
            <Button variant="outline">Back home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
