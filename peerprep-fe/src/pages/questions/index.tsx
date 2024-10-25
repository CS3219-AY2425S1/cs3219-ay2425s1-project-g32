import { useEffect, useLayoutEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import {
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  Table,
  TableCell,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/toast/use-toast';
import { type Question } from '@/types/question';
import { Role } from '@/types/user';
import Label from '@/components/ui/label';
import { api } from '@/utils/api';
import QuestionTableRow from '@/components/questions/QuestionTableRow';
import { Button } from '@/components/ui/button';
import CreateQuestionModal from '@/components/questions/CreateQuestionModal';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api<Question[]>(
        `${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/question`
      );
      setQuestions(data);
    } catch (e) {
      toast({ variant: 'destructive', description: 'Error fetching questions' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [toast]);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/question/${id}`,
        {
          method: 'DELETE',
        }
      );
      if (response.ok) {
        setQuestions((prevQuestions) => prevQuestions.filter((q) => q.id !== id));
        toast({ description: 'Question deleted successfully' });
      } else {
        console.error('Failed to delete question');
        toast({ variant: 'destructive', description: 'Error deleting question' });
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      toast({ variant: 'destructive', description: 'Error deleting question' });
    }
  };

  const handleSubmit = async (values: Omit<Question, 'id'>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        toast({ description: 'Question created successfully' });
      } else {
        console.error('Failed to create question');
        toast({ variant: 'destructive', description: 'Error creating question' });
      }
    } catch (error) {
      console.error('Error creating question:', error);
      toast({ variant: 'destructive', description: 'Error creating question' });
    }
  };

  return (
    <div className="layout my-4">
      <div className="flex justify-between">
        <h1 className="mb-8 text-xl font-medium">Questions</h1>
        <CreateQuestionModal onSubmit={handleSubmit} />
      </div>
      <div>
        <div className="mb-6">Filters</div>
        {!isMounted || loading ? (
          <Skeleton />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-12">Category</TableHead>
                <TableHead className="w-12">Complexity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <QuestionTableRow key={question.id} question={question} onDelete={handleDelete} />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

QuestionsPage.authenticationEnabled = {
  role: Role.USER,
};

export default QuestionsPage;
