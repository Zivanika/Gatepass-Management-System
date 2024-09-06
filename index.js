import mysql from 'mysql';
import authRouter from './routes/Auth.js'; // Make sure to add the .js extension
import express from 'express';
import cors from 'cors';
import db from './connection.js';  // Adjust the path as necessary

const app = express();
export const port = process.env.PORT || 5000;

app.use(cors());
// app.use(express.json())
import bodyParser from 'body-parser';
app.use(bodyParser.json({limit: "50mb"})); //!Necessary to be able to upload large images
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

const con = db;

con.connect((error) => {
    if (error) {
      throw error;
    }
    con.query("CREATE DATABASE IF NOT EXISTS gatepass", (err) => {
        if (err) {
            throw err;
        }
        console.log("[+] Database created or already exists");
    });
    // console.log("[+] Connected");
});

app.use('/api', authRouter);

app.listen(port, () => {
    console.log(`[+] Listening on port ${port}...`)
})
