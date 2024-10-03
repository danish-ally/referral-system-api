const ForgotPasswordToken = require('../../Influencer/models/ForgotPasswordTokenModel');
const jwt = require("jsonwebtoken");


const verifyFPToken = (FPToken) => {
	const privateKey = process.env.FORGOT_PASSWORD_TOKEN_PRIVATE_KEY;

	return new Promise((resolve, reject) => {
		const user = ForgotPasswordToken.findOne({ token: FPToken })
			if (!user){
                return reject({status: 401, error: true, message: "Invalid  token" });
            }
				
				

			jwt.verify(FPToken, privateKey, (err, tokenDetails) => {
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

module.exports = verifyFPToken;