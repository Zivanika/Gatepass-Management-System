import mysql from 'mysql';

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"gatepass" //If no database found error occurs for first time use, remove this and add later
});

export default con;