const Influencer = require("../../models/InfluencerModel");
const generatePassword = require("../../../common/utils/generatePassword");
const {
  phoneValidation,
  emailValidation,
  logInBodyValidation,
  changePasswordValidation,
  resetPasswordBodyValidation,
} = require("../../../common/utils/validationSchemas");
const ForgotPassOtp = require("../../models/ForgotPassOtpModel");
const verifyFPToken = require("../../../common/utils/verifyForgotPasswordToken");
const generateForgotPasswordToken = require("../../../common/utils/generateTokenForgotPassword");
const {
  sendOtpFuncForForgotPass,
  sendPasswordOnRegister,
} = require("../../../common/utils/sendOtpOnForgotPassword");
const generateEmailToken = require("../../../common/utils/generateTokenForEmail");
const verifyPasswordToken = require("../../../common/utils/verifyPassworkTokenLogin");
const generateAccessAndRefreshTokens = require("../../../common/utils/generateAccessAndRefreshToken");
const countriesData = require("../../../common/utils/countryCode.json"); // Assuming the data is in a JSON file
const bcrypt = require("bcrypt");
const CryptoJS = require("crypto-js");
const ReferralLink = require("../../../referral-link/models/referralLink");
const ReferredStudent = require("../../../Referred-student/models/referredStudent")

