const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OtpSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: { expires: 300 },
  },
},{timestamps:true});

const ForgotPassOtp = mongoose.model("ForgotPassOtp", OtpSchema);

module.exports = ForgotPassOtp;