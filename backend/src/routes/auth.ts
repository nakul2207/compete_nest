import { Router } from "express";
import { handleGoogleAuth, handleLogin, handleSignup,handleValidation,handleSendOTP,handleVerifyOTP } from "../auth/auth";

const authRouter = Router();
authRouter.route('/signup').post(handleSignup as any);
authRouter.route('/login').post(handleLogin as any);
authRouter.route('/google').post(handleGoogleAuth as any);
authRouter.route('/validate').post(handleValidation as any);
authRouter.route('/send-otp').post(handleSendOTP as any);
authRouter.route('/verify-otp').post(handleVerifyOTP as any);


export default authRouter;