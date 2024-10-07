import { Fragment, useState } from 'react';

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

const FormSchema = z.object({
  difficulty: z.string().min(1, 'Select a difficulty'),
  topic: z.string().min(1, 'Select a topic'),
});

const DIFFICULTIES = ['all', 'easy', 'medium', 'hard'];
const TOPICS = ['all', 'dynamic programming', 'tree', 'string', 'arrays'];

export default function FindMatchPage() {
  // the 2 states are used to clear
  const [difficulty, setDifficulty] = useState(+new Date());
  const [topic, setTopic] = useState(+new Date());
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      difficulty: '',
      topic: '',
    },
  });

  const onSubmit = () => {
    console.log(form.getValues('topic'));
    console.log(form.getValues('difficulty'));
    setLoading(true);
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      <div className="relative w-72 rounded-lg bg-gray-100 p-4">
        {loading && (
          <Loading className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
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
