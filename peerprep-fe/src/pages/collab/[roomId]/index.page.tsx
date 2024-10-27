import React from 'react';

import { SidebarProvider } from '@/components/ui/sidebar';
import { Role } from '@/types/user';

import CodeAndSubmit from './codeAndSubmit';
import LeftPanel from './leftPanel';
import { RoomProvider } from './useRoom';

const CollabPage = () => {
  return (
    <RoomProvider>
      <SidebarProvider>
        <LeftPanel />
        <CodeAndSubmit />
      </SidebarProvider>
    </RoomProvider>
  );
};

CollabPage.authenticationEnabled = {
  role: Role.USER,
};

export default CollabPage;
