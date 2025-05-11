//lib/configs/auth/authOptions.ts
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
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password || "");
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
            role: "customer",
            subscribed: false,
            usedAnalyses: 0,
          });
          //console.log("New user created:", newUser);
          //change newuser._id from objectId to string
          user._id = newUser._id;
          user.role = newUser.role;
          user.subscribed = newUser.subscribed;
          user.usedAnalyses = newUser.usedAnalyses;
          user.createdAt = newUser.createdAt;
          user.isNewUser = true; // Flag to indicate new user
        } else {
          user._id = existingUser._id;
          user.role = existingUser.role;
          user.subscribed = existingUser.subscribed;
          user.usedAnalyses = existingUser.usedAnalyses;
          user.createdAt = existingUser.createdAt;
          user.isNewUser = false;
        }
      }
      return user;
    },
    async jwt({ token, account, user }: any) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = user._id;
        token.name = user.name;
        token.role = user.role;
        token.subscribed = user.subscribed;
        token.usedAnalyses = user.usedAnalyses;
        token.createdAt = user.createdAt;
        token.email = user.email;
        token.image = user.image;
        token.expires = account.expires_at;
        token.isNewUser = user.isNewUser; // Flag to indicate new user
      }
      return token;
    },
    async session({ session, token, user }: any) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken;
      session.user._id = token.id;
      session.user.name = token.name;
      session.user.role = token.role;
      session.user.subscribed = token.subscribed;
      session.user.usedAnalyses = token.usedAnalyses;
      session.user.createdAt = token.createdAt;
      session.user.isNewUser = token.isNewUser; // Flag to indicate new user
      return session;
    },
    async redirect({ url, baseUrl, token }: any) {
      // This is where you control where to send the user
      if (token?.isNewUser === true) {
        return `${baseUrl}/onboarding`;
      }
      return `${baseUrl}/dashboard`; // Otherwise, to dashboard
    },
  },
  pages: {
    signIn: "/signin",
  },
};
