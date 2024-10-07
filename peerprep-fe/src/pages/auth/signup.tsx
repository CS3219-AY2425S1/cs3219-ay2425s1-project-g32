import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { type GetServerSideProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signUp } from '@/api/user';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import Input from '@/components/ui/input';
import { useToast } from '@/components/ui/toast/use-toast';

const FormSchema = z
  .object({
    email: z.string().email(),
    username: z.string().min(1, 'Please enter username'),
    password: z.string().min(1, 'Enter your password nig'),
    confirmPassword: z.string().min(1, 'Enter your password nig'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // You can set the error path to highlight confirmPassword
  });

// eslint-disable-next-line @typescript-eslint/require-await
export const getServerSideProps: GetServerSideProps = async (context) => {
  if (context.req.cookies.auth) {
    return { redirect: { destination: '/', permanent: true } };
  }
  return {
    props: {},
  };
};

export default function Signup() {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async () => {
    try {
      await signUp(form.getValues('username'), form.getValues('email'), form.getValues('password'));
      toast({ description: 'Sign in to access!' });

      router.push('/auth/signin');
    } catch (e) {
      toast({
        variant: 'destructive',
        description: e instanceof Error ? e.message : 'Somethign went wrong',
      });
    }
  };

  return (
    <div className="flex flex-grow flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      <div className="w-72 rounded-lg bg-gray-100 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="confirmPassword"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="mt-6 w-full" type="submit">
              Login
            </Button>
          </form>
        </Form>
        <div className="mt-4">
          <Link href="/auth/signin">
            <Button variant="link" size="sm" className="p-0">
              Have an account? Sign in
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
