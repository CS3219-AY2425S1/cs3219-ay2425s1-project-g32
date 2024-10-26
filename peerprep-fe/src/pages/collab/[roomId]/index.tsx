import React from 'react';

import { Role } from '@/types/user';

import CodeAndSubmit from './codeAndSubmit';
import LeftPanel from './leftPanel';
import { RoomProvider } from './useRoomContext';

const CollabPage = () => {
  return (
    <RoomProvider>
      <div className="flex flex-grow gap-x-4 overflow-hidden bg-gray-100 p-4">
        <LeftPanel />
        <CodeAndSubmit />
      </div>
    </RoomProvider>
  );
};

CollabPage.authenticationEnabled = {
  role: Role.USER,
};

export default CollabPage;
