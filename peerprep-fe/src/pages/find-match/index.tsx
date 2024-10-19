import { Fragment, useState, useCallback, useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { performMatching, pollMatchingStatus } from '@/api/matching';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import BlockSpinning from '@/components/ui/loading/blockSpinning';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/toast/use-toast';
import { useSession } from '@/context/useSession';
import { Role } from '@/types/user';

const FormSchema = z.object({
  difficulty: z.string().min(1, 'Select a difficulty'),
  topic: z.string().min(1, 'Select a topic'),
});

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const TOPICS = ['all', 'dynamic programming', 'tree', 'string', 'arrays'];
const MAX_POLL_COUNT = 3; // Maximum number of poll attempts
const POLL_INTERVAL = 3000; // Poll every 5 seconds

const FindMatchPage = () => {
  const [difficulty, setDifficulty] = useState(+new Date());
  const [topic, setTopic] = useState(+new Date());
  const [loading, setLoading] = useState(true);
  const [matchRequestId, setMatchRequestId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState('');
  const { sessionData } = useSession();
  const pollIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      difficulty: '',
      topic: '',
    },
  });

  const onSubmit = async () => {
    if (!sessionData?.user.id) {
      return;
    }

    setLoading(true);
    setPollCount(0);
    setMatchRequestId(null);

    try {
      const matchId = await performMatching(
        sessionData.user.id,
        form.getValues('difficulty'),
        form.getValues('topic')
      );
      if (!matchId) {
        throw Error();
      }
      setMatchRequestId(matchId);
    } catch (error) {
      setLoading(false);
      setError('An error occurred while finding a match. Please try again.');
    }
  };

  const pollStatus = useCallback(
    async (matchRequestId: string) => {
      if (pollCount >= MAX_POLL_COUNT) {
        setLoading(false);
        setMatchRequestId(null);
        setError('Failed to find a match. Please try again.');
        return;
      }

      try {
        const hasMatch = await pollMatchingStatus(matchRequestId);

        if (hasMatch) {
          setLoading(false);
          setMatchRequestId(null);
          toast({ description: 'Found a match, redirecting you to collaborative page' });
          router.push('/question');
        } else {
          setPollCount((prevCount) => prevCount + 1);
        }
      } catch (error) {
        setLoading(false);
        setMatchRequestId(null);
        if (pollIntervalId.current !== null) {
          clearInterval(pollIntervalId.current);
        }
        setError('An error occurred while checking match status. Please try again.');
      }
    },
    [pollCount, router, toast, setError]
  );

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (matchRequestId) {
      pollIntervalId.current = setInterval(() => {
        pollStatus(matchRequestId);
      }, POLL_INTERVAL);
    }

    if (pollIntervalId.current !== null) {
      return () => clearInterval(pollIntervalId.current as ReturnType<typeof setInterval>);
    }
  }, [matchRequestId, pollStatus]);

  return (
    <>
      <Dialog open={loading} onOpenChange={setLoading}>
        <DialogContent
          // To prevent accidental closure of the dialog when clicking outside bg
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          hideClose
        >
          <DialogHeader>
            <DialogTitle>Finding a match now...</DialogTitle>
            <DialogDescription>
              Closing this popup ends the search and you will need to find match again.
              <BlockSpinning height="100" width="100" />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setLoading(false);
                if (pollIntervalId.current !== null) {
                  clearInterval(pollIntervalId.current);
                }
              }}
            >
              Cancel search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="layout">
        <div className="flex flex-col items-start gap-2 py-8">
          <h1 className="text-3xl font-bold">Find a Match</h1>
          <p className="text-lg font-light text-foreground">
            Select your preferred difficulty and topic you would like to practice.
          </p>
        </div>
        <div className="relative w-[400px]">
          {error && <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">{error}</div>}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className={`flex flex-col gap-y-5 ${loading ? 'opacity-50' : ''}`}>
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="itms-center flex justify-between">
                        <span>Difficulty</span>
                        <Badge
                          onClick={() => {
                            form.resetField('difficulty');
                            setDifficulty(+new Date());
                          }}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                        >
                          Clear
                        </Badge>
                      </FormLabel>
                      <Select
                        disabled={loading}
                        key={difficulty}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DIFFICULTIES?.length ? (
                            DIFFICULTIES?.map((d) => (
                              <Fragment key={d}>
                                <SelectItem className="cursor-pointer" value={d}>
                                  {d}
                                </SelectItem>
                              </Fragment>
                            ))
                          ) : (
                            <div>Error loading schools</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="itms-center flex justify-between">
                        <span>Topic</span>
                        <Badge
                          onClick={() => {
                            form.resetField('topic');
                            setTopic(+new Date());
                          }}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                        >
                          Clear
                        </Badge>
                      </FormLabel>
                      <Select
                        disabled={loading}
                        key={topic}
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TOPICS?.length ? (
                            TOPICS?.map((d) => (
                              <Fragment key={d}>
                                <SelectItem className="cursor-pointer" value={d}>
                                  {d}
                                </SelectItem>
                              </Fragment>
                            ))
                          ) : (
                            <div>Error loading schools</div>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button disabled={loading} className="w-full" type="submit">
                  Find Match
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );
};

FindMatchPage.authenticationEnabled = {
  role: Role.USER,
};

export default FindMatchPage;
