import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { handleSignInUser } from "./handler";



export const authOptions: NextAuthOptions = {
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })] : []),
    ...(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? [GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })] : []),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }) {
      await handleSignInUser(user, account);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uuid = user.id || '';
        token.nickname = user.name || '';
        token.avatar_url = user.image || '';
        token.created_at = new Date().toISOString();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.uuid = token.uuid;
        session.user.nickname = token.nickname;
        session.user.avatar_url = token.avatar_url;
        session.user.created_at = token.created_at;
      }
      return session;
    },
  },
};