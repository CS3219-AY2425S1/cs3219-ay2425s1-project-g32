import { useEffect, useLayoutEffect, useState } from 'react';

import { getQuestions } from '@/api/question';
import Skeleton from '@/components/ui/skeleton';
import { TableHeader, TableRow, TableHead, TableBody, Table } from '@/components/ui/table';
import { useToast } from '@/components/ui/toast/use-toast';
import { type Question } from '@/types/question';
import { Role } from '@/types/user';

import CreateQuestionModal from './components/CreateQuestionModal';
import QuestionTableRow from './components/QuestionTableRow';

const QuestionsPage = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getQuestions('', '');
        setQuestions(data);
      } catch (e) {
        toast({ variant: 'destructive', description: 'Error fetching questions' });
      } finally {
        setLoading(false);
      }
    })();
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
        toast({ variant: 'destructive', description: 'Error deleting question' });
      }
    } catch (error) {
      toast({ variant: 'destructive', description: 'Error deleting question' });
    }
  };

  const handleEdit = async (id: string, values: Omit<Question, 'id'>) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/question/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        }
      );

      if (response.ok) {
        const newQuestion = (await response.json()) as Question;
        setQuestions((prevQuestions) =>
          prevQuestions.map((question) => (question.id === newQuestion.id ? newQuestion : question))
        );
        toast({ description: 'Question updated successfully' });
      } else {
        toast({ variant: 'destructive', description: 'Error updating question' });
      }
    } catch (error) {
      toast({ variant: 'destructive', description: 'Error updating question' });
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
        const newQuestion = (await response.json()) as Question;
        setQuestions((prevQuestions) => [...prevQuestions, newQuestion]);
        toast({ description: 'Question created successfully' });
      } else {
        toast({ variant: 'destructive', description: 'Error creating question' });
      }
    } catch (error) {
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
                <QuestionTableRow
                  key={question.id}
                  question={question}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};

QuestionsPage.authenticationEnabled = {
  role: Role.ADMIN,
};

export default QuestionsPage;
