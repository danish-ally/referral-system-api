const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const forgotPasswordSchema = new Schema({
	userId: {
		type: Schema.Types.ObjectId,
		required: true,
	},
	token: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
		expires: 3000, // 30 days 
	},
});

const ForgotPasswordToken = mongoose.model("ForgotPasswordToken", forgotPasswordSchema);

module.exports = ForgotPasswordToken;