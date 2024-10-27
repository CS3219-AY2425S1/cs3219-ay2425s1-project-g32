import { useEffect, useState } from 'react';

import { Tag } from 'lucide-react';

import { getQuestion } from '@/api/question';
import Difficulty from '@/components/questions/Difficulty';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordian';
import { Badge } from '@/components/ui/badge';
import Separator from '@/components/ui/separator';
import { useToast } from '@/components/ui/toast/use-toast';

import type { Question as QuestionType } from '@/types/question';

const testCases = [
  {
    id: 1,
    description: 'Test case 1',
    sampleInput: `STDIN           Function
-----           -------
2             → number of queries, q = 2
car 151 km/h  → query parameters = ["car 151 km/h", "boat 77"]
boat 77`,
    sampleOutput: `Car with the maximum speed of 151 km/h
Boat with the maximum speed of 77 knots`,
    explanation: '',
  },
  {
    id: 2,
    description: 'Test case 2',
    sampleInput: `STDIN         Function
-----         --------
3           → number of queries, q = 2
boat 101    → query parameters = ["boat 101", "car 120 mph", "car 251 km/h"]
car 120 mph
car 251 km/h`,
    sampleOutput: `Boat with the maximum speed of 101 knots
Car with the maximum speed of 120 mph
Car with the maximum speed of 251 km/h`,
    explanation: '',
  },
];

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
        <Accordion type="multiple">
          {testCases.map((testCase) => (
            <AccordionItem value={testCase.id.toString()} key={testCase.id}>
              <AccordionTrigger>
                <div className="font-semibold">{testCase.description}</div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-y-4">
                  <div className="flex flex-col gap-y-2">
                    <div className="font-medium text-muted-foreground">Sample Input</div>
                    <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 shadow-sm">
                      {testCase.sampleInput}
                    </div>
                  </div>
                  <div className="flex flex-col gap-y-2">
                    <div className="font-medium text-muted-foreground">Sample Output</div>
                    <div className="whitespace-pre-wrap rounded-lg bg-muted p-4 shadow-sm">
                      {testCase.sampleOutput}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-muted-foreground">Explanation</div>
                    <div>{testCase.explanation || '-'}</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Question;
