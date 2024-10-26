import { useState, type FC } from 'react';

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
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import Chat from './chat';
import Link from 'next/link';

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
  const onEndSession = () => {
    // TODO: Need to call end
  };
  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-5 text-lg font-bold">Peerprep</SidebarHeader>
        <SidebarContent>
          <div className="h-full overflow-scroll rounded-md bg-white p-4 shadow-md">
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
          <div className="grid grid-cols-2 gap-4">
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
