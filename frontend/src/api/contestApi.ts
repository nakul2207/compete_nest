import axios from "axios"
const server_url = import.meta.env.VITE_SERVER_URL;
import {ContestFormData} from "../schemas/contestSchema.tsx"

const headers = {
    'Content-Type': 'application/json'
}

export const createContest = async (Contest: ContestFormData) =>{
    const {data} = await axios.post(`${server_url}/api/contest/create`, Contest, {
        headers,
        withCredentials: true
    });

    return data;
}

