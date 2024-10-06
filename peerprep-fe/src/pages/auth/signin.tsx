import { type FC } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
import { getServerAuthSession } from '@/utils/auth';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next/types';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Enter your password nig'),
});

export const getServerSideProps: GetServerSideProps<{ errorCode: string | null }> = async (
  context
) => {
  const session = await getServerAuthSession(context);

  // If the user is already logged in, redirect.
  // Note: Make sure not to redirect to the same page
  // To avoid an infinite loop!
  if (session) {
    return { redirect: { destination: '/', permanent: true } };
  }
  return {
    props: {
      errorCode: (context.query.error as string) || null,
    },
  };
};

const Error: FC<{ errorCode: string }> = ({ errorCode }) => {
  switch (errorCode) {
    case 'Wrong email and/or password':
      return <div>{errorCode}</div>;
    case 'CredentialsSignin':
      return <div>WRONG CREDENTIALS FATASS</div>;
    case 'OAuthAccountNotLinked':
      return (
        <span>
          You have signed in with another method previously. Please try again with the same method.
        </span>
      );
    case 'SessionRequired':
      return <span>Please sign in to access this page</span>;
    default:
      return <span>Unknown error</span>;
  }
};

export const SignInPage = ({
  errorCode,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = () => {
    console.log(form.getValues('email'));
    console.log(form.getValues('password'));
    signIn('credentials', {
      email: form.getValues('email'),
      password: form.getValues('password'),
    });
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      {errorCode && (
        <div className="text mb-5 flex items-center rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white">
          <AlertCircle className="mr-2" />
          <Error errorCode={errorCode} />
        </div>
      )}
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
                <FormItem>
                  <FormLabel>Password</FormLabel>
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
      </div>
    </div>
  );
};

export default SignInPage;
