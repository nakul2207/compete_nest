import { Request,Response } from 'express';
import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt,{JwtPayload} from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import nodemailer from "nodemailer"

config()
const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
interface TokenPayload extends JwtPayload {
  userId: string; // Define the structure of your token payload
}

export const handleSignup = async (req: Request, res: Response) => {
  const { name, email, password} = req.body;

  try {
    // Validate and map the role
    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select:{
        id: true,
        name:true,
        email:true,
        role:true,
        createdAt:true
      }
    });

    // Ensure JWT_SECRET is defined
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Generate a JWT token for the user
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // Respond with the user details and the token
    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};



// Login
export const handleLogin =  async (req:Request, res:Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
};

// Google Auth

export const handleGoogleAuth = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Generate a random placeholder password
      const randomPassword = crypto.randomBytes(16).toString('hex');

      // Create a new user
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name!,
          token:googleId,
          password: randomPassword, // Save placeholder password
        },
      });
    }

    // Generate a JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(400).json({ error: 'Invalid Google token' });
  }
};

export const handleValidation = async (req: Request, res: Response) => {
  const { token } = req.body;

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;

    // Access userId from the decoded token
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }, 
    });

    if (!user) {
      throw new Error('User not found');
    }

    res.json({ user });
  } catch (error) {
    console.error('Token validation failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// In-memory storage for OTPs (in production, use a database)
const otpStore: { [key: string]: { otp: string; expiry: number } } = {};

export const handleSendOTP = async(req:Request,res:Response)=>{
  const { email } = req.body;

  try {
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes

    // Store OTP
    otpStore[email] = { otp, expiry };

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Your OTP for Signup',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      html: `<p>Your OTP is <strong>${otp}</strong>. It will expire in 10 minutes.</p>`,
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const handleVerifyOTP = async(req:Request,res:Response)=>{
  const { email, otp } = req.body;

  const storedOTP = otpStore[email];
  if (!storedOTP || storedOTP.otp !== otp || Date.now() > storedOTP.expiry) {
    return res.status(400).json({ error: 'Invalid or expired OTP' });
  }

  // Clear the OTP from storage
  delete otpStore[email];

  res.json({ message: 'OTP verified successfully' });
};

