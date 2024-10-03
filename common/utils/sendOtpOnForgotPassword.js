const bcrypt = require("bcrypt");
const ForgotPassOtp = require("../../Influencer/models/ForgotPassOtpModel");
const crypto = require("crypto"); // Import the crypto module
const mailgun = require("mailgun-js");
const { SendMailClient } = require("zeptomail");

// Instantiate the Mailgun API client
// const mg = mailgun({
//   apiKey: process.env.MAILGUN_API_KEY,
//   domain: process.env.MAILGUN_DOMAIN,
// });

const sendOtpFuncForForgotPass = async (email) => {
  try {
    let OTP = "";
    const digits = "0123456789";
    const url = process.env.ZEPTO_MAIL_URL;
    const token = process.env.ZEPTO_MAIL_TOKEN;
    let client = new SendMailClient({ url, token });

    // Generate OTP using crypto.getRandomValues()
    const randomBytes = crypto.randomBytes(4); // 4 bytes will be sufficient for a 4-digit OTP
    for (const element of randomBytes) {
      OTP += digits[element % 10]; // Ensure the value is within the range of 0-9
    }

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(OTP, salt);

    const fromMail = process.env.ZEPTO_FROM_MAIL;

    client
      .sendMail({
        from: {
          address: `${fromMail}`,
          name: "Referral System",
        },
        to: [
          {
            email_address: {
              address: `${email}`,
            },
          },
        ],
        subject: `Verify your details`,
        textbody: `OTP is ${OTP}`,
      })
      .then((resp) => console.log("success"))
      .catch((error) => console.log("error", error));

  
    console.log("Email sent successfully!");
    // Check if record with the email exists
    const existingRecord = await ForgotPassOtp.findOne({ email });

    if (existingRecord) {
      // If record exists, delete it
      await ForgotPassOtp.findOneAndDelete({ email });
    }

    console.log(OTP);
    const newotp = new ForgotPassOtp({
      email: email,
      otp: hashedOtp,
    });
    await newotp.save();
    return OTP;
  } catch (error) {
    console.error("Error:", error);
    return Promise.reject(error); // Reject the Promise to propagate the error to the calling function
  }
};

const sendPasswordOnRegister = async (password, email, name) => {
  try {
    const fromMail = process.env.ZEPTO_FROM_MAIL;
    const url = process.env.ZEPTO_MAIL_URL;
    const token = process.env.ZEPTO_MAIL_TOKEN;
    let client = new SendMailClient({ url, token });

    client
      .sendMail({
        from: {
          address: `${fromMail}`,
          name: "Referral System",
        },
        to: [
          {
            email_address: {
              address: `${email}`,
            },
          },
        ],
        subject: `Here is your password`,
        textbody: `Hello ${name},
      Please log in here to refer: ${process.env.STAGING_UI_URL_LINK}
      Password: ${password}`,
      })
      .then((resp) => console.log("success"))
      .catch((error) => console.log("error", error));
    console.log("Email sent successfully!");

    return "Email sent successfully!";
  } catch (error) {
    console.error("Error:", error);
    return Promise.reject(error); // Reject the Promise to propagate the error to the calling function
  }
};

module.exports = {
  sendOtpFuncForForgotPass,
  sendPasswordOnRegister,
};
