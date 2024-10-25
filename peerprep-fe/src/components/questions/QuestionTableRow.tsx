import { useEffect, useLayoutEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from '@/components/ui/table';
import { type Question } from '@/types/question';
import Label from '@/components/ui/label';

interface QuestionTableRowProps {
  question: Question;
  onDelete: (id: string) => void;
}

const Difficulty = ({ difficulty }: { difficulty: string }) => {
  let className = '';
  switch (difficulty) {
    case 'Easy':
      className = 'text-green-600';
      break;
    case 'Medium':
      className = 'text-orange-500';
      break;
    case 'Hard':
      className = 'text-red-600';
      break;
    default:
      break;
  }
  return <div className={className}>{difficulty}</div>;
};

const QuestionTableRow: React.FC<QuestionTableRowProps> = ({ question, onDelete }) => {
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
          <Label className="cursor-pointer text-yellow-600" onClick={() => {}}>
            Edit
          </Label>
          <Label className="cursor-pointer text-red-500" onClick={() => onDelete(question.id)}>
            Delete
          </Label>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default QuestionTableRow;
