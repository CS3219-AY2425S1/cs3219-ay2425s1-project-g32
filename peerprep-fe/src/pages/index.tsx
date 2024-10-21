import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { useSession } from '@/context/useSession';

export default function Home() {
  const { sessionData } = useSession();

  return (
    <div className="layout">
      <div className="flex flex-col items-start gap-2 px-4 py-8">
        <h1 className="text-3xl font-bold">PeerPrep</h1>
        <p className="text-lg font-light text-foreground">
          Prepare smarter for technical interviews with PeerPrep. Find a peer, collaborate in
          real-time, and build confidence for your dream job.
        </p>
        <div className="flex w-full items-center justify-start gap-2 py-2">
          <Link href={`${sessionData?.user ? '/find-match' : '/auth/signin'}`}>
            <Button size="sm">Get Started</Button>
          </Link>
          <Link href="/find-match">
            <Button variant="ghost" size="sm">
              Start coding
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-background shadow">
        <Image src="/editor.png" alt="Code editor page" width={1600} height={800} />
      </div>
      <div className="py-6">
        <p className="text-balance text-sm leading-loose text-muted-foreground">
          Design copied from&nbsp;
          <a
            href="https://twitter.com/shadcn"
            className="font-medium underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            shadcn
          </a>
          . The source code for this project is available on&nbsp;
          <a
            href="https://github.com/CS3219-AY2425S1/cs3219-ay2425s1-project-g32"
            className="font-medium underline underline-offset-4"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          .
        </p>
      </div>
    </div>
  );
}
