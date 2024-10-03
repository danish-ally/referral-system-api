// referralMiddleware.js
const axios = require("axios");
const Plan = require("../Plan/models/PlanModel"); // Update with the correct path
const ReferralLink = require("../referral-link/models/referralLink"); // Update with the correct path
const generateUniqueReferralCode = require("../referral-link/helpers/generateUniqueReferralCode");
const generateReferralLink = require("../referral-link/helpers/generateReferralLink");
const generateJwtToken = require("../referral-link/helpers/generateJwtToken");
const shortid = require('shortid');

const courseReferralLinkStdnt = async (req, res, next) => {
  try {
    const { courseType, lsSaId, apId, label, channelId, studentId } = req.query;
    console.log(studentId, "studentId")
    if (!channelId || channelId == "null") {
      return res
        .status(400)
        .json({ message: "channelId required" });
    }

    if (!studentId || studentId == "null") {
      return res
        .status(400)
        .json({ message: "student Id required" });
    }
    //const newlsSaId = parseInt(lsSaId)
    const newapId = parseInt(apId)
    const newStudentId = parseInt(studentId)
    console.log(studentId, "studentId")
    let plansQuery = { status: "Active" }; // Filter by status: 'Active'
    // Create an array to store multiple conditions
    let conditions = [];
    if (courseType) {
      conditions.push({ courseType: courseType });
    }
    if (studentId) {
      conditions.push({
        $or: [
          { appliedForAllStudent: true },
          { selectedStudent: { $elemMatch: { id: newStudentId } } },
        ]
      });
    }
    if (lsSaId) {
      conditions.push({ "courseInfo.lsSaId": lsSaId });
    }
    if (apId) {
      conditions.push({ "courseInfo.apId": newapId });
    }
    if (label) {
      conditions.push({ "courseInfo.label": label });
    }
    if (channelId) {
      conditions.push({ "channelInfo.lsSaRefId": channelId });
    }
    // Add $and operator to combine multiple conditions
    if (conditions.length > 0) {
      plansQuery.$and = conditions;
    }
    // console.log("Query Parameters:", req.query);
    // console.log("Constructed Plans Query:", plansQuery);

    const activePlans = await Plan.find(plansQuery);



    console.log(activePlans, "activePlans")

    if (!activePlans || activePlans.length === 0) {
      return res
        .status(404)
        .json({ error: "No active plans found for the specified criteria" });
    }


    // console.log('activePlans', activePlans)

    // Check registeredCount and userLimit
    const userLimitValidationPlans = activePlans.filter(
      (plan) => (plan.registeredCount <= plan.userLimit && plan.userLimit !== null) || plan.userLimit === null
    );

    // console.log('userLimitValidationPlans', userLimitValidationPlans)

    const current = new Date();
    const validDateRangePlans = userLimitValidationPlans.filter(
      (plan) =>
        (plan.planValidityRange && current <= plan.planValidityRange.endDate) || !plan.planValidityRange || plan.planValidityRange === null
    );

    // console.log('validDateRangePlans', validDateRangePlans)


    let baseUrl;
    if (channelId == 1) {
      baseUrl = process.env.BASE_URL_LAWSIKHO_STUDENT;
    } else {
      baseUrl = process.env.BASE_URL_SKILLARBITRA_STUDENT;
    }

    const response = await axios.get(
      `${baseUrl}/api/v1/lawsikho/student-details/${studentId}`
    );
    const student = response.data.data[0];
    // console.log('student', student);

    for (const plan of validDateRangePlans) {
      const referralLink = await ReferralLink.findOne({
        $and: [{ planId: plan._id }, { "userInfo.id": studentId }],
      });

      // console.log(referralLink,"referralLink8888888")

      if (!referralLink) {
        // Generate a unique referral code (using a library or custom function)
        const referralCode = await generateUniqueReferralCode("student");
        console.log("referralCode", referralCode);
        // Check if the referral code already exists in the database
        const existingReferralLink = await ReferralLink.findOne({
          referralCode,
        });

        if (existingReferralLink) {
          return res
            .status(400)
            .json({ message: "Referral code already exists." });
        }

        //Changes Regarding Link
        const channelInfo = plan?.channelInfo;
        const courseInfo = plan?.courseInfo;
        const urlSegment = courseInfo?.urlSegment;

        const myreferralLink = await generateReferralLink(
          channelInfo,
          courseInfo,
          urlSegment,
          referralCode,
          courseType
        );
        const referralLink1 = myreferralLink.referralLink;

        console.log(referralLink1, "referralLink");

        const shortUrl = shortid.generate();


        // Generate a JWT token using the payload
        const tokenPayload = {
          planId: plan?._id,
          // Add other necessary payload data
        };

        const generatedToken = await generateJwtToken(tokenPayload);

        console.log("Generated Token:", generatedToken);

        // Create a new referral link object
        const newReferralLink = new ReferralLink({
          userInfo: {
            id: studentId,
            name: student?.full_name,
            email: student?.email,
            phone: student?.phone,
          },
          channelInfo: plan?.channelInfo,
          userType: "student",
          planId: plan?._id,
          planName: plan?.planName,
          userDiscount: {
            discountType: plan.studentDiscount?.discountType,
            userEarning: plan.studentDiscount?.userEarning,
            studentEarning: plan.studentDiscount?.studentEarning,
            upto: plan.studentDiscount?.upto
          },
          validityRange: {
            startDate: plan.planValidityRange?.startDate,
            endDate: plan.planValidityRange?.endDate,
          },
          userLimit: plan?.userLimit,
          referralLink: referralLink1,
          referralCode: referralCode,
          token: generatedToken,
          courseType: plan?.courseType,
          courseInfo: plan?.courseInfo,
          createdBy: {
            id: studentId,
            name: student?.full_name,
            email: student?.email,
            phone: student?.phone
          },
          shortUrl: shortUrl
        });

        console.log("New Referral Link Object:", newReferralLink);

        // Save the referral link to the database
        const savedReferralLink = await newReferralLink.save();
      }
    }
    next();
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      err: error.message,
      error: true,
    });
  }
};

module.exports = courseReferralLinkStdnt;
