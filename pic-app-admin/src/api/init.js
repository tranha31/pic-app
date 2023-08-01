import axios from "axios";

const baseURL = `${process.env.REACT_APP_BASE_URL}`;
const xAPIKey = `${process.env.REACT_APP_API_KEY}`

export default axios.create({
    baseURL,
    headers: {
        "Content-Type" : "application/json-patch+json",
        "x-api-key": xAPIKey,
		"Access-Control-Allow-Origin": "*"
    } ,
    
})