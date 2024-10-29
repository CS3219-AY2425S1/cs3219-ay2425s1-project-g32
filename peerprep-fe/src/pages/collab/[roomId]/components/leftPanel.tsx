import { useState } from 'react';

import { Laptop2, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';

import { endSession } from '@/api/code';
import {
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import Label from '@/components/ui/label';
import Separator from '@/components/ui/separator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/toast/use-toast';
import { useSession } from '@/context/useSession';

import Chat from './chat';
import Question from './question';

const LeftPanel = () => {
  const router = useRouter();
  const { roomId } = router.query;
  const [tab, setTab] = useState('question');
  const [showConfirm, setShowConfirm] = useState(false);
  const { setTheme } = useTheme();
  const { sessionData } = useSession();
  const { toast } = useToast();

  const onEndSession = async () => {
    // TODO: Need to call end
    if (!sessionData || !roomId) return;
    try {
      await endSession(roomId as string, sessionData.accessToken);
      router.push('/');
      toast({ description: 'Session ended, goodbye' });
    } catch {
      toast({ variant: 'destructive', description: 'Something wentw rong in the server' });
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="flex flex-row items-center gap-x-2 p-5">
          <Link href="/">
            <div className="text-lg font-bold">Peerprep</div>
          </Link>
          <Label className="mt-1">[Session with Paul]</Label>
        </SidebarHeader>
        <Separator />
        <SidebarContent>
          <div className="h-full overflow-scroll rounded-md bg-background p-4 shadow-md">
            <Tabs defaultValue={tab} onValueChange={(val) => setTab(val)}>
              <TabsList>
                <TabsTrigger value="question">Question</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <div style={{ display: tab === 'question' ? 'block' : 'none' }}>
                <Question />
              </div>
              <div style={{ display: tab === 'chat' ? 'block' : 'none' }}>
                <Chat />
              </div>
            </Tabs>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex justify-between">
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
            <div className="flex gap-x-4">
              <Link href="/">
                <Button className="w-full">Return home</Button>
              </Link>
              <Button variant="destructive" onClick={() => setShowConfirm(true)}>
                End Session
              </Button>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently end your session for you and the
              other person.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowConfirm(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onEndSession}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LeftPanel;
