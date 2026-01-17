import { Edit, MessageSquarePlus } from 'lucide-react';
import { Button } from '../ui/button';

const CreateComponent = () => {
  return (
    <>
      <Button
        variant={null}
        className="hover:bg-muted/30 bg-background group-data-[state=collapsed]:static group-data-[state=collapsed]:mx-auto"
      >
        <MessageSquarePlus className="size-4 text-muted-foreground" />
      </Button>
    </>
  );
};

export default CreateComponent;
