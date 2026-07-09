import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { env } from "@/lib/config/env";

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt"
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {}
      },
      async authorize(credentials) {
        if (
          credentials.email === env.ADMIN_EMAIL &&
          credentials.password === env.ADMIN_PASSWORD
        ) {
          return {
            id: "local-admin",
            email: env.ADMIN_EMAIL,
            name: "Clinic Admin",
            role: "admin"
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.name = user.name;
        token.email = user.email;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user = {
          ...session.user,
          id: token.sub,
          name: token.name,
          email: token.email,
          role: token.role as string | undefined
        } as typeof session.user;
      }

      return session;
    },
    authorized({ auth, request }) {
      const isAdminPath = request.nextUrl.pathname.startsWith("/admin");
      if (!isAdminPath) {
        return true;
      }

      return !!auth?.user;
    }
  },
  pages: {
    signIn: "/admin/login"
  }
};
