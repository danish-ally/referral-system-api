const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const influencerTokenSchema = new Schema({
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
		// expires: 30 * 86400, // 30 days
	},
});

const InfluencerToken = mongoose.model("InfluencerToken", influencerTokenSchema);

module.exports = InfluencerToken;