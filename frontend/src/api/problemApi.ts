import axios from "axios"
const judge0_base_url = import.meta.env.VITE_BASE_JUDGE0;
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
    'Content-Type': 'application/json'
}

const params = {
    base64_encoded: true
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
    const {data} = await axios.post(`${judge0_base_url}/submissions`, inputData, {
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

export const submitProblem = async ({ problem_id, code }: { problem_id: string; code: string }) => {
    try {
        console.log(`${server_url}/api/problem/${problem_id}/submit`);
        const { data } = await axios.post(`${server_url}/api/problem/${problem_id}/submit`, { code }, {
            headers,
        });

        return data;
    } catch (error) {
        console.error("Error submitting problem:", error);
        return { success: false, message: "An error occurred while submitting the problem." };
    }
};

export const getFileData = async (url: string)=>{
    try {
        const { data } = await axios.get(url);

        return data;
    } catch (error) {
        console.error("Error Fetching Data:", error);
        return { success: false, message: "An error occurred while fetching data." };
    }
}