const addInfluencer = async (req, res) => {
  try {
    const emailValidationResult = emailValidation(
      req.body.influencerDetails.email
    );

    if (emailValidationResult.error) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid email format" });
    }

    const userEmailExist = await Influencer.findOne({
      "influencerDetails.email": req.body.influencerDetails.email,
    });

    if (userEmailExist) {
      return res.status(409).json({
        error: true,
        message: "Influencer with this email already exists",
      });
    }

    const phoneValidationResult = phoneValidation(
      req.body.influencerDetails.phone
    );

    if (phoneValidationResult.error) {
      return res
        .status(400)
        .json({ error: true, message: "Invalid phone number format" });
    }

    const genPassword = generatePassword(8);
    const salt = await bcrypt.genSalt(Number(process.env.SALT));
    const hashPassword = await bcrypt.hash(genPassword, salt);

    let updatedUser = {
      ...req.body,
      password: hashPassword,
    };

    updatedUser.influencerDetails.combinedPhone =
      req.body.influencerDetails.countryCode + req.body.influencerDetails.phone;

    const result = await new Influencer(updatedUser).save();

    await sendPasswordOnRegister(genPassword, req.body.influencerDetails.email,req.body.influencerDetails?.name);

    res.status(201).json({
      error: false,
      password: genPassword,
      result,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const updateInfluencer = async (req, res) => {
  try {
    const user = req.user;
    console.log(req.user);
    console.log(req.user?._id);
    const id = req.user?._id;
    const influencerExist = await Influencer.findById(id);
    if (!influencerExist)
      return res
        .status(404)
        .json({ error: true, message: "Influencer not found" });

    // if updating country code

    const beforeChangeInflcr = JSON.parse(JSON.stringify(influencerExist));

    // Remove the editLog property
    delete beforeChangeInflcr.editLog;

    console.log("beforeChangeInflcr", beforeChangeInflcr);

    if (
      req.body.influencerDetails?.countryCode &&
      req.body.influencerDetails?.countryCode !==
        influencerExist.influencerDetails.countryCode
    ) {
      influencerExist.influencerDetails.countryCode =
        req.body.influencerDetails.countryCode;
      influencerExist.influencerDetails.combinedPhone =
        req.body.influencerDetails.countryCode +
        influencerExist.influencerDetails.phone;
    }
    // if updating phone number
    if (
      req.body.influencerDetails?.phone &&
      req.body.influencerDetails?.phone !==
        influencerExist.influencerDetails.phone
    ) {
      const { error } = phoneValidation(req.body.influencerDetails.phone);

      if (error) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid phone number format" });
      }

      influencerExist.influencerDetails.phone =
        req.body.influencerDetails.phone;
      influencerExist.influencerDetails.combinedPhone =
        influencerExist.influencerDetails.countryCode +
        req.body.influencerDetails.phone;
    }

    if (
      req.body.influencerDetails?.email &&
      req.body.influencerDetails?.email !==
        influencerExist.influencerDetails.email
    ) {
      const { error } = emailValidation(req.body.influencerDetails.email);

      if (error) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid email format" });
      }
      const existingUserWithEmail = await Influencer.findOne({
        "influencerDetails.email": req.body.influencerDetails.email,
      });
      if (existingUserWithEmail) {
        return res
          .status(400)
          .json({ error: true, message: "Email is already exist" });
      }

      influencerExist.influencerDetails.email =
        req.body.influencerDetails.email;
    }

    if (req.body.channel) {
      // Check if influencerExist.channel is not an array or if it is empty
      if (
        !Array.isArray(influencerExist.channel) ||
        influencerExist.channel.length === 0
      ) {
        influencerExist.channel = req.body.channel.map((channel) => ({
          brand_Id: channel.brand_Id || null,
          brandName: channel.brandName || null,
        }));
      } else {
        // If influencerExist.channel is an array and not empty
        const newChannels = req.body.channel.map((channel) => ({
          brand_Id: channel.brand_Id || null,
          brandName: channel.brandName || null,
        }));
        influencerExist.channel = newChannels;

        influencerExist.channel.forEach((channel, index) => {
          influencerExist.channel[index].brand_Id =
            req.body.channel[index]?.brand_Id || channel.brand_Id;
          influencerExist.channel[index].brandName =
            req.body.channel[index]?.brandName || channel.brandName;
        });
      }
    }

    influencerExist.influencerDetails.name =
      req.body.influencerDetails?.name ||
      influencerExist.influencerDetails.name;
    influencerExist.status = req.body.status || influencerExist.status;

    influencerExist.editLog.push({
      changeTime: new Date(),
      changeBy: {
        refId: req.user?._id || null,
        name: user?.name || null,
        email: user?.email,
        countryCode: user?.countryCode || null,
        phoneNo: user?.phone || null,
        contactedNumber: `${user?.countryCode || "" + user?.phone || ""}`,
      },
      beforeChanges: beforeChangeInflcr,
      afterChanges: req.body,
    });

    const result = await influencerExist.save();

    res.status(200).json({
      error: false,
      result,
      message: "Influencer updated successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const changeInfluencerStatus = async (req, res) => {
  try {
    const id = req.user?._id;

    if (!req.body.status) {
      return res
        .status(400)
        .json({ error: true, message: "Please provide status in payload" });
    }

    const influencerExist = await Influencer.findById(id);

    if (!influencerExist)
      return res
        .status(404)
        .json({ error: true, message: "Influencer not found" });

    influencerExist.status = req.body.status;

    const result = await influencerExist.save();

    res.status(200).json({
      error: false,
      result,
      message: "Influencer updated successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const updateInfluencerByAdmin = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.id;
    const influencerExist = await Influencer.findById(id);
    if (!influencerExist)
      return res
        .status(404)
        .json({ error: true, message: "Influencer not found" });

    const beforeChangeInflcr = JSON.parse(JSON.stringify(influencerExist));
    // Remove the editLog property
    delete beforeChangeInflcr.editLog;

    console.log("beforeChangeInflcr", beforeChangeInflcr);

    // if updating country code

    if (
      req.body.influencerDetails?.countryCode &&
      req.body.influencerDetails?.countryCode !==
        influencerExist.influencerDetails.countryCode
    ) {
      influencerExist.influencerDetails.countryCode =
        req.body.influencerDetails.countryCode;
      influencerExist.influencerDetails.combinedPhone =
        req.body.influencerDetails.countryCode +
        influencerExist.influencerDetails.phone;
    }
    // if updating phone number
    if (
      req.body.influencerDetails?.phone &&
      req.body.influencerDetails?.phone !==
        influencerExist.influencerDetails.phone
    ) {
      const { error } = phoneValidation(req.body.influencerDetails.phone);

      if (error) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid phone number format" });
      }

      influencerExist.influencerDetails.phone =
        req.body.influencerDetails.phone;
      influencerExist.influencerDetails.combinedPhone =
        influencerExist.influencerDetails.countryCode +
        req.body.influencerDetails.phone;
    }

    if (
      req.body.influencerDetails?.email &&
      req.body.influencerDetails?.email !==
        influencerExist.influencerDetails.email
    ) {
      const { error } = emailValidation(req.body.influencerDetails.email);

      if (error) {
        return res
          .status(400)
          .json({ error: true, message: "Invalid email format" });
      }
      const existingUserWithEmail = await Influencer.findOne({
        "influencerDetails.email": req.body.influencerDetails.email,
      });
      if (existingUserWithEmail) {
        return res
          .status(400)
          .json({ error: true, message: "Email is already exist" });
      }

      influencerExist.influencerDetails.email =
        req.body.influencerDetails.email;
    }

    if (req.body.channel) {
      // Check if influencerExist.channel is not an array or if it is empty
      if (
        !Array.isArray(influencerExist.channel) ||
        influencerExist.channel.length === 0
      ) {
        influencerExist.channel = req.body.channel.map((channel) => ({
          brand_Id: channel.brand_Id || null,
          brandName: channel.brandName || null,
        }));
      } else {
        // If influencerExist.channel is an array and not empty
        const newChannels = req.body.channel.map((channel) => ({
          brand_Id: channel.brand_Id || null,
          brandName: channel.brandName || null,
        }));
        influencerExist.channel = newChannels;

        influencerExist.channel.forEach((channel, index) => {
          influencerExist.channel[index].brand_Id =
            req.body.channel[index]?.brand_Id || channel.brand_Id;
          influencerExist.channel[index].brandName =
            req.body.channel[index]?.brandName || channel.brandName;
        });
      }
    }

    influencerExist.influencerDetails.name =
      req.body.influencerDetails?.name ||
      influencerExist.influencerDetails.name;
    influencerExist.status = req.body.status || influencerExist.status;

    influencerExist.editLog.push({
      changeTime: new Date(),
      changeBy: {
        refId: user?.user_id || null,
        name: user?.name || null,
        email: user?.email,
        countryCode: user?.countryCode || null,
        phoneNo: user?.phone || null,
        contactedNumber: `${user?.countryCode || "" + user?.phone || ""}`,
      },
      beforeChanges: beforeChangeInflcr,
      afterChanges: req.body,
    });

    const result = await influencerExist.save();

    res.status(200).json({
      error: false,
      result,
      message: "Influencer updated successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const getInfluencerDetails = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Influencer.findById(id, { password: 0 });

    res.status(200).json({
      error: false,
      data,
      message: "got influencer details successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const getAllInfluencer = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, channel, status,from, to  } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    let query = {}; // Initialize an empty query object

    // Check if search query is provided
    if (search) {
      query = {
        $or: [
          {
            "influencerDetails.name": {
              $regex: new RegExp(search, "i"),
            },
          }, // Case-insensitive search for name
          {
            "influencerDetails.email": {
              $regex: new RegExp(search, "i"),
            },
          }, // Case-insensitive search for email
          {
            "influencerDetails.combinedPhone": {
              $regex: new RegExp(escapeRegExp(search), "i"),
            },
          },
        ],
      };
    }

    if (channel) {
      query["$or"] = [
        { "channel.brand_Id": { $regex: channel, $options: "i" } },
      ];
    }

    // Exclude documents with status "deleted"
    // Add status filter if provided
    if (status) {
      query["status"] = status;
    } else {
      // If status is not provided, exclude documents with status "deleted"
      query["status"] = { $ne: "Deleted" };
    }

    console.log(query);

    // Use aggregate to get data for the current page and the total count of documents
    const [data, totalDocuments] = await Promise.all([
      Influencer.aggregate([
        { $match: query }, // Apply the search query conditions
        { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
        { $skip: skip },
        { $limit: limit },
        { $project: { password: 0 } }, // Exclude password field
      ]),
      Influencer.countDocuments(query), // Count documents based on the search query
    ]);

    const resultArray = await Promise.all(
      data.map(async (influencer) => {
        let userCount = 0;
        let earnings = 0;

        const refLinks = await ReferralLink.find({
          "userInfo.email": influencer.influencerDetails.email,
        });

        // Define date filter for referred student purchases
        let dateQuery = {};
        if (from && to) {
          dateQuery.createdAt = {
            $gte: new Date(from),
            $lte: new Date(new Date(to).setHours(23, 59, 59, 999)),
          };
        } else if (from) {
          dateQuery.createdAt = { $gte: new Date(from) };
        } else if (to) {
          dateQuery.createdAt = { $lte: new Date(to) };
        }

        const refLinkIds = refLinks.map((link) => link._id);

        const purchases = await ReferredStudent.find({
          referralLinkId: { $in: refLinkIds }, // Match referral link IDs
          ...dateQuery, // Apply the date filter
        });

        purchases.forEach((purchase) => {
          earnings += purchase.earningAmount; // Sum the purchase amount
        });

        refLinks.forEach((link) => {
          userCount += link.registeredCount;
        });

        return {
          influencerData: influencer,
          userCount: userCount,
          earnings: earnings,
        };
      })
    );

    console.log("resultArray", resultArray);
    // Calculate the number of documents on the current page
    const documentOnCurrentPage = resultArray.length;

    res.status(200).json({
      error: false,
      resultArray,
      page,
      limit,
      totalDocuments,
      documentOnCurrentPage,
      message: "Get all Influencer list successfully !!",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

function escapeRegExp(string) {
  // Escape special characters and trim leading/trailing spaces
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&").trim();
}

const getInfluencerForExternal = async (req, res) => {
  try {
    let { search, status } = req.query;

    // let channel = req.params.channelId;

    console.log("search", search);

    let query = {}; // Initialize an empty query object

    // Check if search query is provided
    if (search) {
      query = {
        $or: [
          {
            "influencerDetails.name": {
              $regex: new RegExp(search, "i"),
            },
          }, // Case-insensitive search for name
          {
            "influencerDetails.email": {
              $regex: new RegExp(search, "i"),
            },
          }, // Case-insensitive search for email
          {
            "influencerDetails.combinedPhone": {
              $regex: new RegExp(escapeRegExp(search), "i"),
            },
          },
        ],
      };
    }

    // if (channel) {
    //   query["$or"] = [
    //     { "channel.brand_Id": { $regex: channel, $options: "i" } },
    //   ];
    // }

    if (status) {
      query["$or"] = [{ status: { $regex: status, $options: "i" } }];
    }

    console.log(query);

    // Use aggregate to get data for the current page and the total count of documents
    const [data, totalDocuments] = await Promise.all([
      Influencer.aggregate([
        { $match: query }, // Apply the search query conditions
        { $sort: { createdAt: -1 } }, // Sort by createdAt in descending order
        { $project: { password: 0 } }, // Exclude password field
      ]),
      Influencer.countDocuments(query), // Count documents based on the search query
    ]);

    let modifiedData = [];
    for (let i = 0; i < data.length; i++) {
      const element = data[i];

      modifiedData.push({
        id: element._id,
        name: element.influencerDetails.name,
        email: element.influencerDetails.email,
      });
    }

    // Calculate the number of documents on the current page
    const documentOnCurrentPage = data.length;
    res.status(200).json({
      error: false,
      data: modifiedData,
      totalDocuments,
      message: "Get all Influencer list successfully !!",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};
const deleteInfluencer = async (req, res) => {
  try {
    const id = req.params.id;
    const influencerExist = await Influencer.findById(id);
    if (!influencerExist)
      return res
        .status(404)
        .json({ error: true, message: "Influencer not found" });

    influencerExist.status = "Deleted";
    await influencerExist.save();
    res.status(200).json({
      error: false,
      message: "Influencer deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const emailVerificationLogin = async (req, res) => {
  try {
    const existingUserWithEmail = await Influencer.findOne({
      "influencerDetails.email": req.body.email,
    });
    if (!existingUserWithEmail)
      return res.status(404).json({
        error: true,
        message: "Influencer does not exist with this email",
      });

    const { token } = await generateEmailToken(existingUserWithEmail);
    res.status(200).json({
      error: false,
      Token: token,
      email: req.body.email,
      message: "Got the token successfully",
    });
  } catch (error) {
    console.error("error occured : ", error);
    return res.status(401).json({ error: true, message: error.message });
  }
};

const loginInfluencer = async (req, res) => {
  try {
    const { token, password, rememberMe } = req.body;
    console.log(token);

    const decoded = await verifyPasswordToken(token, res);
    console.log(decoded.tokenDetails);

    const influencerExist = await Influencer.findById(decoded.tokenDetails._id);
    if (!influencerExist)
      return res
        .status(404)
        .json({ error: true, message: "Influencer not found " });

    const id = influencerExist._id;
    const name = influencerExist.influencerDetails.name;
    const email = influencerExist.influencerDetails.email;

    // Decrypt
    let bytes = CryptoJS.AES.decrypt(password, "$dQP59&_as+ZcvQ}");
    let originalText = bytes.toString(CryptoJS.enc.Utf8);

    console.log(originalText);

    const verifiedPassword = await bcrypt.compare(
      originalText,
      influencerExist.password
    );

    if (!verifiedPassword)
      return res
        .status(401)
        .json({ error: true, message: "Invalid email/phone/password" });

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      influencerExist,
      rememberMe
    );

    const responseObject = {
      error: false,
      id,
      name,
      email,
      accessToken,
      refreshToken,
      message: "Logged in successfully",
    };

    res.status(200).json(responseObject);
  } catch (error) {
    console.error("error occured : ", error);
    return res.status(401).json({ error: true, message: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const id = req.user?._id;
    console.log(id);
    const { oldPassword, newPassword, confirmPassword } = req.body;

    const { error } = changePasswordValidation(req.body);

    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        error: true,
        message: "New password and confirm password do not match.",
      });
    }

    // Find the user in the database based on the email
    const influencerExist = await Influencer.findById(id); // Assuming 'User' is the Mongoose model for your users collection
    if (!influencerExist) {
      return res
        .status(404)
        .json({ error: true, message: "influencer not found." });
    }

    if (!oldPassword) {
      return res.status(400).json({
        error: true,
        message: "Please provide old password !!",
      });
    }

    // Check if the old password matches the one in the database
    const isOldPasswordMatch = await bcrypt.compare(
      oldPassword,
      influencerExist.password
    );
    if (!isOldPasswordMatch) {
      return res
        .status(409)
        .json({ error: true, message: "Old password is incorrect." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    influencerExist.password = hashedPassword;
    await influencerExist.save(); // Save the updated user to the database

    return res
      .status(200)
      .json({ error: false, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal Server error. Please try again later.",
    });
  }
};

const forgotPasswordEmailVerify = async (req, res) => {
  try {
    const existingUserWithEmail = await Influencer.findOne({
      "influencerDetails.email": req.body.email,
    });
    if (!existingUserWithEmail)
      return res.status(404).json({
        error: true,
        message: "Influencer does not exist with this email",
      });

    const { FPToken } = await generateForgotPasswordToken(
      existingUserWithEmail
    );
    console.log(FPToken);
    const otp = await sendOtpFuncForForgotPass(req.body.email);

    res.status(200).json({
      error: false,
      Token: FPToken,
      otp: otp,
      message: "Got the token successfully",
    });
  } catch (error) {
    console.error("error occured : ", error);
    return res.status(401).json({ error: true, message: error.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const existingUserWithEmail = await Influencer.findOne({
      "influencerDetails.email": req.body.email,
    });
    if (!existingUserWithEmail)
      return res.status(404).json({
        error: true,
        message: "Influencer does not exist with this email",
      });

    const otp = await sendOtpFuncForForgotPass(req.body.email);

    res.status(200).json({
      error: false,
      otp: otp,
      message: "Got the token successfully",
    });
  } catch (error) {
    console.error("error occured : ", error);
    return res.status(401).json({ error: true, message: error.message });
  }
};

const verifyOtpForgotPassword = async (req, res) => {
  try {
    console.log(req.body.otp);
    const decodedUser = await verifyFPToken(req.body.token);
    console.log(decodedUser.tokenDetails.email);

    const otpHolder = await ForgotPassOtp.find({
      email: decodedUser.tokenDetails.email,
    });

    if (otpHolder.length === 0)
      return res
        .status(404)
        .json({ error: true, message: "try resend otp !!!" });
    const rightOtpFind = otpHolder[otpHolder.length - 1];
    const validUser = await bcrypt.compare(req.body.otp, rightOtpFind.otp);

    if (rightOtpFind.email === decodedUser.tokenDetails.email && validUser) {
      return res.status(200).send({
        error: false,
        message: "veryfied Successfully!",
      });
    } else {
      return res
        .status(422)
        .json({ error: true, message: "your otp is wrong" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const resetForgotPassword = async (req, res) => {
  try {
    const { error } = resetPasswordBodyValidation(req.body);
    if (error)
      return res
        .status(400)
        .json({ error: true, message: error.details[0].message });

    const token = req.body.token;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;

    const decodedUser = await verifyFPToken(token);
    console.log(decodedUser.tokenDetails._id);

    const influencerExist = await Influencer.findById(
      decodedUser.tokenDetails._id
    );

    if (!influencerExist) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match.");
      return res.status(400).json({
        error: true,
        message: "password and confirm password does not match",
      });
    }

    // Hash the new password using bcrypt
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
      if (err) {
        console.log("Error hashing password:", err);
        return res
          .status(400)
          .json({ error: true, message: "bcrypt hashing error" });
      }

      // Update the user's password
      influencerExist.password = hashedPassword;
      influencerExist.save();

      console.log("Password reset successfully.");
    });

    res
      .status(200)
      .json({ error: false, message: "password reset successfully" });
  } catch (err) {
    console.error(err);

    const errorResponse = {
      error: true,
      message: err.message,
    };

    if (err.status === 401 && err.message === "Token expired ") {
      errorResponse.isTokenExpired = true;
    }

    return res.status(err.status || 500).json(errorResponse);
  }
};

const getCountryData = async (req, res) => {
  try {
    res.json({
      error: false,
      countriesData: countriesData,
      message: "Got Countries Data successfully ",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  addInfluencer,
  getAllInfluencer,
  getInfluencerForExternal,
  getInfluencerDetails,
  updateInfluencer,
  changeInfluencerStatus,
  deleteInfluencer,
  loginInfluencer,
  emailVerificationLogin,
  changePassword,
  forgotPasswordEmailVerify,
  verifyOtpForgotPassword,
  resetForgotPassword,
  updateInfluencerByAdmin,
  getCountryData,
  resendOtp,
};
