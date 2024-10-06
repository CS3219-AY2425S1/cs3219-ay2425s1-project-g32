import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import type { ApiError } from '@/types/api';
import type { User } from '@/types/user';
import type { GetServerSidePropsContext } from 'next/types';

interface SignInResponse extends User {
  accessToken: string;
}

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: 'Credentials',
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Add logic here to look up the user from the credentials supplied
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }
        const body = {
          email: credentials.email,
          password: credentials.password,
        };
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_USERS_BACKEND_URL || ''}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (!res.ok) {
            const data = (await res.json()) as ApiError;
            throw new Error(data.message);
          } else {
            const data = (await res.json()) as SignInResponse;
            console.log(data);
            return data;
          }
        } catch (e) {
          return Promise.reject(e);
        }
        return null;
      },
    }),
    // ...add more providers here
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req'];
  res: GetServerSidePropsContext['res'];
}) => getServerSession(ctx.req, ctx.res, authOptions);
