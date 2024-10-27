import { useState } from 'react';

import { EllipsisVertical, Trash } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdownMenu';
import { TableRow, TableCell } from '@/components/ui/table';
import { type Question } from '@/types/question';

import Difficulty from './Difficulty';
import EditQuestion from './EditQuestion';

interface QuestionTableRowProps {
  question: Question;
  onDelete: (id: string) => void;
  onEdit: (id: string, values: Omit<Question, 'id'>) => Promise<void>;
}

const QuestionTableRow: React.FC<QuestionTableRowProps> = ({ question, onDelete, onEdit }) => {
  const [openConfirm, setOpenConfirm] = useState(false);

  return (
    <TableRow key={question.id}>
      <TableCell className="w-[200px] font-medium">{question.title}</TableCell>
      <TableCell className="whitespace-pre-wrap">{question.description}</TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-2">
          {question.category.map((c) => (
            <Badge className="whitespace-nowrap" key={c}>
              {c}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <Difficulty difficulty={question.complexity} />
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button asChild variant="ghost" size="icon">
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <EditQuestion question={question} onEdit={onEdit} />
            <AlertDialog open={openConfirm}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  className="flex cursor-pointer gap-x-2"
                  onClick={() => setOpenConfirm(true)}
                  onSelect={(e) => {
                    e.preventDefault();
                  }}
                >
                  Delete <Trash className="h-3 w-3" />
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setOpenConfirm(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(question.id)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default QuestionTableRow;
