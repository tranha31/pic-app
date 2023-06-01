import axios from "axios";

const baseURL = `${process.env.REACT_APP_BASE_URL}`;

export default axios.create({
    baseURL,
    headers: {
        "Content-Type" : "application/json-patch+json",
        "x-api-key": "89f76b00ff0211edbd2a34e6d760b36f"
    } ,
    
})