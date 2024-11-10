import { Pencil } from 'lucide-react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenuItem } from '@/components/ui/dropdownMenu';
import { type Question } from '@/types/question';

import EditQuestionForm from './EditQuestionForm';

interface EditQuestionModalProps {
  question: Question;
  onEdit: (id: string, values: Omit<Question, 'id'>) => Promise<void>;
}

const EditQuestion: React.FC<EditQuestionModalProps> = (props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
          }}
          className="flex cursor-pointer items-center gap-x-2"
        >
          Edit&nbsp;
          <Pencil className="h-3 w-3" />
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent>
        <EditQuestionForm {...props} />
      </DialogContent>
    </Dialog>
  );
};

export default EditQuestion;
