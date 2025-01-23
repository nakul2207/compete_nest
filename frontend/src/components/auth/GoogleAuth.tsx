import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { setIsAuthenticated, setUser } from '@/redux/slice/authSlice';
import { useAppDispatch } from '@/redux/hook';
import { AuthenticateWithGoogle } from '@/api/authApi';

const GoogleAuth: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const onSuccess = async (credentialResponse: any) => {
    try {
      const data  = await AuthenticateWithGoogle(credentialResponse.credential)
      dispatch(setIsAuthenticated(true));
      dispatch(setUser(data.user));
      navigate(-1);
    } catch (error) {
      console.error('Google authentication failed:', error);
    }
  };

  const onError = () => {
    console.error('Google authentication failed');
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onError}
      />
    </div>
  );
};

export default GoogleAuth;
