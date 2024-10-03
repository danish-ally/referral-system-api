const ReferralLink = require("../../models/referralLink");
const validatePayload = require("../../helpers/validatePayload");
const generateUniqueReferralCode = require("../../helpers/generateUniqueReferralCode");
const generateReferralLink = require("../../helpers/generateReferralLink");
const Plan = require("../../../Plan/models/PlanModel");
const generateJwtToken = require("../../helpers/generateJwtToken");
const ReferredStudent = require("../../../Referred-student/models/referredStudent");
const Influencer = require("../../../Influencer/models/InfluencerModel");
const { checkPrimeSync } = require("crypto");
const mailgun = require("mailgun-js");
const emailtemplate = require("../../../common/emailTemplate/mail");
const skillerbitraTemp = require("../../../common/emailTemplate/skillerbitra");
const shortid = require("shortid");



const generate_referral_link = async (req, res) => {
  const user = req.user;
  const userId = user?._id || user?.user_id;
  const role = user?.role;

  console.log("user:: ", user);

  try {
    // Validate payload from the request body
    console.log(req.body);
    const isValidPayload = validatePayload(req.body);

    if (!isValidPayload) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const planId = req.body.planId;
    // Retrieve plan details by planId
    const planDetails = await Plan.findOne({ _id: planId });

    if (!planDetails) {
      return res.status(404).json({ message: "Plan not found." });
    }

    console.log("planDetails:", planDetails);

    // Generate a unique referral code (using a library or custom function)
    const referralCode = generateUniqueReferralCode(role);
    console.log("referralCode", referralCode);
    // Check if the referral code already exists in the database
    const existingReferralLink = await ReferralLink.findOne({ referralCode });

    if (existingReferralLink) {
      return res.status(400).json({ message: "Referral code already exists." });
    }
    //Changes Regarding Link
    const channelInfo = req.body.channelInfo;
    const courseInfo = req.body.courseInfo;
    const courseType = req.body.courseType;
    console.log(courseInfo, "courseInfo")
    const plan = await Plan.findById(planId).exec();
    const plancourseInfo = plan.courseInfo;
    const urlSegment = plancourseInfo.urlSegment;

    console.log(urlSegment, "urlSegment");

    const myreferralLink = await generateReferralLink(
      channelInfo,
      courseInfo,
      urlSegment,
      referralCode,
      courseType
    );
    const referralLink = myreferralLink.referralLink;
    console.log(referralLink, "referralLink");

    const shortUrl = shortid.generate();

    // Generate a JWT token using the payload
    const tokenPayload = {
      planId: req.body.planId,
      // Add other necessary payload data
    };

    const generatedToken = await generateJwtToken(tokenPayload);

    console.log("Generated Token:", generatedToken);

    // Create a new referral link object
    const newReferralLink = new ReferralLink({
      userInfo: {
        id: userId,
        name: user?.name,
        email: user?.email,
        countryCode: user?.countryCode,
        phone: user?.phone,
      },
      channelInfo: req.body.channelInfo,
      userType: role,
      planId: req.body.planId,
      userDiscount: {
        discountType: req.body.discountType,
        discountAmount: req.body.discountAmount,
        userEarning: req.body.userEarning,
        studentEarning: req.body.studentEarning,
        userEarningAmount: req.body.userEarningAmount,
        studentEarningAmount: req.body.studentEarningAmount,
        upto: req.body.upto
      },
      validityRange: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      },
      userLimit: req.body.userLimit,
      status: req.body.status,
      referralLink: referralLink,
      referralCode: referralCode,
      token: generatedToken,
      courseType: req.body.courseType,
      courseInfo: req.body.courseInfo || null,
      coursePlanInfo: req.body.coursePlanInfo,
      createdBy: {
        id: userId,
        name: user?.name,
        email: user?.email,
        countryCode: user?.countryCode,
        phone: user?.phone,
      },
      shortUrl: shortUrl,
      planName: planDetails.planName,
    });

    console.log("New Referral Link Object:", newReferralLink);

    // Save the referral link to the database
    const savedReferralLink = await newReferralLink.save();

    console.log("Saved Referral Link:", savedReferralLink);

    // Respond with the saved referral link
    return res.status(201).json({
      message: "Link generated sucessfully",
      savedReferralLink,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const generate_referral_link_By_Admin_For_Influencer = async (req, res) => {
  const user = req.user;
  const userId = user?._id || user?.user_id;
  const role = user?.role;

  console.log("user:: ", user);

  try {
    // Validate payload from the request body
    console.log(req.body);
    const isValidPayload = validatePayload(req.body);

    if (!isValidPayload) {
      return res.status(400).json({ message: "Invalid payload." });
    }

    const planId = req.body.planId;
    // Retrieve plan details by planId
    const planDetails = await Plan.findOne({ _id: planId });

    if (!planDetails) {
      return res.status(404).json({ message: "Plan not found." });
    }

    console.log("planDetails:", planDetails);

    // Generate a unique referral code (using a library or custom function)
    const referralCode = generateUniqueReferralCode(role);
    console.log("referralCode", referralCode);
    // Check if the referral code already exists in the database
    const existingReferralLink = await ReferralLink.findOne({ referralCode });

    if (existingReferralLink) {
      return res.status(400).json({ message: "Referral code already exists." });
    }
    //Changes Regarding Link
    const channelInfo = req.body.channelInfo;
    const courseInfo = req.body.courseInfo;
    const courseType = req.body.courseType
    const plan = await Plan.findById(planId).exec();
    const plancourseInfo = plan.courseInfo;
    const urlSegment = plancourseInfo.urlSegment;

    const myreferralLink = await generateReferralLink(
      channelInfo,
      courseInfo,
      urlSegment,
      referralCode,
      courseType
    );
    const referralLink = myreferralLink.referralLink;
    const shortUrl = shortid.generate();
    console.log(referralLink, "referralLink");

    // Generate a JWT token using the payload
    const tokenPayload = {
      planId: req.body.planId,
      // Add other necessary payload data
    };

    const generatedToken = await generateJwtToken(tokenPayload);

    console.log("Generated Token:", generatedToken);

    // Create a new referral link object
    const newReferralLink = new ReferralLink({
      userInfo: {
        id: req.body.userInfo.id,
        name: req.body.userInfo.name,
        email: req.body.userInfo.email,
        phone: req.body.userInfo.phone,
      },
      channelInfo: req.body.channelInfo,
      userType: role,
      planId: req.body.planId,
      userDiscount: {
        discountType: req.body.discountType,
        discountAmount: req.body.discountAmount,
        userEarning: req.body.userEarning,
        studentEarning: req.body.studentEarning,
        userEarningAmount: req.body.userEarningAmount,
        studentEarningAmount: req.body.studentEarningAmount,
        upto: req.body.upto
      },
      validityRange: {
        startDate: req.body.startDate,
        endDate: req.body.endDate,
      },
      userLimit: req.body.userLimit,
      status: req.body.status,
      referralLink: referralLink,
      referralCode: referralCode,
      token: generatedToken,
      courseType: req.body.courseType,
      courseInfo: req.body.courseInfo,
      coursePlanInfo: req.body.coursePlanInfo,
      createdBy: {
        id: userId,
        name: user?.name,
        email: user?.email,
        countryCode: user?.countryCode,
        phone: user?.phone,
      },
      shortUrl: shortUrl,
      planName: planDetails.planName,
    });

    console.log("New Referral Link Object:", newReferralLink);

    // Save the referral link to the database
    const savedReferralLink = await newReferralLink.save();

    console.log("Saved Referral Link:", savedReferralLink);

    // Respond with the saved referral link
    return res.status(201).json({
      message: "Link generated sucessfully",
      savedReferralLink,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const list_of_referral_link = async (req, res) => {
  const user = req.user;
  const userId = user?._id || user?.user_id;
  const role = user?.role;

  console.log("user:: ", user);
  console.log("userId::", userId);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const planId = req.query.planId;
  const search = req.query.search;
  const channel = req.query.channel;
  const course = parseInt(req.query.course);
  const library = parseInt(req.query.library);
  const Offer = parseInt(req.query.offer);
  const courseType = req.query.courseType;
  const userType = req.query.userType;

  try {
    const filter = {};

    if (role == "influencer") {
      filter["createdBy.id"] = userId;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "Cancelled" };
    }

    if (planId) {
      filter.planId = planId;
    }

    if (courseType) {
      filter.courseType = courseType;
    }
    if (userType) {
      filter.userType = userType;
    }

    if (channel) {
      filter["channelInfo.lsSaRefId"] = channel;
    }

    if (course) {
      filter.$or = [
        { courseType: "standalone", "courseInfo.lsSaId": course },
        ...(filter.$or || []),
      ];
    }

    if (library) {
      filter.$or = [
        { courseType: "package", "courseInfo.lsSaId": library },
        ...(filter.$or || []),
      ];
    }

    if (Offer) {
      filter.$or = [
        { courseType: "bootcamp", "courseInfo.lsSaId": Offer },
        ...(filter.$or || []),
      ];
    }

    if (Offer && library) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": Offer }],
        },
        {
          $and: [{ courseType: "package" }, { "courseInfo.lsSaId": library }],
        },
      ];
    }

    if (course && Offer) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": Offer }],
        },
        {
          $and: [{ courseType: "standalone" }, { "courseInfo.lsSaId": course }],
        },
      ];
    }

    if (course && library) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "package" }, { "courseInfo.lsSaId": library }],
        },
        {
          $and: [{ courseType: "standalone" }, { "courseInfo.lsSaId": course }],
        },
      ];
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { referralLink: { $regex: new RegExp(search, "i") } },
        { channel: { $regex: new RegExp(search, "i") } },
        { "userDiscount.discountType": { $regex: new RegExp(search, "i") } },
        { "userInfo.name": { $regex: new RegExp(search, "i") } },
        { "userInfo.email": { $regex: new RegExp(search, "i") } },
        // { 'userDiscount.discountAmount': { $regex: new RegExp(search, 'i') } },
        // { userLimit: { $regex: new RegExp(search, 'i') } },
        { referralCode: { $regex: new RegExp(search, "i") } },
        { courseType: { $regex: new RegExp(search, "i") } },
        // Update: Use $expr and $regexMatch for numeric fields
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$userDiscount.discountAmount" },
              regex: new RegExp(search, "i"),
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$userLimit" },
              regex: new RegExp(search, "i"),
            },
          },
        },
        { planName: { $regex: new RegExp(search, "i") } },
        // Add more fields as needed
      ];
    }

    console.log("filter:", filter);

    const count = await ReferralLink.countDocuments(filter);

    let referralLinks;

    if (count > 0) {
      referralLinks = await ReferralLink.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } else {
      referralLinks = [];
    }

    // Calculate totalEarning
    let totalEarning = 0;
    let lawSikhoTotalEarning = 0;
    let skillerbitraTotalEarning = 0;
    let lawsikhoRegistered = 0;
    let skillerbitraRegistred = 0;
    let totalRegistered = 0;

    // Iterate through each referral link
    const updatedReferralLinks = [];

    for (const referralLink of referralLinks) {
      const planId = referralLink.planId;

      // Retrieve plan details by planId
      const planDetails = await Plan.findOne({ _id: planId });

      if (!planDetails) {
        return res.status(404).json({ message: "Plan not found." });
      }

      // console.log("planDetails:", planDetails)

      // Convert Mongoose document to plain JavaScript object

      let referralLinkObject = referralLink.toObject();
      referralLinkObject.planName = planDetails.planName;
      referralLinkObject.planValidityRange = planDetails.planValidityRange;
      referralLinkObject.planDetails = planDetails
      referralLinkObject.planDiscountDetails = {
        influencerDiscount: planDetails?.influencerDiscount,
        studentDiscount: planDetails?.studentDiscount,
        adminDiscount: planDetails?.adminDiscount,
      };
      const validFor = [];
      if (planDetails.appliedForAllAdmin) {
        validFor.push("admin");
      } else if (planDetails.appliedForAllInfluencer) {
        validFor.push("influencer");
      } else if (planDetails.appliedForAllStudent) {
        validFor.push("student");
      }

      referralLinkObject.validFor = validFor;

      const referredStudents = await ReferredStudent.find({
        referralLinkId: referralLink._id,
      });

      // Add a new property to each referralLink
      referralLinkObject.registeredTillNow = referredStudents.length;
      updatedReferralLinks.push(referralLinkObject);
    }

    // FOR REPORT
    const referralLinksWithoutPagination = await ReferralLink.find(filter).sort(
      { createdAt: -1 }
    );

    console.log(referralLinksWithoutPagination.length);
    for (const referralLink of referralLinksWithoutPagination) {
      const referredStudents = await ReferredStudent.find({
        referralLinkId: referralLink._id,
      });
      // Assuming discountPrice is a string, convert it to a numeric value
      const numericDiscountPrice = parseFloat(referralLink.earningAmount);
      // Check if the conversion is successful (not NaN)
      if (!isNaN(numericDiscountPrice)) {
        totalEarning += numericDiscountPrice;
      }

      // Counting total Lawsikho earning
      if (referralLink?.channelInfo?.lsSaRefId == "1") {
        // Assuming discountPrice is a string, convert it to a numeric value
        const numericDiscountPrice = parseFloat(referralLink.earningAmount);
        // Check if the conversion is successful (not NaN)
        if (!isNaN(numericDiscountPrice)) {
          lawSikhoTotalEarning += numericDiscountPrice;
        }
      }

      // Counting total Skillerbitra earning
      if (referralLink?.channelInfo?.lsSaRefId == "2") {
        // Assuming discountPrice is a string, convert it to a numeric value
        const numericDiscountPrice = parseFloat(referralLink.earningAmount);
        // Check if the conversion is successful (not NaN)
        if (!isNaN(numericDiscountPrice)) {
          skillerbitraTotalEarning += numericDiscountPrice;
        }
      }

      console.log("referredStudents coint:", referredStudents.length);
      referredStudents.forEach((student) => {
        // Counting total Lawsikho earning
        if (student?.channelInfo?.lsSaRefId == "1") {
          // counting lawsikho registered
          lawsikhoRegistered += 1;
        }

        console.log("student?.channelInfo?.lsSaRefId", student?.channelInfo?.lsSaRefId, referralLink._id);
        // Counting total Skillerbitra earning
        if (student?.channelInfo?.lsSaRefId == "2") {
          // counting skillerbitra registered
          skillerbitraRegistred += 1;
        }
      });
    }


    totalRegistered = lawsikhoRegistered + skillerbitraRegistred;

    console.log("updatedReferralLinks count", updatedReferralLinks.length);

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit,
      referralLink: updatedReferralLinks,
      totalEarning,
      lawSikhoTotalEarning,
      skillerbitraTotalEarning,
      totalRegistered,
      lawsikhoRegistered,
      skillerbitraRegistred,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};


