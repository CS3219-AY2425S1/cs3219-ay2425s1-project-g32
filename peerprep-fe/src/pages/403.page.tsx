import Link from 'next/link';

import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="layout my-6 flex max-w-screen-lg flex-col justify-between gap-8 sm:my-12 sm:flex-row sm:items-center">
      <div className="">
        <div className="mb-3 text-6xl font-semibold">403</div>
        <div className="text-xl font-bold">UNAUTHORIZED</div>
        <hr className="mb-4 mt-6 w-16" />
        <div>You don&apos;t seem to have permission to access this page</div>
        <ul className="list-disc pl-5 pt-2 text-sm text-muted-foreground">
          <li>Ensure you are logged in to the correct account</li>
          <li>Try again later</li>
        </ul>
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
