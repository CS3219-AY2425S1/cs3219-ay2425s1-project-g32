import { type FC } from 'react';

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
  return (
    <div className="w-[450px] overflow-scroll rounded-md bg-white p-4 shadow-md">
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
  );
};

export default LeftPanel;
