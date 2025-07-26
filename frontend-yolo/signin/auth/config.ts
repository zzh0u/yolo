import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { handleSignInUser } from "./handler";
import { authOptions } from "./options";

export const { handlers: { GET, POST }, signIn, signOut, auth } = NextAuth(authOptions);