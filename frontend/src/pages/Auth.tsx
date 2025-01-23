import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import SignupForm from '../components/auth/SignupForm'
import LoginForm from '../components/auth/LoginForm'
import GoogleAuth from '../components/auth/GoogleAuth'
import { useAppDispatch, useAppSelector } from '@/redux/hook'
import { setIsLoginPage } from '@/redux/slice/toggleSlice'
import {useNavigate} from "react-router-dom";

export function Auth() {
  const isLoginPage = useAppSelector((state) => state.toggle.value);
  const user = useAppSelector((state)=> state.auth.user)
  const dispatch = useAppDispatch()
  const navigate = useNavigate();

  if(user){
    navigate('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {isLoginPage ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLoginPage 
              ? 'Enter your credentials to sign in to your account' 
              : 'Enter your information to create a new account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLoginPage ? 'login' : 'signup'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {isLoginPage ? <LoginForm /> : <SignupForm />}
            </motion.div>
          </AnimatePresence>

          <div className="space-y-4">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => dispatch(setIsLoginPage(!isLoginPage))}
            >
              {isLoginPage 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <GoogleAuth />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

