import type { AuthOptions, DefaultSession, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/database/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

type JwtToken = {
  name?: string | null;
  email?: string | null;
  picture?: string | null;
  sub?: string;
  userId?: string;
  iat?: number;
  exp?: number;
  jti?: string;
};

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user || !user.passwordHash) return null;
        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
        } satisfies { id: string; email: string; name?: string; image?: string };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as JwtToken).userId = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as JwtToken;
      if (t?.userId) {
        session.user = { ...session.user, id: t.userId };
      }
      return session as Session;
    },
  },
  pages: {
    signIn: "/login",
  },
};
