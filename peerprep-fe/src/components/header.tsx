import { deleteCookie } from 'cookies-next';
import { Sun, Moon, Laptop2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import { useSession } from '@/context/useSession';

import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdownMenu';

const Header = () => {
  const { setTheme } = useTheme();
  const { sessionData } = useSession();
  const onLogout = () => {
    // signout
    deleteCookie('auth');
    window.location.reload();
  };

  return (
    <header className="shadow">
      <div className="layout flex justify-between py-5 pt-5">
        <h1 className="text-2xl font-medium">
          <Link href="/">Peerprep</Link>
        </h1>
        <nav className="flex items-center gap-x-5">
          <Link href="/questions">
            <Button className="font-semibold" variant="ghost">
              View Questions
            </Button>
          </Link>
          <Link href="/find-match">
            <Button className="font-semibold" variant="ghost">
              FInd Match
            </Button>
          </Link>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Laptop2 className="mr-2 h-4 w-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {sessionData ? (
            <Button onClick={onLogout}>Log out</Button>
          ) : (
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
