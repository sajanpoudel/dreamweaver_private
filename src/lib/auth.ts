import { NextAuthOptions } from 'next-auth';
import { db } from '@/lib/prisma';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';

interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  bio?: string | null;
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt'
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com"
        },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email
          }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          bio: user.bio,
        } as ExtendedUser;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            // Create new user if they don't exist
            await db.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
              }
            });
          }
          return true;
        } catch (error) {
          console.error('Error during Google sign in:', error);
          return false;
        }
      }
      return true;
    },
    session: ({ session, token }) => {
      console.log('Session Callback - Token:', token);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub as string,
          bio: token.bio as string | null,
        },
      };
    },
    jwt: async ({ token, user }) => {
      console.log('JWT Callback - User:', user);
      if (user) {
        const extendedUser = user as ExtendedUser;
        return {
          ...token,
          sub: extendedUser.id,
          bio: extendedUser.bio,
        };
      }
      return token;
    },
  },
}; 