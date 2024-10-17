import { Fragment, useState, useCallback, useEffect, useRef } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { performMatching, pollMatchingStatus } from '@/api/matching';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Loading from '@/components/ui/loading/loading';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSession } from '@/context/useSession';
import { Role } from '@/types/user';

const FormSchema = z.object({
  difficulty: z.string().min(1, 'Select a difficulty'),
  topic: z.string().min(1, 'Select a topic'),
});

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const TOPICS = ['all', 'dynamic programming', 'tree', 'string', 'arrays'];
const MAX_POLL_COUNT = 30; // Maximum number of poll attempts
const POLL_INTERVAL = 5000; // Poll every 5 seconds

const FindMatchPage = () => {
  const [difficulty, setDifficulty] = useState(+new Date());
  const [topic, setTopic] = useState(+new Date());
  const [loading, setLoading] = useState(false);
  const [matchRequestId, setMatchRequestId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState('');
  const { sessionData } = useSession();
  const pollIntervalId = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const pollStatus = useCallback(async () => {
    if (!matchRequestId) return;
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
      } else {
        setPollCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      setLoading(false);
      setMatchRequestId(null);
      setPollCount(0);
      if (pollIntervalId.current !== null) {
        clearInterval(pollIntervalId.current);
      }
      setError('An error occurred while checking match status. Please try again.');
    }
  }, [matchRequestId, pollCount, setError]);

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    pollIntervalId.current = setInterval(() => {
      pollStatus();
    }, POLL_INTERVAL);
    // pollStatus(); // call on mount
    if (pollIntervalId.current !== null) {
      return () => clearInterval(pollIntervalId.current as ReturnType<typeof setInterval>);
    }
  }, [matchRequestId, pollCount, pollStatus, setError]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      <div className="relative w-72 rounded-lg bg-gray-100 p-4">
        {loading && (
          <Loading className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
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
              <Button className="w-full" type="submit">
                Find Match
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

FindMatchPage.authenticationEnabled = {
  role: Role.USER,
};

export default FindMatchPage;
