import axios from "axios"
const server_url = import.meta.env.VITE_SERVER_URL;

const headers = {
    'Content-Type': 'application/json'
}

//get all companies
export const getAllCompanies = async() =>{
    try {
        const {data} = await axios.get(`${server_url}/api/company/all`);
        return data.companies;
    }catch(error){
        console.error('Error fetching companies', error);
        throw new Error('Failed to get the companies');
    }
}

//create companies
export const createCompanies = async(companies: Object[]) => {
    try {
        const {data} = await axios.post(`${server_url}/api/company/create`, {companies}, {headers});
        return data.companies;
    }catch(error){
        console.error('Error in creating companies', error);
        throw new Error('Failed to create companies');
    }
}

//delete a company
export const deleteCompany = async(company_id: string) => {
    try {
        const {data} = await axios.delete(`${server_url}/api/company/${company_id}`);
        return data.message;
    }catch(error){
        console.error('Error in deleting company', error);
        throw new Error('Failed to delete company');
    }
}

//updating a company
export const updateCompany = async(company_id: string, company_name: string) => {
    try {
        const {data} = await axios.put(`${server_url}/api/company/${company_id}`, {name: company_name}, );
        return data.message;
    }catch(error){
        console.error('Error in deleting company', error);
        throw new Error('Failed to delete company');
    }
}