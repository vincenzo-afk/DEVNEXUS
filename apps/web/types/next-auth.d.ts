import NextAuth from 'next-auth';

declare module 'next-auth' {
  /**
   * Extends the built-in Session type to include the GitHub OAuth access token.
   * This token is stored server-side in the JWT and forwarded to the client
   * session so API routes can make authenticated GitHub requests.
   */
  interface Session {
    /** GitHub OAuth access token with scopes: read:user, user:email, repo */
    accessToken?: string;
    user: {
      username?: string;
    } & import('next-auth').DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the built-in JWT type to persist the GitHub access token
   * between requests via the jwt() callback.
   */
  interface JWT {
    accessToken?: string;
    username?: string;
  }
}
