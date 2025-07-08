import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        // Called after successful sign-in
        async signIn({ user }) {
            try {
                // 👇 Post user data to your backend
                await fetch(`${process.env.BACKEND_URL}/api/users`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: user.name,
                        email: user.email,
                        image: user.image,
                    }),
                });
                return true;
            } catch (err) {
                console.error("SignIn Error:", err);
                return false;
            }
        },

        // Add custom fields to the JWT token
        async jwt({ token, user }) {
            if (user) {
                token.uid = user.id;
                token.email = user.email;
                token.picture = user.image;
            }
            return token;
        },

        // Make token accessible in session
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.uid as string | undefined;
                session.user.email = token.email as string | undefined;
                session.user.image = token.picture as string | undefined;
            }
            return session;
        },
    },

    // 👇 Use JWT strategy
    session: {
        strategy: "jwt",
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
