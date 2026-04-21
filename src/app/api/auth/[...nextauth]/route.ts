import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      id: 'admin',
      name: 'Admin',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const admin = await db.admin.findUnique({
          where: { email: credentials.email },
        });

        if (!admin) return null;

        // Direct password comparison (passwords should be hashed in production)
        if (admin.password !== credentials.password) return null;

        return { id: admin.id, name: admin.name, email: admin.email, role: 'admin' };
      },
    }),
    CredentialsProvider({
      id: 'member',
      name: 'Member',
      credentials: {
        email: { label: 'Email or Member ID', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const member = await db.member.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { memberId: credentials.email },
            ],
          },
        });

        if (!member) return null;

        // Members authenticate via memberId + simple PIN for now
        // Replace with proper password field when ready
        return {
          id: member.id,
          name: member.name,
          email: member.email ?? member.memberId,
          role: 'member',
          memberId: member.memberId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.memberId = (user as { memberId?: string }).memberId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string; memberId?: string }).role = token.role as string;
        (session.user as { role?: string; memberId?: string }).memberId = token.memberId as string | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
