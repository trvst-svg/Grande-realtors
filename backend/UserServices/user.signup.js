import pool from "../DatabaseServices/database.js";
import bcrypt from 'bcrypt';
export default async function signup(req, res){
    const {firstname, lastname, email, password, number} = req.body;

    if ([firstname, lastname, email, password, number].some(a => !a)){
        return res.json({error: "Missing fields"});
    }

    const checkEmail = pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    const checkNumber = pool.query(
        'SELECT * FROM users WHERE number = $1',
        [number]
    );

    if((await checkEmail).rowCount > 0){
        return res.status(400).message("user with that email already exists")
    }
    if((await checkNumber).rowCount > 0){
        return res.status(400).message("user with that number already exists")
    }

    const salt = bcrypt.genSalt(10);

    const encryptedPassword = await bcrypt.hash(salt, password);
    const dbInsert = await pool.query(
        'INSERT INTO users(firstname, lastname, email, password, number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [firstname, lastname, email, encryptedPassword, number]
    );
    if ((dbInsert).rowCount <= 0){
        res.status(401).message("Error while creating user");
    }
    res.status(200).message("user created successfully");
}