const jwt = require("jsonwebtoken")

const verifyAccessToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    console.log(token,"token")
    
    if (!token) {
      return res.status(403).json({ success: false, message: 'No token provided.' });
    }
  
    jwt.verify(token, process.env.ACCESS_TOKEN_PRIVATE_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
      }
      req.decoded = decoded;
      next();
    });
  };

  module.exports = verifyAccessToken