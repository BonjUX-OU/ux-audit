import NextAuth, { NextAuthOptions, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";

// Define custom types for the NextAuth user
interface UserSession extends NextAuthUser {
  isProfileCompleted?: boolean;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Handle the case where credentials might be undefined
        if (!credentials) {
          return null;
        }

        await dbConnect();
        try {
          const user = await User.findOne({ email: credentials.email });
          if (user) {
            const isPasswordCorrect = await bcrypt.compare(
              credentials.password,
              user.password || ""
            );
            if (isPasswordCorrect) {
              return user;
            }
          }
        } catch (err) {
          throw new Error(err as string);
        }
        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // ...add more providers here
  ],
  callbacks: {
    async signIn({ user, account, session }: any) {
      await dbConnect();

      if (account.provider === "google") {
        // Check if user already exists in the database
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          // If user does not exist, create a new user document
          const newUser = await User.create({
            email: user.email,
            name: user.name,
            isProfileCompleted: false,
          });
          user.id = newUser._id;
        }
        user.id = existingUser._id;
      }
      return user;
    },
    async jwt({ token, account, user }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = user._id || user.id;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token, user }: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.user.name = token.name;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Customize the sign-in page URL
  },
};
