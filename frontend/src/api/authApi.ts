import axios from "axios"
const server_url = import.meta.env.VITE_SERVER_URL;
export const GetUsers = async () => {
    try {
        const { data } = await axios.get(`${server_url}/api/users`)
        return data.data;
    } catch (error) {
        console.error('Failed to fetch users:', error)
    }
}
export const DeleteUser = async(userId: string)=>{
    try {
        if (!userId) {
            throw new Error("User ID is required to delete a user.");
        }
        const response = await axios.delete(`${server_url}/api/user/${userId}`)
        return response.data;
    } catch (error) {
        console.error('Failed to delete users:', error)
        throw error;
    }
}
export const RoleChange = async(userId:string, newRole:string)=>{
    try {
        if (!userId) {
            throw new Error("User ID is required to change the user.");
        }
        const response = await axios.put(`${server_url}/api/user/role/${userId}`, { role: newRole })
        return response.data;
    } catch (error) {
        console.error('Failed to change roles:', error)
        throw error;
    }
}
export const AuthenticateWithGoogle = async (token: string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/google`, { token });
        return response.data;
    } catch (error) {
        console.error('Error authenticating with Google:', error);
        throw error; // Rethrow the error for further handling
    }
};
export const LoginUser = async (email: string, password: string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/login`, { email, password });
        return response; 
    } catch (error) {
        console.error('Error during login:', error);
        throw error; 
    }
};
export const SignUpUser = async (email: string, password: string,name:string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/signup`, { 
            email, 
            password, 
            name
          })
        return response; 
    } catch (error) {
        console.error('Error during login:', error);
        throw error; 
    }
};
export const ValidateToken = async (token: string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/validate`, { token });
        return response.data; 
    } catch (error) {
        console.error('Error during token validation:', error);
        throw error;
    }
};
export const SendOTP = async (email: string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/send-otp`, { email });
        return response.data;
    } catch (error) {
        console.error('Error during OTP sending:', error);
        throw error; 
    }
};
export const VerifyOTP = async (email: string,otp:string) => {
    try {
        const response = await axios.post(`${server_url}/api/auth/verify-otp`, { email, otp })
        return response.data;
    } catch (error) {
        console.error('Error during OTP Verification:', error);
        throw error; 
    }
};