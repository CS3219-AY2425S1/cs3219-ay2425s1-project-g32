import { useState, type FC } from 'react';

import { Laptop2, Moon, Sun } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

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
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Chat from './chat';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Props {}

const question = {
  title: 'Question Title',
  description:
    'Question Details Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet lorem at nisi vehicula sagittis. Nullam a venenatis mi. Aliquam faucibus ipsum orci, ut varius ante laoreet ac...',
};

// eslint-disable-next-line arrow-body-style
const LeftPanel: FC<Props> = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { setTheme } = useTheme();
  const onEndSession = () => {
    // TODO: Need to call end
  };
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-5 text-lg font-bold">
          <Link href="/">Peerprep</Link>
        </SidebarHeader>
        <SidebarContent>
          <div className="h-full overflow-scroll rounded-md bg-background p-4 shadow-md">
            <Tabs defaultValue="chat">
              <TabsList>
                <TabsTrigger value="question">Question</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>
              <TabsContent value="question">
                <div className="mb-2 text-2xl font-bold">{question.title}</div>
                <div className="mb-4 text-gray-600">{question.description}</div>
                <div className="mb-4 flex h-40 items-center justify-center rounded border border-gray-300 p-4">
                  <div>Graph Visualization Placeholder</div>
                </div>
              </TabsContent>
              <TabsContent value="chat">
                <Chat />
              </TabsContent>
            </Tabs>
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex gap-x-4">
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
            <Link href="/">
              <Button className="w-full">Return home</Button>
            </Link>
            <Button variant="destructive" onClick={() => setShowConfirm(true)}>
              End Session
            </Button>
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
