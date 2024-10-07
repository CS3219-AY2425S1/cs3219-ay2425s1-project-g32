import { zodResolver } from '@hookform/resolvers/zod';
import { setCookie } from 'cookies-next';
import { AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { signIn } from '@/api/user';
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
import { useSession, type LocalStorageJWT } from '@/context/useSession';

import type { GetServerSideProps, InferGetServerSidePropsType } from 'next/types';

const FormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Enter your password nig'),
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

export const SignInPage = ({
  errorCode,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const router = useRouter();
  const { toast } = useToast();
  const { initAuth } = useSession();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async () => {
    try {
      const data = await signIn(form.getValues('email'), form.getValues('password'));
      toast({ description: 'Sign in!' });
      const jwt: LocalStorageJWT = {
        accessToken: data.data.accessToken,
      };
      initAuth(jwt);
      setCookie('auth', JSON.stringify(jwt), { maxAge: 10 * 1000 });
      router.push('/');
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
      {errorCode && (
        <div className="text mb-5 flex items-center rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-white">
          <AlertCircle className="mr-2" />
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
        <div className="mt-4">
          <Link href="/auth/signup">
            <Button variant="link" size="sm" className="p-0">
              Create an account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
