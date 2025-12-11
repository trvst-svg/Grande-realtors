import express from 'express';
import { configDotenv } from 'dotenv';

const config = configDotenv();

const app = express()

const port = process.env.DB_PORT;

app.listen(port, () => {
    console.log(`App running on port ${port}`);
})