import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: { scope: 'read:user user:email repo' },
      },
    }),
    CredentialsProvider({
      id: 'credentials',
      name: 'Demo Mode',
      credentials: {},
      async authorize() {
        return {
          id: 'dev-user-id',
          name: 'Demo Developer',
          email: 'demo@devnexus.ai',
          image: 'https://avatars.githubusercontent.com/u/583231?v=4',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token || 'mock-github-access-token';
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = (token.accessToken as string) || 'mock-github-access-token';
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  debug: true,
});

export { handler as GET, handler as POST };
