import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

// Very small in-memory login throttle. This helps on a single server instance;
// for serverless/multi-region deployments, replace with a shared store such as
// Upstash Redis (see README "Hardening" section).
const attempts = new Map(); // key: username -> { count, resetAt }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key) {
  const rec = attempts.get(key);
  if (!rec) return false;
  if (Date.now() > rec.resetAt) {
    attempts.delete(key);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function recordFailure(key) {
  const rec = attempts.get(key);
  if (!rec || Date.now() > rec.resetAt) {
    attempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
  } else {
    rec.count += 1;
  }
}

function clearFailures(key) {
  attempts.delete(key);
}

export const authOptions = {
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 hour sessions
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const username = (credentials?.username || '').trim();
        const password = credentials?.password || '';
        if (!username || !password) return null;

        if (isRateLimited(username)) {
          throw new Error('Too many attempts. Try again in a few minutes.');
        }

        const user = await prisma.adminUser.findUnique({ where: { username } });
        if (!user) {
          recordFailure(username);
          return null;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
          recordFailure(username);
          return null;
        }

        clearFailures(username);
        return { id: user.id, name: user.username, role: 'admin' };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.username = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.role = token.role;
      session.user.name = token.username;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
