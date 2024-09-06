import express from "express";
import mysql from "mysql";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import multer from "multer";
import { body, validationResult } from "express-validator";
import db from "../connection.js";
import { validateToken } from "../Middlewares/TokenValidation.js";
const con = db;

const router = express.Router();

// Rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Applying the rate limiter to all requests
router.use(limiter);

function generateUserId() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function generateRegNo() {
  const regNo = Math.floor(1000000000 + Math.random() * 9000000000);
  return regNo.toString();
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Ensure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post("/checkuser", async (req, res) => {
  const tableName = "Users";
  //Check for existing user
  const username = req.body.username;
  const checkSql = `SELECT * FROM ${mysql.escapeId(
    tableName
  )} WHERE username = ${mysql.escape(username)}`;

  con.query(checkSql, (err, result) => {
    if (err) {
      console.error(err);
      return res
        .status(500)
        .json({ message: "Error checking username availability" });
    }
    if (result.length > 0) {
      return res.status(409).json({ message: "Username already exists" });
    } else {
      return res.status(200).json({ message: "Username available!" });
    }
  });
});

// Register route
router.post(
  "/register",
  upload.fields([
    { name: "idp", maxCount: 1 },
    { name: "dp", maxCount: 1 },
  ]),
  async (req, res) => {
    const tableName = "Users";

    const columnsSql =
      "user_id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(30) NOT NULL, password VARCHAR(200) NOT NULL, id INT NOT NULL, id_proof VARCHAR(255) NOT NULL, profile_pic VARCHAR(255)";
    const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;
    try {
      // Create the table if it doesn't exist
      await new Promise((resolve, reject) => {
        con.query(tablesql, (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log(`[+] Table ${tableName} created or already exists`);
            resolve(result);
          }
        });
      });

      const { username, password, id } = req.body;

      const idpFile = req.files["idp"] ? req.files["idp"][0].path : null;
      const dpFile = req.files["dp"] ? req.files["dp"][0].path : null;

      let secPass = await bcrypt.hash(password, 10);
      const userId = generateUserId();

      // Insert user data into the table
      const sql = `INSERT INTO ${mysql.escapeId(
        tableName
      )} (user_id, username, password, id, id_proof, profile_pic) VALUES (${mysql.escape(
        userId
      )}, ${mysql.escape(username)}, ${mysql.escape(secPass)}, ${mysql.escape(
        id
      )}, ${mysql.escape(idpFile)}, ${mysql.escape(dpFile)})`;

      await new Promise((resolve, reject) => {
        con.query(sql, (err, result) => {
          if (err) {
            reject(err);
          } else {
            console.log(`[+] Data inserted into table ${tableName}`);
            resolve(result);
          }
        });
      });

      return res
        .status(200)
        .json({ message: `Data inserted into table ${tableName}` });
    } catch (err) {
      return res.status(500).json({ message: err.sqlMessage });
    }
  }
);

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Using parameterized queries to prevent SQL injection
  const sql = "SELECT * FROM users WHERE username = ?";

  con.query(sql, [username], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      user: {
        id: user.user_id,
      },
    };
    var privateKey = "valardohaeris";
    var token = jwt.sign(payload, privateKey);

    return res
      .status(200)
      .json({ message: "Login successful", user: user.user_id, token });
  });
});
// Security Register route
router.post("/securityregister", async (req, res) => {
  const tableName = "Security";

  const columnsSql =
    "user_id INT PRIMARY KEY, username VARCHAR(30) NOT NULL, password VARCHAR(200) NOT NULL";

  const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;
  try {
    // Create the table if it doesn't exist
    await new Promise((resolve, reject) => {
      con.query(tablesql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Table ${tableName} created or already exists`);
          resolve(result);
        }
      });
    });

    const { username, password } = req.body;
    let secPass = await bcrypt.hash(password, 10);
    const userId = generateUserId();
    // Insert user data into the table
    const sql = `INSERT INTO ${tableName} (user_id, username, password) VALUES (${userId}, ${mysql.escape(
      username
    )}, ${mysql.escape(secPass)})`;
    await new Promise((resolve, reject) => {
      con.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Data inserted into table ${tableName}`);
          resolve(result);
        }
      });
    });

    return res
      .status(200)
      .json({ message: `Data inserted into table ${tableName}` });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.post("/securitylogin", async (req, res) => {
  const { username, password } = req.body;

  // Using parameterized queries to prevent SQL injection
  const sql = "SELECT * FROM security WHERE username = ?";

  con.query(sql, [username], async (error, results) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const payload = {
      user: {
        id: user.user_id,
      },
    };
    var privateKey = "valardohaeris";
    var token = jwt.sign(payload, privateKey);

    return res.status(200).json({ message: "Login successful", user, token });
  });
});

