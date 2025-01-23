import axios from "axios";
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
    'Content-Type': 'application/json'
}

export const GetUsers = async () => {
    try {
        const { data } = await axios.get(`${server_url}/api/user/all`, {
            withCredentials: true,
            headers
        })
        return data;
    } catch (error) {
        console.error('Failed to fetch users:', error)
    }
}

export const DeleteUser = async(userId: string)=>{
    try {
        if (!userId) {
            throw new Error("User ID is required to delete a user.");
        }

        const {data} = await axios.delete(`${server_url}/api/user/${userId}`, {
            headers,
            withCredentials: true
        })
        return data;
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
        const {data} = await axios.put(`${server_url}/api/user/role/${userId}`, { role: newRole }, {
            headers,
            withCredentials: true
        })
        return data;
    } catch (error) {
        console.error('Failed to change roles:', error)
        throw error;
    }
}