import { Fragment, useState, useCallback, useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { performMatching, pollMatchingStatus } from '@/api/matching';

const FormSchema = z.object({
  difficulty: z.string().min(1, 'Select a difficulty'),
  topic: z.string().min(1, 'Select a topic'),
});

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const TOPICS = ['all', 'dynamic programming', 'tree', 'string', 'arrays'];

export default function FindMatchPage() {
  const [difficulty, setDifficulty] = useState(+new Date());
  const [topic, setTopic] = useState(+new Date());
  const [loading, setLoading] = useState(false);
  const [matchRequestId, setMatchRequestId] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);
  const MAX_POLL_COUNT = 30; // Maximum number of poll attempts
  const POLL_INTERVAL = 5000; // Poll every 5 seconds
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const ERROR_TIMEOUT = 5000; // Error message disappears after 5 seconds

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      difficulty: '',
      topic: '',
    },
  });

  const setTemporaryErrorMessage = useCallback((message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), ERROR_TIMEOUT);
  }, []);

  const onSubmit = async () => {
    setLoading(true);
    setPollCount(0);
    setMatchRequestId(null);

    const formData = {
      user_id: "placeholder", // Update with actual user_id
      complexity: form.getValues('difficulty'),
      category: form.getValues('topic'),
    };

    try {
      const result = await performMatching(formData.user_id, formData.complexity, formData.category);
      console.log('Matching result:', result);
      setMatchRequestId(result.data.matchRequest_id);
    } catch (error) {
      console.error('Error during matching:', error);
      setLoading(false);
      setTemporaryErrorMessage('An error occurred while finding a match. Please try again.');
    }
  };

  const pollStatus = useCallback(async () => {
    if (!matchRequestId) return;

    try {
      const pollResult = await pollMatchingStatus(matchRequestId);
      console.log('Poll result:', pollResult);

      if (pollResult.data.has_match) {
        // Handle successful match
        console.log('Match found!');
        setLoading(false);
        setMatchRequestId(null);
        // Navigate to the next page or show match details
      } else if (pollResult.data.has_match === false) {
        setPollCount((prevCount) => prevCount + 1);
        console.log('Poll count:', pollCount);
      } else {
        // Handle failed match
        console.log('Matching failed');
        setLoading(false);
        setMatchRequestId(null);
        setTemporaryErrorMessage('Failed to find a match. Please try again.');
      }
    } catch (error) {
      console.error('Error during polling:', error);
      setLoading(false);
      setMatchRequestId(null);
      setTemporaryErrorMessage('An error occurred while checking match status. Please try again.');
    }
  }, [matchRequestId, pollCount]);

  useEffect(() => {
    if (matchRequestId && pollCount < MAX_POLL_COUNT) {
      const timer = setTimeout(() => {
        pollStatus();
      }, POLL_INTERVAL);

      return () => clearTimeout(timer);
    } else if (pollCount >= MAX_POLL_COUNT) {
      console.log('Matching failed');
      setLoading(false);
      setMatchRequestId(null);
      setTemporaryErrorMessage('Failed to find a match. Please try again.');
    }
  }, [matchRequestId, pollCount, pollStatus]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      <div className="relative w-72 rounded-lg bg-gray-100 p-4">
        {loading && (
          <Loading className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
        )}
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-100 p-4 text-red-700">
            {errorMessage}
          </div>
        )}
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
}
