import axios from "axios"


export const loginApi = (data: {username: string, password: string}) =>{
    return axios.post('http://localhost:5050/api/auth/login', data)
}


export const registerApi = (data: {username: string, password: string}) =>{
    return axios.post('http://localhost:5050/api/auth/register', data)
}