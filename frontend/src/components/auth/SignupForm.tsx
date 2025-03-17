import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2,Eye, EyeOff } from 'lucide-react'
import { Progress } from "@/components/ui/progress"
import { SendOTP,VerifyOTP,SignUpUser } from '@/api/authApi'
import {setIsAuthenticated, setUser} from "@/redux/slice/authSlice.tsx";
import {useAppDispatch} from "@/redux/hook.ts";

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch();


  const checkPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.match(/[a-z]+/)) strength += 25
    if (password.match(/[A-Z]+/)) strength += 25
    if (password.match(/[0-9]+/)) strength += 25
    setPasswordStrength(strength)
  }


  const handleSendOtp = async () => {
    setIsLoading(true)
    try {
      await SendOTP(email);
      setIsOtpSent(true)
      toast.success('OTP sent to your email!')
    } catch (error) {
      console.error('Failed to send OTP:',(error as any).response?.data?.error)
      toast.error('Failed to send OTP: '+(error as any).response?.data?.error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setIsLoading(true)
    try {
      await VerifyOTP(email,otp);
      setIsVerified(true)
      toast.success('Email verified successfully!')
    } catch (error) {
      console.error('OTP verification failed:', error)
      toast.error('OTP verification failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isVerified) {
      toast.error('Please verify your email first.')
      return
    }
    setIsLoading(true)
    
    try {
      const data = await SignUpUser(email,password,name);
      dispatch(setIsAuthenticated(true));
      dispatch(setUser(data.user));
      toast.success('Account created successfully!')
      navigate(-1);
    } catch (error) {
      console.error('Signup failed:', error)
      toast.error('Signup failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading || isVerified}
            required
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading || isOtpSent}
            required
            className="h-10"
          />
        </div>
        {!isOtpSent && (
          <Button 
            type="button" 
            onClick={handleSendOtp}
            disabled={isLoading || !email}
            className="w-full"
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Send OTP
          </Button>
        )}
        {isOtpSent && !isVerified && (
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={isLoading}
              required
              className="h-10"
            />
            <Button 
              type="button" 
              onClick={handleVerifyOtp}
              disabled={isLoading || !otp}
              className="w-full mt-2"
            >
              {isLoading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              Verify OTP
            </Button>
          </div>
        )}
        {isVerified && (
          <Alert className="bg-green-100 border-green-500">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Email Verified</AlertTitle>
            <AlertDescription className="text-green-700">
              Your email has been successfully verified.
            </AlertDescription>
          </Alert>
        )}
        {isVerified && (
          <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                checkPasswordStrength(e.target.value)
              }}
              disabled={isLoading}
              required
              className="h-10 pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
          <Progress value={passwordStrength} className="h-1 mt-2" />
          <p className="text-xs text-gray-500 mt-1">
            Password strength: {passwordStrength === 100 ? 'Strong' : passwordStrength >= 50 ? 'Medium' : 'Weak'}
          </p>
      </div>
        )}
        {isVerified && (
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create account
          </Button>
        )}
      </form>
    </div>
  )
}