router.post("/gatepasses", validateToken, async (req, res) => {
  const tableName = "Gatepasses";
  const gateId = generateUserId();
  const registrationNo = generateRegNo();

  const columnsSql =
    "gatepass_id INT PRIMARY KEY AUTO_INCREMENT, registrationNo INT NOT NULL, visitorName VARCHAR(30) NOT NULL, dateOfVisit DATE, purpose VARCHAR(30), designation VARCHAR(30), department VARCHAR(30), status VARCHAR(20) DEFAULT 'Pending', id INT NOT NULL, id_proof VARCHAR(255) NOT NULL, profile_pic VARCHAR(255), user_id INT, FOREIGN KEY (user_id) REFERENCES Users(user_id)";

  const tablesql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnsSql});`;

  try {
    await new Promise((resolve, reject) => {
      con.query(tablesql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Table ${tableName} created or already exists`);
          resolve(result);
        }
      });
    });

    const gatepassData = req.body;

    const userSql = `SELECT id, id_proof, profile_pic FROM Users WHERE user_id = ${mysql.escape(gatepassData.userID)}`;


    const user = await new Promise((resolve, reject) => {
      con.query(userSql, (err, data) => {
        if (err) {
          reject(err);
        } else if (data.length === 0) {
          reject(new Error("No User Found!"));
        } else {
          resolve(data[0]);
        }
      });
    });

    const sql = `INSERT INTO ${tableName} (gatepass_id, registrationNo, visitorName, dateOfVisit, purpose, designation, department, id, id_proof, profile_pic, user_id) VALUES (${gateId}, ${mysql.escape(
      registrationNo
    )}, ${mysql.escape(gatepassData.visitorName)}, ${mysql.escape(
      gatepassData.dateOfVisit
    )}, ${mysql.escape(gatepassData.purpose)}, ${mysql.escape(
      gatepassData.designation
    )}, ${mysql.escape(gatepassData.department)}, ${mysql.escape(
      user.id
    )}, ${mysql.escape(user.id_proof)}, ${mysql.escape(
      user.profile_pic
    )}, ${mysql.escape(gatepassData.userID)})`;
    
    await new Promise((resolve, reject) => {
      con.query(sql, (err, result) => {
        if (err) {
          reject(err);
        } else {
          console.log(`[+] Data inserted into table ${tableName}`);
          resolve(result);
        }
      });
    });
    return res
      .status(200)
      .json({ message: `Data inserted into table ${tableName}` });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.get("/allgatepasses", async (req, res) => {
  const tableName = "Gatepasses";
  const sql = `SELECT * FROM ${tableName}`;
  try {
    con.query(sql, (err, data) => {
      if (err) {
        return res.status(500).json({ message: err.sqlMessage });
      }
      if (data.length === 0) {
        return res.status(404).json({ message: "No Gatepass Found!" });
      } else {
        return res.status(200).json(data);
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.sqlMessage });
  }
});

router.post("/approve", async (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE gatepasses SET status='Approved' WHERE gatepass_id = ${mysql.escape(
    id
  )}`;

  con.query(sql, (error, result) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }
    return res.json({ message: `Row in table gatepasses updated to Approved` });
  });
});

router.post("/reject", async (req, res) => {
  const { id } = req.body;
  const sql = `UPDATE gatepasses SET status='Rejected' WHERE gatepass_id = ${mysql.escape(
    id
  )}`;

  con.query(sql, (error, result) => {
    if (error) {
      return res.status(500).json({ message: error.sqlMessage });
    }
    return res.json({ message: `Row in table gatepasses updated to Rejected` });
  });
});

export default router;