const list_of_referral_link_for_influencer = async (req, res) => {
  const influencerId = req.params.id;
  const user = req.user;
  const userId = user?._id || user?.user_id;

  console.log("user:: ", user);
  console.log("userId::", userId);

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  const planId = req.query.planId;
  const search = req.query.search;
  const channel = req.query.channel;
  const course = parseInt(req.query.course);
  const library = parseInt(req.query.library);
  const Offer = parseInt(req.query.offer);
  const courseType = req.query.courseType;
  const userType = req.query.userType;

  try {
    const influencerExist = await Influencer.findById(influencerId);
    if (!influencerExist) {
      return res.status(404).json({ message: "Influencer does not exist !!!" });
    }
    const influencerEmail = influencerExist.influencerDetails.email;
    const role = "influencer";
    const filter = {};

    if (role == "influencer") {
      filter["userInfo.email"] = influencerEmail;
    }

    if (status) {
      filter.status = status;
    } else {
      filter.status = { $ne: "Cancelled" };
    }

    if (planId) {
      filter.planId = planId;
    }

    if (courseType) {
      filter.courseType = courseType;
    }
    if (userType) {
      filter.userType = userType;
    }

    if (channel) {
      filter["channelInfo.lsSaRefId"] = channel;
    }

    if (course) {
      filter.$or = [
        { courseType: "standalone", "courseInfo.lsSaId": course },
        ...(filter.$or || []),
      ];
    }

    if (library) {
      filter.$or = [
        { courseType: "package", "courseInfo.lsSaId": library },
        ...(filter.$or || []),
      ];
    }

    if (Offer) {
      filter.$or = [
        { courseType: "bootcamp", "courseInfo.lsSaId": Offer },
        ...(filter.$or || []),
      ];
    }

    if (Offer && library) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": Offer }],
        },
        {
          $and: [{ courseType: "package" }, { "courseInfo.lsSaId": library }],
        },
      ];
    }

    if (course && Offer) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": Offer }],
        },
        {
          $and: [{ courseType: "standalone" }, { "courseInfo.lsSaId": course }],
        },
      ];
    }

    if (course && library) {
      filter.$or = [
        ...(filter.$or || []),
        {
          $and: [{ courseType: "package" }, { "courseInfo.lsSaId": library }],
        },
        {
          $and: [{ courseType: "standalone" }, { "courseInfo.lsSaId": course }],
        },
      ];
    }

    // Add search functionality
    if (search) {
      filter.$or = [
        { referralLink: { $regex: new RegExp(search, "i") } },
        { channel: { $regex: new RegExp(search, "i") } },
        { "userDiscount.discountType": { $regex: new RegExp(search, "i") } },
        // { 'userDiscount.discountAmount': { $regex: new RegExp(search, 'i') } },
        // { userLimit: { $regex: new RegExp(search, 'i') } },
        { referralCode: { $regex: new RegExp(search, "i") } },
        { courseType: { $regex: new RegExp(search, "i") } },
        // Update: Use $expr and $regexMatch for numeric fields
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$userDiscount.discountAmount" },
              regex: new RegExp(search, "i"),
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: { $toString: "$userLimit" },
              regex: new RegExp(search, "i"),
            },
          },
        },
        { planName: { $regex: new RegExp(search, "i") } },
        // Add more fields as needed
      ];
    }

    console.log("filter:", filter);

    const count = await ReferralLink.countDocuments(filter);

    let referralLinks;

    if (count > 0) {
      referralLinks = await ReferralLink.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();
    } else {
      referralLinks = [];
    }

    // Calculate totalEarning
    let totalEarning = 0;
    let lawSikhoTotalEarning = 0;
    let skillerbitraTotalEarning = 0;
    let lawsikhoRegistered = 0;
    let skillerbitraRegistred = 0;
    let totalRegistered = 0;

    // Iterate through each referral link
    const updatedReferralLinks = [];

    for (const referralLink of referralLinks) {
      const planId = referralLink.planId;

      // Retrieve plan details by planId
      const planDetails = await Plan.findOne({ _id: planId });

      if (!planDetails) {
        return res.status(404).json({ message: "Plan not found." });
      }

      // console.log("planDetails:", planDetails)

      // Convert Mongoose document to plain JavaScript object

      let referralLinkObject = referralLink.toObject();
      referralLinkObject.planName = planDetails.planName;
      referralLinkObject.planValidityRange = planDetails.planValidityRange;
      referralLinkObject.planDiscountDetails = {
        influencerDiscount: planDetails?.influencerDiscount,
        studentDiscount: planDetails?.studentDiscount,
        adminDiscount: planDetails?.adminDiscount,
      };
      const validFor = [];
      if (planDetails.appliedForAllAdmin) {
        validFor.push("admin");
      } else if (planDetails.appliedForAllInfluencer) {
        validFor.push("influencer");
      } else if (planDetails.appliedForAllStudent) {
        validFor.push("student");
      }

      referralLinkObject.validFor = validFor;

      const referredStudents = await ReferredStudent.find({
        referralLinkId: referralLink._id,
      });

      // Add a new property to each referralLink
      referralLinkObject.registeredTillNow = referredStudents.length;
      updatedReferralLinks.push(referralLinkObject);
    }

    // FOR REPORT
    const referralLinksWithoutPagination = await ReferralLink.find(filter).sort(
      { createdAt: -1 }
    );

    console.log(referralLinksWithoutPagination.length);
    for (const referralLink of referralLinksWithoutPagination) {
      const referredStudents = await ReferredStudent.find({
        referralLinkId: referralLink._id,
      });
      // Assuming discountPrice is a string, convert it to a numeric value
      const numericDiscountPrice = parseFloat(referralLink.earningAmount);
      // Check if the conversion is successful (not NaN)
      if (!isNaN(numericDiscountPrice)) {
        totalEarning += numericDiscountPrice;
      }

      // Counting total Lawsikho earning
      if (referralLink?.channelInfo?.lsSaRefId == "1") {
        // Assuming discountPrice is a string, convert it to a numeric value
        const numericDiscountPrice = parseFloat(referralLink.earningAmount);
        // Check if the conversion is successful (not NaN)
        if (!isNaN(numericDiscountPrice)) {
          lawSikhoTotalEarning += numericDiscountPrice;
        }
      }

      // Counting total Skillerbitra earning
      if (referralLink?.channelInfo?.lsSaRefId == "2") {
        // Assuming discountPrice is a string, convert it to a numeric value
        const numericDiscountPrice = parseFloat(referralLink.earningAmount);
        // Check if the conversion is successful (not NaN)
        if (!isNaN(numericDiscountPrice)) {
          skillerbitraTotalEarning += numericDiscountPrice;
        }
      }

      console.log("referredStudents coint:", referredStudents.length);
      referredStudents.forEach((student) => {
        // Counting total Lawsikho earning
        if (student?.channelInfo?.lsSaRefId == "1") {
          // counting lawsikho registered
          lawsikhoRegistered += 1;
        }

        // Counting total Skillerbitra earning
        if (student?.channelInfo?.lsSaRefId == "2") {
          // counting skillerbitra registered
          skillerbitraRegistred += 1;
        }
      });
    }


    totalRegistered = lawsikhoRegistered + skillerbitraRegistred;

    console.log("updatedReferralLinks count", updatedReferralLinks.length);

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      pageSize: limit,
      referralLink: updatedReferralLinks,
      totalEarning,
      lawSikhoTotalEarning,
      skillerbitraTotalEarning,
      totalRegistered,
      lawsikhoRegistered,
      skillerbitraRegistred,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const delete_referral_link = async (req, res) => {
  try {
    if (!req.params.referralLinkId) {
      return res
        .status(400)
        .json({ message: `Missing required params: referralLinkId` });
    }

    const referralLink = await ReferralLink.findByIdAndUpdate(
      req.params.referralLinkId,
      { status: "Cancelled" },
      { new: true }
    );
    if (!referralLink) {
      return res.status(404).json({ message: "ReferralLink not found" });
    }

    return res.json({ message: "ReferralLink Deleted" });
  } catch (err) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const update_referral_link = async (req, res) => {
  const user = req.user;
  const userId = user?._id || user?.user_id;

  console.log("user:: ", user);

  try {
    const referralLinkId = req.params.referralLinkId;

    // Retrieve existing referral link details by referralLinkId
    const existingReferralLink = await ReferralLink.findById(referralLinkId);

    if (!existingReferralLink) {
      return res.status(404).json({ message: "Referral link not found." });
    }

    const beforeChangeReflink = JSON.parse(
      JSON.stringify(existingReferralLink)
    );
    // Remove the editLog property
    delete beforeChangeReflink.editLog;

    console.log("beforeChangeReflink ", beforeChangeReflink);

    const planId = req.body.planId || existingReferralLink.planId;
    // Retrieve plan details by planId
    const planDetails = await Plan.findOne({ _id: planId });

    if (!planDetails) {
      return res.status(404).json({ message: "Plan not found." });
    }

    console.log("planDetails:", planDetails);

    // Update referral link properties
    existingReferralLink.channelInfo =
      req.body.channelInfo || existingReferralLink.channelInfo;
    existingReferralLink.planId =
      req.body.planId || existingReferralLink.planId;
    existingReferralLink.userDiscount = {
      discountType:
        req.body.discountType || existingReferralLink.userDiscount.discountType,
      discountAmount:
        req.body.discountAmount ||
        existingReferralLink.userDiscount.discountAmount,
      userEarning:
        req.body.userEarning || existingReferralLink.userDiscount.userEarning,
      studentEarning:
        req.body.studentEarning ||
        existingReferralLink.userDiscount.studentEarning,
      userEarningAmount:
        req.body.userEarningAmount ||
        existingReferralLink.userDiscount.userEarningAmount,
      studentEarningAmount:
        req.body.studentEarningAmount ||
        existingReferralLink.userDiscount.studentEarningAmount,
      upto:
        req.body.upto ||
        existingReferralLink.userDiscount.upto,
    };
    existingReferralLink.validityRange = {
      startDate:
        req.body.startDate || existingReferralLink.validityRange.startDate,
      endDate: req.body.endDate || existingReferralLink.validityRange.endDate,
    };
    existingReferralLink.userLimit =
      req.body.userLimit || existingReferralLink.userLimit;
    existingReferralLink.status =
      req.body.status || existingReferralLink.status;
    existingReferralLink.courseType =
      req.body.courseType || existingReferralLink.courseType;
    existingReferralLink.courseInfo =
      req.body.courseInfo || existingReferralLink.courseInfo;
    existingReferralLink.status =
      req.body.status || existingReferralLink.status;
    existingReferralLink.coursePlanInfo =
      req.body.coursePlanInfo || existingReferralLink.coursePlanInfo;
    existingReferralLink.shortUrl = shortid.generate();

    // Generate a JWT token using the payload
    const tokenPayload = {
      planId: req.body.planId || existingReferralLink.planId,
      // Add other necessary payload data
    };

    // Update token
    const generatedToken = await generateJwtToken(tokenPayload);
    console.log("Updated Generated Token:", generatedToken);
    existingReferralLink.token = generatedToken;

    // Update referral link
    //Changes Regarding Link
    const channelInfo =
      req.body.channelInfo || existingReferralLink.channelInfo;
    const courseInfo = req.body.courseInfo || existingReferralLink.courseInfo;
    const courseType = req.body.courseType || existingReferralLink.courseType
    const plan = await Plan.findById(planId).exec();
    const plancourseInfo = plan.courseInfo;
    const urlSegment = plancourseInfo.urlSegment;
    const referralCode = existingReferralLink.referralCode;

    const myreferralLink = await generateReferralLink(
      channelInfo,
      courseInfo,
      urlSegment,
      referralCode,
      courseType
    );
    const referralLink = myreferralLink.referralLink;
    console.log("Updated referralLink:", referralLink);

    existingReferralLink.referralLink = referralLink;


    const afterChangeReflink = JSON.parse(
      JSON.stringify(existingReferralLink)
    );
    // Remove the editLog property
    delete afterChangeReflink.editLog;

    console.log("beforeChangeReflink :", afterChangeReflink);

    // update edit log
    existingReferralLink.editLog.push({
      changeTime: new Date(),
      changeBy: {
        refId: userId || null,
        name: user?.name || null,
        email: user?.email,
        countryCode: user?.countryCode || null,
        phoneNo: user?.phone || null,
        contactedNumber: `${user?.countryCode || "" + user?.phone || ""}`,
      },
      beforeChanges: beforeChangeReflink,
      afterChanges: afterChangeReflink,
    });

    // Save the updated referral link to the database
    const updatedReferralLink = await existingReferralLink.save();

    // Respond with the updated referral link
    return res.status(200).json({
      message: "Updated sucessfully.",
      updatedReferralLink,
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};

const change_status_referral_link = async (req, res) => {
  try {
    const id = req.params.referralLinkId;

    if (!req.body.status) {
      return res
        .status(400)
        .json({ error: true, message: "Please provide status in payload" });
    }

    const linkExists = await ReferralLink.findById(id);

    if (!linkExists)
      return res
        .status(404)
        .json({ error: true, message: "ReferralLink not found" });

    linkExists.status = req.body.status;

    const result = await linkExists.save();

    res.status(200).json({
      error: false,
      result,
      message: "Link Status updated successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

const student_earning_details_by_channelId = async (req, res) => {
  const channelId = req.params.channelId;
  const studentId = req.query.studentId;
  console.log("hey");

  try {
    const filter = {
      "channelInfo.lsSaRefId": channelId,
      userType: "student",
    };

    if (studentId) {
      filter["userInfo.id"] = studentId;
    }

    // Find and sort referral links in descending order by createdAt
    const referralLinks = await ReferralLink.find(filter).sort({ createdAt: -1 });

    const result = await Promise.all(
      referralLinks.map(async (link) => {
        const { earningAmount, courseInfo, courseType, userDiscount, planId, registeredCount } = link.toObject();

        console.log("planId", planId);

        // Retrieve plan details by planId
        const planDetails = await Plan.findById(planId);

        if (!planDetails) {
          throw new Error("Plan not found.");
        }

        const planName = planDetails.planName;
        console.log("planName", planName);
        const referralUpto = planDetails.studentDiscount.referralUpto
        console.log("referralUpto", referralUpto)

        return {
          earningAmount,
          courseInfo,
          courseType,
          userDiscount,
          planName,
          referralUpto,
          totalReferred: registeredCount
        };
      })
    );



    // Filter out results with earningAmount equal to 0
    const filteredResult = result.filter((item) => item.earningAmount !== 0);
    console.log(filteredResult)


    // Calculate total earning for all referral links
    const totalEarning = filteredResult.reduce(
      (sum, referralLink) => sum + referralLink.earningAmount,
      0
    );

    const totalRegistered = filteredResult.reduce(
      (sum, referralLink) => sum + referralLink.totalReferred,
      0
    );

    return res.status(200).json({
      totalDocs: filteredResult.length,
      result: filteredResult,
      totalEarning,
      totalRegistered
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(404).json({ error: error.message || "Internal Server Error" });
  }
};


const sendingMail = async (req, res) => {
  const emails = req.body.emails.split(",");

  if (!req.params.referralLinkId) {
    return res
      .status(400)
      .json({ message: `Missing required params: referralLinkId` });
  }

  const referralLink = await ReferralLink.findById(req.params.referralLinkId);
  if (!referralLink) {
    return res.status(404).json({ message: "ReferralLink not found" });
  }

  let finalTemp;
  let modifiedUserHTML;
  let modifiedSkillerbitraTemp;
  let mg
  let fromEmail

  if (referralLink.channelInfo?.lsSaRefId == "1") {
    console.log("LAWSIKHO");

    // Instantiate the Mailgun API client
    mg = mailgun({
      apiKey: process.env.LAWSIKHO_KEY,
      domain: process.env.LAWSIKHO_DOMAIN,
    });

    fromEmail = process.env.EMAIL_FROM_LAWSIKHO
    modifiedUserHTML = emailtemplate.replace(
      /{referralLink}/g,
      referralLink.referralLink
    );
    modifiedUserHTML = modifiedUserHTML.replace(
      /{logoImage}/g,
      "https://assignment-portal.s3.ap-south-1.amazonaws.com/logo/lawsikho-new.jpeg"
    );
    modifiedUserHTML = modifiedUserHTML.replace(
      /{referralCode}/g,
      referralLink.referralCode
    );

    console.log(referralLink.userDiscount?.discountType);
    if (referralLink.userDiscount?.discountType === "Flat" && typeof referralLink.userDiscount?.studentEarning === 'number') {
      console.log("IN");
      modifiedUserHTML = modifiedUserHTML.replace(
        /{discount}/g,
        "₹" + referralLink.userDiscount.studentEarning
      );
    } else if (typeof referralLink.userDiscount?.studentEarning === 'number') {
      modifiedUserHTML = modifiedUserHTML.replace(
        /{discount}/g,
        referralLink.userDiscount.studentEarning + "%"
      );
      console.log("OUT");
    }


    finalTemp = modifiedUserHTML;
  } else {
    console.log("SKILLER");

    // Instantiate the Mailgun API client
    mg = mailgun({
      apiKey: process.env.SKILLARBITRAGE_KEY,
      domain: process.env.SKILLARBITRAGE_DOMAIN,
      host: process.env.SKILLARBITRA_HOST,
    });
    fromEmail = process.env.EMAIL_FROM_SKILLARBITRAGE

    modifiedSkillerbitraTemp = skillerbitraTemp.replace(
      /{referralLink}/g,
      referralLink.referralLink
    );
    modifiedSkillerbitraTemp = modifiedSkillerbitraTemp.replace(
      /{logoImage}/g,
      "https://assignment-portal.s3.ap-south-1.amazonaws.com/SA_blue.png"
    );
    modifiedSkillerbitraTemp = modifiedSkillerbitraTemp.replace(
      /{referralCode}/g,
      referralLink.referralCode
    );
    console.log(referralLink.userDiscount?.discountType);
    if (referralLink.userDiscount?.discountType == "Flat" && typeof referralLink.userDiscount?.studentEarning === 'number') {
      console.log("IN");
      modifiedSkillerbitraTemp = modifiedSkillerbitraTemp.replace(
        /{discount}/g,
        "₹" + referralLink.userDiscount?.studentEarning
      );
    } else if (typeof referralLink.userDiscount?.studentEarning === 'number') {
      modifiedSkillerbitraTemp = modifiedSkillerbitraTemp.replace(
        /{discount}/g,
        referralLink.userDiscount?.studentEarning + "%"
      );
      console.log("OUT");
    }
    finalTemp = modifiedSkillerbitraTemp;
  }

  try {

    console.log("fromEmail", fromEmail)
    console.log("mg", mg)
    for (const email of emails) {
      const data = {
        from: fromEmail, // Replace with your sender email
        to: email.trim(),
        subject: "Exclusive discount for you",
        html: finalTemp,
      };

      await mg.messages().send(data);
      console.log(`Email sent to: ${email}`);
    }

    res
      .status(200)
      .json({ success: true, message: "Emails sent successfully" });
  } catch (error) {
    console.error("Error sending emails:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error sending emails",
        error: error.response,
        emails: emails,
      });
  }
};

module.exports = {
  generate_referral_link,
  generate_referral_link_By_Admin_For_Influencer,
  list_of_referral_link,
  delete_referral_link,
  update_referral_link,
  change_status_referral_link,
  list_of_referral_link_for_influencer,
  student_earning_details_by_channelId,
  sendingMail,
};
