import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { MessageSquarePlus, X } from 'lucide-react';
import Friends from './Friends';
import CreateGroupTab from './CreateGroupTab';
import AddFriendTab from './AddFriendTab';
import { useState } from 'react';

const ManagementDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={null}
          className="hover:bg-muted/30 bg-background group-data-[state=collapsed]:static group-data-[state=collapsed]:mx-auto"
        >
          <MessageSquarePlus className="size-4 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          {/* Tiêu đề và mô tả của dialog */}
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>

          {/* ======================== */}

          <Tabs defaultValue="friends" className="">
            <TabsList className="w-full">
              <TabsTrigger value="friends">Bạn bè</TabsTrigger>
              <TabsTrigger value="create-group">Tạo nhóm</TabsTrigger>
              <TabsTrigger value="add-friend">Kết bạn</TabsTrigger>
            </TabsList>
            {/* Friends */}
            <TabsContent value="friends">
              <Friends />
            </TabsContent>
            {/* Create group */}
            <TabsContent value="create-group">
              <CreateGroupTab onSuccess={() => setOpen(false)} />
            </TabsContent>
            {/* Add friend */}
            <TabsContent value="add-friend">
              <AddFriendTab />
            </TabsContent>
          </Tabs>

          {/* ======================== */}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ManagementDialog;
