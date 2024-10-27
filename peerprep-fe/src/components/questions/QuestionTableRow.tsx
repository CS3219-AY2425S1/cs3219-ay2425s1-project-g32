import { Badge } from '@/components/ui/badge';
import Label from '@/components/ui/label';
import { TableRow, TableCell } from '@/components/ui/table';
import { type Question } from '@/types/question';

import Difficulty from './Difficulty';
import EditQuestionModal from './EditQuestionModal';

interface QuestionTableRowProps {
  question: Question;
  onDelete: (id: string) => void;
  onEdit: (id: string, values: Omit<Question, 'id'>) => Promise<void>;
}

const QuestionTableRow: React.FC<QuestionTableRowProps> = ({ question, onDelete, onEdit }) => {
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
        <div className="flex space-x-4">
          <EditQuestionModal question={question} onEdit={onEdit} />
          <Label className="cursor-pointer text-red-500" onClick={() => onDelete(question.id)}>
            Delete
          </Label>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default QuestionTableRow;
