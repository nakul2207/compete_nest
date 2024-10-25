import axios from "axios"
const judge0_base_url = import.meta.env.VITE_BASE_JUDGE0;
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
    'Content-Type': 'application/json'
}

const params = {
    base64_encoded: true
};

export const createBatchSubmission = async (inputData: object) =>{
    const {data} = await axios.post(`${judge0_base_url}/submissions/batch/`, inputData, {
        headers,
        params
    });

    return data;
}

export const getBatchSubmission = async (tokens: string) => {
    const {data} = await axios.get(`${judge0_base_url}/submissions/batch/`,{
        headers,
        params: {
            base64_encoded: true,
            tokens
        }
    })

    return data;
}

export const createSubmission = async (inputData: object) =>{
    const {data} = await axios.post(`${judge0_base_url}/submissions/`, inputData, {
        headers,
        params
    });

    return data;
}

export const getSubmission = async (token: string) => {
    const {data} = await axios.get(`${judge0_base_url}/submissions/${token}`,{
        headers,
        params
    })

    return data;
}

export const submitProblem = async (inputData: object) =>{
    console.log(`${server_url}/api/problem/submit`);
    const {data} =await axios.post(`${server_url}/api/problem/submit`, inputData, {
        headers
    });
    return data;
}