import React,{useEffect} from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector,useAppDispatch } from '@/redux/hook';
import { setIsAuthenticated,setUser } from '@/redux/slice/authSlice';
import { ValidateToken } from '@/api/authApi';
import {Loader} from "../Loader.tsx"

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = useAppSelector((state)=> state.auth.user)
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if(!user) {
      ValidateToken().then((data) => {
        if (data) {
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data.user));
        }
      }).catch((err) => {
        navigate('/auth');
        console.error('Token validation failed:', err);
      })
    }
  }, []);

  if (!user) {
    return <Loader />
  }

  try {
    if (allowedRoles.includes(user.role)) {
      return <Outlet />;
    } else {
      return <Navigate to="/forbidden" state={{ errorMessage: "You are not authorized to access this page" }} />
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/auth" replace />;
  }
};
