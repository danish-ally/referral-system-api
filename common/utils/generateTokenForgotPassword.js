const jwt = require("jsonwebtoken")
const ForgotPasswordToken = require('../../Influencer/models/ForgotPasswordTokenModel');


const generateForgotPasswordToken = async (user)=>{
    try {
		console.log("I am working")
		const payload = { _id: user._id, email: user.influencerDetails.email};
		const FPToken = jwt.sign(
			payload,
			process.env.FORGOT_PASSWORD_TOKEN_PRIVATE_KEY,
			{ expiresIn: "1d" }
		);
		
        console.log(FPToken)
		const FrgtpswrdToken = await ForgotPasswordToken.findOne({ userId: user._id });
		if (FrgtpswrdToken) await FrgtpswrdToken.deleteOne();

		await new ForgotPasswordToken({ userId: user._id, token: FPToken }).save();
		return Promise.resolve({FPToken});
	} catch (err) {
		return Promise.reject(err);
	}
}


module.exports = generateForgotPasswordToken;