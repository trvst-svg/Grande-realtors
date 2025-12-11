import pool from "../DatabaseServices/database.js";
import bcrypt from 'bcrypt';
export default async function signup(req, res){
    const {firstname, lastname, email, password, number} = req.body;

    if ([firstname, lastname, email, password, number].some(a => !a)){
        return res.json({error: "Missing fields"});
    }

    
    
}