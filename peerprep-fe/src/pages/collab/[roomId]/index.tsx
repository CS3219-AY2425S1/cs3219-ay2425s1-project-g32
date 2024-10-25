import React from 'react';

import { useRouter } from 'next/router';

import { Role } from '@/types/user';

import Chat from './chat';
import CodeAndSubmit from './codeAndSubmit';

const CollabPage = () => {
  const router = useRouter();
  const { roomId } = router.query;

  const question = {
    title: 'Question Title',
    description:
      'Question Details Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla sit amet lorem at nisi vehicula sagittis. Nullam a venenatis mi. Aliquam faucibus ipsum orci, ut varius ante laoreet ac...',
  };

  return (
    <div className="flex flex-grow gap-x-4 overflow-hidden bg-gray-100 p-4">
      <div className="w-[450px] overflow-scroll rounded-md bg-white p-4 shadow-md">
        <div className="mb-2 text-2xl font-bold">{question.title}</div>
        <div className="mb-4 text-gray-600">{question.description}</div>
        <div className="mb-4 flex h-40 items-center justify-center rounded border border-gray-300 p-4">
          <div>Graph Visualization Placeholder</div>
        </div>
        <Chat />
      </div>
      <CodeAndSubmit roomId={roomId as string} />
    </div>
  );
};

CollabPage.authenticationEnabled = {
  role: Role.USER,
};

export default CollabPage;
