const jwt = require("jsonwebtoken")
const InfluencerToken = require('../../Influencer/models/TokenModel');


const generateAccessAndRefreshTokens = async (user, rememberMe) => {
	try {
		console.log(user,"userinfo");
		const payload = { userInfo:{_id: user._id, email:user.influencerDetails.email,name:user.influencerDetails.name,phone:user.influencerDetails.phone,countryCode:user.influencerDetails.countryCode,role:"influencer"} };
        let expireTime;
        if(rememberMe){
            expireTime="30d"
        }else{
            expireTime="1d"
        }
		const accessToken = jwt.sign(
			payload,
			process.env.ACCESS_TOKEN_PRIVATE_KEY,
			{ expiresIn: expireTime }
		);
		const refreshToken = jwt.sign(
			payload,
			process.env.REFRESH_TOKEN_PRIVATE_KEY,
			{ expiresIn: "30d" }
		);

		const influencerToken = await InfluencerToken.findOne({ userId: user._id });
		if (influencerToken) await influencerToken.deleteOne();

		await new InfluencerToken({ userId: user._id, token: refreshToken }).save();
		return Promise.resolve({ accessToken, refreshToken });
	} catch (err) {
		return Promise.reject(err);
	}
};

module.exports = generateAccessAndRefreshTokens;