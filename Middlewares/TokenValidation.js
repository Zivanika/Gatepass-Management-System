// Middleware to validate the authorization token
import jwt from "jsonwebtoken";

export const validateToken = (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const publicKey="valardohaeris";
        const data = jwt.verify(token, publicKey);
        // console.log(data); //Basically contains the payload data or id used to generate token
        // req.user = data.user; //payload_data->user->id       { user: { id: '653bc5a61b052a97060e8af2' }, iat: 1698418473 }
        next();
    } catch (error) {
        return res.status(401).json({ error: "Please authenticate using valid token" });
    }
  };