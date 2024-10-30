import { useEffect, useState } from 'react';

import { Tag } from 'lucide-react';

import { getQuestion } from '@/api/question';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordian';
import { Badge } from '@/components/ui/badge';
import Label from '@/components/ui/label';
import Separator from '@/components/ui/separator';
import Skeleton from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast/use-toast';
import Difficulty from '@/pages/questions/components/Difficulty';

import { useRoom } from '../useRoom';

import type { Question as QuestionType } from '@/types/question';

const Question = () => {
  const [question, setQuestion] = useState<QuestionType>();
  const { toast } = useToast();
  const { room } = useRoom();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!room) {
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const data = await getQuestion(room.question_id);
        setQuestion(data);
      } catch {
        toast({ variant: 'destructive', description: 'Failed to retrieve question for collab' });
      } finally {
        setLoading(false);
      }
    })();
  }, [toast, room]);

  if (loading) {
    return (
      <div>
        <Skeleton />
        {[
          ...Array.of(10)
            .fill(0)
            .map((_, idx) => idx),
        ].map((i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (!question) {
    return <div>No question</div>;
  }

  return (
    <div className="mt-4 flex flex-col gap-y-5">
      <div>
        <div className="mb-2 flex items-center gap-x-2">
          <div className="text-2xl font-bold">{question.title}</div>
          <Badge variant="outline">
            <Difficulty difficulty={question.complexity} />
          </Badge>
        </div>
        <div>
          <div className="mb-2 flex items-center gap-x-2">
            <Tag className="h-4 w-4" />
            <div className="text-sm font-medium text-muted-foreground">Topics</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {question.category.map((c) => (
              <Badge className="whitespace-nowrap" key={c}>
                {c}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      <Separator />
      <div className="text-muted-foreground">{question.description}</div>
      <Separator />
      <div>
        <div className="mb-4 font-medium">Sample Tests</div>
        {question.sample_input !== 'defaultValue' ? (
          <Accordion type="multiple">
            <AccordionItem value={question.id} key={question.id}>
              <AccordionTrigger>
                <div className="font-semibold">Test Case 1</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-2">
                    <div className="font-medium text-muted-foreground">Sample Input</div>
                    <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 shadow-sm">
                      {question.sample_input}
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="font-medium text-muted-foreground">Sample Output</div>
                    <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 shadow-sm">
                      {question.sample_output}
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="font-medium text-muted-foreground">Explanation</div>
                    <div>{question.explaination || '-'}</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ) : (
          <Label>No test cases for this question</Label>
        )}
      </div>
    </div>
  );
};

export default Question;
