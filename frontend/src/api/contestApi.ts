import axios from "axios"
const server_url = import.meta.env.VITE_SERVER_URL;
import {ContestFormData} from "../schemas/contestSchema.tsx"

const headers = {
    'Content-Type': 'application/json'
}

export const createContest = async (Contest: ContestFormData) =>{
    try{
        const {data} = await axios.post(`${server_url}/api/contest/create`, Contest, {
            headers,
            withCredentials: true
        });
    
        return data;
    }catch(error){
        console.error('Error creating the contest', error);
        throw new Error('Failed to create contest');
    }
}

export const getAllContests = async() => {
    try{
        const {data} = await axios.get(`${server_url}/api/contest/all`, {
            headers,
            withCredentials: true
        })

        return data;
    }catch(error){
        console.error('Error fetching all the contest', error);
        throw new Error('Failed to get the contests');
    }
}

export const handleRegistration = async (contestId: string, isRegister: boolean) => {
    try{
        const {data} = await axios.get(`${server_url}/api/contest/${contestId}/register?register=${isRegister}`, {
            headers,
            withCredentials: true
        })

        return data;
    }catch(error){
        console.error('Error registering for the contest', error);
        throw new Error('Failed to register for the contest');
    }
}