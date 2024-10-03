const jwt = require("jsonwebtoken");
const Influencer = require('../Influencer/models/InfluencerModel')


const verifyTokenWithKey = (token, secretKey) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          reject({ status: 401, message: "Token expired" });
        } else if (err.name === "JsonWebTokenError") {
          reject({ status: 401, message: "Invalid token" });
        } else {
          reject({ status: 500, message: "Internal server error" });
        }
      } else {
        resolve(decoded);
      }
    });
  });
};

const verifyToken = async (token) => {
  const secretKeys = [
    process.env.ADMIN_ACCESS_TOKEN,
    process.env.ACCESS_TOKEN_PRIVATE_KEY,
    // Add more keys if needed
  ];

  for (const secretKey of secretKeys) {
    try {
      const decoded = await verifyTokenWithKey(token, secretKey);
      return decoded;
    } catch (err) {
      // Continue to the next key if verification fails
    }
  }

  throw { status: 401, message: "Token verification failed with all keys" };
};

const getUserByToken = async (token) => {
  try {
    const decoded = await verifyToken(token);   
    return decoded;
  } catch (err) {
    console.log(err)
    throw err;
  }
};
const auth = async (req, res, next) => {
  try {
    const token = req.headers?.authorization;

    if (!token) {
      return res
        .status(401)
        .json({ error: true, message: "Token not provided" });
    }

    const tokenParts = token.split(" ");
    const decodedUser = await getUserByToken(tokenParts[1]);
    // console.log(decodedUser)
    req.user = decodedUser.userInfo;

    return next();
  } catch (err) {
    console.error(err);

    const errorResponse = {
      error: true,
      message: err.message,
    };

    if (err.status === 401 && err.message === "Token expired") {
      errorResponse.isTokenExpired = true;
    }

    return res.status(err.status || 500).json(errorResponse);

  }
};

module.exports = auth;