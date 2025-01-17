import React,{useEffect} from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector,useAppDispatch } from '@/redux/hook';
import { setIsAuthenticated,setUser } from '@/redux/slice/authSlice';
import { ValidateToken } from '@/api/authApi';

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const user = useAppSelector((state)=> state.auth.user)
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const validateToken = async (token: string) => {
      try {
        const data = await ValidateToken(token);
        if(data){
          dispatch(setIsAuthenticated(true));
          dispatch(setUser(data.user));
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        localStorage.removeItem('token');
      }
  };
  
    useEffect(() => {
      const token = localStorage.getItem('token');
      if(!token){
        navigate("/auth")
      }
      if (!user && token) {
        validateToken(token);
      }
    }, []);

  if (!user) {
    return <div>loading</div>
  }

  try {
    if (allowedRoles.includes(user.role)) {
      return <Outlet />;
    } else {
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (error) {
    console.error('Invalid token:', error);
    return <Navigate to="/auth" replace />;
  }
};
