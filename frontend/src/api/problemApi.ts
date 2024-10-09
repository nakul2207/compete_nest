import axios from "axios"
const judge0_base_url = import.meta.env.VITE_BASE_JUDGE0;
const x_rapidapi_key = import.meta.env.VITE_X_RAPID_API_KEY;

const headers = {
    "X-RapidAPI-Key": x_rapidapi_key,
    'Content-Type': 'application/json'
}

const params = {
    base64_encoded: true
};


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
