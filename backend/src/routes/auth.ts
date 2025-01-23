import { Router } from "express";
import {
    handleGoogleAuth,
    handleLogin,
    handleSignup,
    handleValidation,
    handleSendOTP,
    handleVerifyOTP,
    handleLogoutUser
} from "../auth/auth";
import {authenticate} from "../middlewares/auth"

const authRouter = Router();
authRouter.route('/signup').post(handleSignup as any);
authRouter.route('/login').post(handleLogin as any);
authRouter.route('/logout').get(handleLogoutUser as any);
authRouter.route('/google').post(handleGoogleAuth as any);
authRouter.route('/validate').get(authenticate as any, handleValidation as any);
authRouter.route('/send-otp').post(handleSendOTP as any);
authRouter.route('/verify-otp').post(handleVerifyOTP as any);


export default authRouter;