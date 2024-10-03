const jwt = require("jsonwebtoken");


const verifyPasswordToken = (token) => {
    console.log('I am working')
	const privateKey = process.env.LOGIN_EMAIL_TOKEN_PRIVATE_KEY;
    console.log(token)

    console.log(process.env.LOGIN_EMAIL_TOKEN_PRIVATE_KEY)

	return new Promise((resolve, reject) => {
		
			jwt.verify(token, privateKey, (err, tokenDetails) => {
				
                if (err) {
					if (err.name === "TokenExpiredError") {
					  reject({ status: 401, message: "Token expired" });
					} else if (err.name === "JsonWebTokenError") {
					  reject({ status: 401, message: "Invalid token" });
					} else {
					  reject({ status: 500, message: "Internal server error" });
					}
				  } else {
					resolve({
                        tokenDetails,
                        error: false,
                        message: "Valid token",
                    });
				  }
				
			});
		});
};

module.exports = verifyPasswordToken;