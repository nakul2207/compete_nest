import axios from "axios";
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
  "Content-Type": "application/json",
};

export const GetUsers = async () => {
  try {
    const { data } = await axios.get(`${server_url}/api/user/all`, {
      withCredentials: true,
      headers,
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
  }
};

export const DeleteUser = async (userId: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to delete a user.");
    }

    const { data } = await axios.delete(`${server_url}/api/user/${userId}`, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Failed to delete users:", error);
    throw error;
  }
};

export const RoleChange = async (userId: string, newRole: string) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to change the user.");
    }
    const { data } = await axios.put(
      `${server_url}/api/user/role/${userId}`,
      { role: newRole },
      {
        headers,
        withCredentials: true,
      }
    );
    return data;
  } catch (error) {
    console.error("Failed to change roles:", error);
    throw error;
  }
};

export const getUserProgress = async () => {
  try {
    const { data } = await axios.get(`${server_url}/api/user/getProgress`, {
      headers,
      withCredentials: true,
    });

    return data;
  } catch (error) {
    console.error("Failed to change roles:", error);
    throw error;
  }
};
export const GetProfile = async (username:string) => {
  try {
    const { data } = await axios.get(`${server_url}/api/user/profile/${username}`, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Failed to get profile:", error);
    throw error;
  }
}

export const GetSolvedProblems = async (username:string,page: number) => {
  try {
    const  data  = await axios.get(`${server_url}/api/user/${username}/solvedProblems?page=${page}`, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Failed to get solved problems:", error);
    throw error;
  }
}

export const GetContestParticipated = async (username:string,page: number) => {
  try {
    const  data  = await axios.get(`${server_url}/api/user/${username}/contestParticipated?page=${page}`, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Failed to get contest solved:", error);
    throw error;
  }
}

export const getUser = async () => {
  try {
    const  {data}  = await axios.get(`${server_url}/api/user/userdetails`, {
      headers,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error("Failed to get user:", error);
    throw error;
  }
}
export const UpdateProfile = async (data: any) => {
  try {
    const  response  = await axios.put(`${server_url}/api/user/updateProfile`, data, {
      headers,
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
}

export const ChangePassword = async (data: any) => {
  try {
    const  response  = await axios.put(`${server_url}/api/user/changePassword`, data, {
      headers,
      withCredentials: true,
    });
    return response;
  } catch (error) {
    console.error("Failed to change password:", error);
    throw error;
  }
}