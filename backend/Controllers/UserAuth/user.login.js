import pool from "../../DatabaseServices/database.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

export default async function login(req, res){
    const {email, password} = req.body;
    

    if([email, password].some(a => !a)){
        return res.status(401).message("Missing fields");
    } 

    const checkUser = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    if(checkUser.rowCount <= 0){
        return res.status(401).message("User does not exist");
    }

    const dbPassword = checkUser.password;
    const checkPassword = await bcrypt.compare(dbPassword, password);
    if(!checkPassword){
        return res.status(400).message("Invalid password");
    }

    const payload = {
        email: email,   
    }
    return jwt.sign(payload, process.env.SECRET_KEY, {expiresIn: "5h"})

}