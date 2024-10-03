const jwt = require("jsonwebtoken")

const generateEmailToken = async (user) => {
	try {
		
		const payload = { _id: user._id };
		const token = jwt.sign(
			payload,
			process.env.LOGIN_EMAIL_TOKEN_PRIVATE_KEY,
			{ expiresIn: "30000s" }
		);
		return Promise.resolve({ token});
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = generateEmailToken ; 