// app/api/signup/route.ts
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { addHours, addMinutes } from "date-fns";
import crypto from "crypto";
import User from "@/models/User";
import dbConnect from "@/lib/dbConnect";
import { SendVerificationEmail } from "@/lib/emailSender";
import { ValidatePayloadUserSignup } from "./route_validation";

const SALT_ROUNDS = 10;
const NEW_REGISTRATION_SUCCESS_MESSAGE = "Check your email for verification link, link will be valid for 15 min.";
const VALIDATE_PAYLOAD_ERROR_MESSAGE = "Validation Error on Request Payload.";


export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email} =await body;

    if (await ValidatePayloadUserSignup(body) === false) {
      return NextResponse.json(
        { error: VALIDATE_PAYLOAD_ERROR_MESSAGE },
        { status: 400 }
      );
    }

    await CheckIfUserExistsOnDB(email);

    const verificationToken = crypto.randomBytes(32).toString("hex");
    await CreateUser(body, verificationToken);
    await SendVerificationEmail(email, verificationToken);

    const successResponse = new Response(
      JSON.stringify({ message: NEW_REGISTRATION_SUCCESS_MESSAGE }),
      { status: 200 }
    );

    successResponse.headers.append(
      "Set-Cookie",
      `register_session=1; HttpOnly; Path=/; Max-Age=900; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""
      }`
    );

    return successResponse;

  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// check if user already exists in the database and act accordingly.
async function CheckIfUserExistsOnDB(email: string) {
  await dbConnect();

  const existingUser = await User.findOne({ email: email });

  // User has to be redirected to the login page if they already exist.
  if (existingUser) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }
}

// Move this method into a repository or service layer for better separation of concerns.
async function CreateUser(body: any, verificationToken: string) {

  const { name, email, password } = body;

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const expires = addHours(new Date(), 48);

  await User.create({
    name,
    email,
    passwordHash: hashedPassword,
    role: "CUSTOMER",
    registeredBy: "EMAIL",
    verified: false,
    verificationToken: verificationToken,
    verificationTokenExpires: expires,
  });
}