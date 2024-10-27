import { useEffect, useState } from 'react';

import { getQuestion } from '@/api/question';
import { useToast } from '@/components/ui/toast/use-toast';

import type { Question as QuestionType } from '@/types/question';

const Question = () => {
  const [question, setQuestion] = useState<QuestionType>();
  const { toast } = useToast();
  const questionId = '66f81429929fa07cb66812c7'; // TODO: Get from backend

  useEffect(() => {
    (async () => {
      try {
        const data = await getQuestion(questionId);
        setQuestion(data);
      } catch {
        toast({ variant: 'destructive', description: 'Failed to retrieve question for collab' });
      }
    })();
  }, [toast]);

  if (!question) {
    return <div>No question</div>;
  }

  return (
    <div className="mt-4">
      <div className="mb-6 text-2xl font-bold">{question.title}</div>
      <div className="text-muted-foreground">{question.description}</div>
      <div className="flex h-40 items-center justify-center rounded border border-gray-300 p-4">
        <div>Graph Visualization Placeholder</div>
      </div>
    </div>
  );
};

export default Question;
