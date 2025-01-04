import axios from "axios"
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
    'Content-Type': 'application/json'
}

//get all topics
export const getAllTopics = async() =>{
    try {
        const {data} = await axios.get(`${server_url}/api/topic/all`);
        return data.topics;
    }catch(error){
        console.error('Error fetching topics', error);
        throw new Error('Failed to get the topics');
    }
}

//create topics
export const createTopics = async(topics: Object[]) => {
    try {
        const {data} = await axios.post(`${server_url}/api/topic/create`, {topics}, {headers});
        return data.topics;
    }catch(error){
        console.error('Error in creating topics', error);
        throw new Error('Failed to create topics');
    }
}

//delete a topic
export const deleteTopic = async(topic_id: string) => {
    try {
        const {data} = await axios.delete(`${server_url}/api/topic/${topic_id}`);
        return data.message;
    }catch(error){
        console.error('Error in deleting topic', error);
        throw new Error('Failed to delete topic');
    }
}

//updating a topic
export const updateTopic = async(topic_id: string, topic_name: string) => {
    try {
        const {data} = await axios.put(`${server_url}/api/topic/${topic_id}`, {name: topic_name}, );
        return data.message;
    }catch(error){
        console.error('Error in deleting topic', error);
        throw new Error('Failed to delete topic');
    }
}