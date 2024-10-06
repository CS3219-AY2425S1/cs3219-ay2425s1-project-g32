import { zodResolver } from '@hookform/resolvers/zod';
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

const FormSchema = z
  .object({
    username: z.string().min(1, 'Please enter username'),
    password: z.string().min(1, 'Enter your password nig'),
    confirmPassword: z.string().min(1, 'Enter your password nig'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword'], // You can set the error path to highlight confirmPassword
  });

export function getServerSideProps() {
  // Some logic to determine if a redirect is needed
  const isAuthenticated = true; // Replace with your logic

  if (isAuthenticated) {
    return {
      redirect: {
        destination: '/questions', // Replace with your target page
        permanent: false, // Set to true for a permanent redirect (301)
      },
    };
  }

  // Otherwise, return your props
  return {
    props: {}, // Your props here
  };
}

export default function Signup() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = () => {
    console.log(form.getValues('username'));
    console.log(form.getValues('password'));
    console.log(form.getValues('confirmPassword'));
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-y-8">
      <div className="text-4xl font-bold">PeerPrep</div>
      <div className="w-72 rounded-lg bg-gray-100 p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
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
                <FormItem>
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
      </div>
    </div>
  );
}
