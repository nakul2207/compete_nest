import axios from "axios"
const judge0_base_url = import.meta.env.VITE_BASE_JUDGE0;
const server_url = import.meta.env.VITE_SERVER_URL;
const hosted_judge0_base_url = import.meta.env.VITE_BASE_JUDGE0_HOSTED

import {ProblemFormData} from "../schemas/problemSchema.tsx"

const headers = {
    'Content-Type': 'application/json'
}

const params = {
    base64_encoded: true,
    wait: true
};

export const createBatchSubmission = async (inputData: { submissions: any[] }) => {
    try {
        // console.log("Sending to batch endpoint:", inputData);

        // Append params directly in the URL instead of using the params object
        const { data } = await axios.post(
            `${judge0_base_url}/submissions/batch?base64_encoded=true`,
            inputData,
            { headers }
        );

        return data;

    } catch (error) {
        console.error("Error making submission:", error);
        return { success: false, message: "An error occurred while making a batch submission" };
    }
};

export const createRunSubmission = async ({ problem_id, uid }: {problem_id: string, uid: string}) =>{
    try {
        const { data } = await axios.post(`${server_url}/api/submission/run/${problem_id}`, {uid}, {
            headers,
        });

        return data;
    } catch (error) {
        console.error("Error run problem:", error);
        return { success: false, message: "An error occurred while running the problem." };
    }
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
    // const {data} = await axios.post(`${judge0_base_url}/submissions`, inputData, {
    const {data} = await axios.post(`${hosted_judge0_base_url}/submissions`, inputData, {
        headers,
        params
    });

    return data;
}

export const getSubmission = async (token: string) => {
    const {data} = await axios.get(`${hosted_judge0_base_url}/submissions/${token}`,{
        headers,
        params
    })

    return data;
}

export const submitProblem = async ({ problem_id, code, language_id }: { problem_id: string; code: string, language_id: number }) => {
    try {
        // console.log(`${server_url}/api/problem/${problem_id}/submit`);
        const { data } = await axios.post(`${server_url}/api/problem/${problem_id}/submit`, { code, language_id }, {
            headers,
        });

        return data;
    } catch (error) {
        console.error("Error submitting problem:", error);
        return { success: false, message: "An error occurred while submitting the problem." };
    }
};

export const runProblem = async (inputData: { submissions: any[] }) =>{
    try {
        console.log(inputData.submissions);
        const { data } = await axios.post(
            `${hosted_judge0_base_url}/submissions/batch?base64_encoded=true&wait=true`,
            inputData,
            { headers }
        );

        return data;
    } catch (error) {
        console.error("Error making submission:", error);
        return { success: false, message: "An error occurred while making a batch submission" };
    }
}

export const getFileData = async (url: string)=>{
    try {
        const { data } = await axios.get(url);

        return data;
    } catch (error) {
        console.error("Error Fetching Data:", error);
        return { success: false, message: "An error occurred while fetching data." };
    }
}

export const saveProblem = async (formData: ProblemFormData) => {
    try {
        // Send the data to the backend API
        const {data} = await axios.post(`${server_url}/api/problem/create`, {
            ...formData,
        }, {headers}
    );
        return data;
    } catch (error) {
        console.error('Error saving problem:', error);
        throw new Error('Failed to save problem');
    }
};

export const uploadToS3 = async (url: string, file: File, fileType: string)=> {
    try{
        await axios.put(url, file, {
            headers: {
                "Content-Type": fileType || "text/plain",
            },
        })
    }catch (error) {
        console.error('Error uploading the file to s3', error);
        throw new Error('Failed to upload file on s3');
    }
}