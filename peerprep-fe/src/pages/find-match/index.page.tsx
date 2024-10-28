import { Fragment, useState, useCallback, useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { cancelMatch, performMatching, pollMatchingStatus, PollStatus } from '@/api/matching';
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

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = [
  'All',
  'Dynamic Programming',
  'Strings',
  'Arrays',
  'Bit Manipulation',
  'Algorithms',
  'Brainteaser',
  'Data Structures',
  'Databases',
];

const POLL_INTERVAL = 3000; // Poll every 5 seconds

const FindMatchPage = () => {
  const [difficulty, setDifficulty] = useState(+new Date());
  const [topic, setTopic] = useState(+new Date());
  const [matchRequestId, setMatchRequestId] = useState('');
  const [error, setError] = useState('');
  const [creatingRoom, setCreatingRoom] = useState(false);
  const { sessionData } = useSession();
  const pollIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);
  const [time, setTime] = useState(0);
  const [displayHint, setDisplayHint] = useState(false);
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
    if (!sessionData) {
      return;
    }

    setCreatingRoom(false);
    setTime(0);
    setMatchRequestId('');
    setDisplayHint(false);

    try {
      const res = await performMatching(
        form.getValues('difficulty'),
        form.getValues('topic'),
        sessionData.accessToken
      );

      setMatchRequestId(res.id);
      setDisplayHint(!res.isNew);
    } catch (error) {
      setError('An error occurred while finding a match. Please try again.');
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (matchRequestId) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    }

    return () => clearInterval(interval);
  }, [matchRequestId]);

  const pollStatus = useCallback(
    async (matchRequestId: string) => {
      if (!sessionData) {
        setMatchRequestId('');
        setError('Failed to find a match. Please try again.');
        return;
      }

      try {
        const status = await pollMatchingStatus(matchRequestId, sessionData.accessToken);
        switch (status) {
          case PollStatus.MATCHED: {
            setMatchRequestId('');
            toast({ description: 'Found a match, redirecting you to collaborative page' });
            router.push('/code/123');
            break;
          }
          case PollStatus.MATCHING: {
            break;
          }
          case PollStatus.CANCELLED:
            setError('This request has been cancelled, please try again');
            setMatchRequestId('');
            break;
          case PollStatus.TIMEOUT: {
            setError('Timeout finding a match, please try again later');
            setMatchRequestId('');
            break;
          }
          case PollStatus.CREATING_ROOM: {
            setCreatingRoom(true);
            break;
          }
          default: {
            throw Error();
          }
        }
      } catch (error) {
        setMatchRequestId('');
        if (pollIntervalId.current !== null) {
          clearInterval(pollIntervalId.current);
        }
        setError('An error occurred while checking match status. Please try again.');
      }
    },
    [router, toast, setError, sessionData]
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
      <Dialog open={!!matchRequestId}>
        <DialogContent
          // To prevent accidental closure of the dialog when clicking outside bg
          onInteractOutside={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          hideClose
        >
          <DialogHeader>
            <DialogTitle>{!creatingRoom ? 'Finding a match now...' : 'FOUND a match'}</DialogTitle>
            <DialogDescription>
              {!creatingRoom ? (
                <>
                  Closing this popup ends the search and you will need to find match again.
                  <br />
                  {displayHint && (
                    <>
                      You have previously searched for a match and we are still looking for that
                      match.
                      <br />
                      Please cancel if you would like to reset make a new search
                    </>
                  )}
                </>
              ) : (
                <div>
                  Found a match, creating the room now. <br /> Will redirect you when room is
                  created
                </div>
              )}
              <BlockSpinning height="100" width="100" />
              <strong>Time elapsed</strong>:&nbsp;{Math.floor(time / 1000)}s
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!sessionData?.accessToken || !matchRequestId) {
                  return;
                }
                await cancelMatch(matchRequestId, sessionData?.accessToken);
                if (pollIntervalId.current !== null) {
                  clearInterval(pollIntervalId.current);
                }
                setMatchRequestId('');
              }}
            >
              Cancel search
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="layout mt-8 flex items-center gap-x-8">
        <div>
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
                <div className={`flex flex-col gap-y-5 ${matchRequestId ? 'opacity-50' : ''}`}>
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
                          disabled={!!matchRequestId}
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
                          disabled={!!matchRequestId}
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
                  <Button disabled={!!matchRequestId} className="w-full" type="submit">
                    Find Match
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
        <div>
          <Image src="/find-match.svg" alt="Find match" width={500} height={500} />
        </div>
      </div>
    </>
  );
};

FindMatchPage.authenticationEnabled = {
  role: Role.USER,
};

export default FindMatchPage;
