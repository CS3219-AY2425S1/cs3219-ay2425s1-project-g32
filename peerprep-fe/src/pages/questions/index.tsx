'use client';

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
import { api } from '@/utils/api';

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
export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // To fix hydration issue with shadcn table: https://github.com/shadcn-ui/ui/issues/1577
  useLayoutEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api<Question[]>(
          `${process.env.NEXT_PUBLIC_QUESTIONS_BACKEND_URL || ''}/question`
        );
        setQuestions(data);
      } catch (e) {
        toast({ variant: 'destructive', description: 'Error fetching questions' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="layout my-4">
      <h1 className="mb-8 text-xl font-medium">Questions</h1>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
