import jwt from "jsonwebtoken";
import { secretToken } from "../secret.js";

//Function that authenticates tokens as middleware
export default async function TokenAuthenticator(req, res, next){
    try{
        //store tokens from user and generated token
        const user_token = req.cookies.token;
        
        //verify token
        if(!user_token){
            return res.send("User has no access");
        }
        
        const verification = jwt.verify(user_token, secretToken);

        //let user into the main function
        next();
    }
    catch(e){
        res.send('datbase error');
    }
}