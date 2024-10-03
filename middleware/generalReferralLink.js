// referralMiddleware.js
const axios = require("axios");
const Plan = require('../Plan/models/PlanModel'); // Update with the correct path
const ReferralLink = require('../referral-link/models/referralLink'); // Update with the correct path
const generateUniqueReferralCode = require('../referral-link/helpers/generateUniqueReferralCode');
const generateReferralLink = require('../referral-link/helpers/generateReferralLink');
const generateJwtToken = require('../referral-link/helpers/generateJwtToken');
const shortid = require('shortid');

const generalReferralLinkStdnt = async (req, res, next) => {
  try {
    const { channelId, studentId } = req.params;
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

   

    const activePlans = await Plan.find({
      $and: [
        {
          $or: [
            { appliedForAllStudent: true },
            { selectedStudent: { $elemMatch: { id: parseInt(studentId) } } },
          ],
        },
        { status: "Active" },
        { "channelInfo.lsSaRefId": channelId },
        { courseInfo: null }
      ],
    }).sort({ createdAt: -1 });

    console.log('activePlans', activePlans)

    // Check registeredCount and userLimit
    const userLimitValidationPlans = activePlans.filter(
      (plan) => (plan.registeredCount <= plan.userLimit && plan.userLimit !== null) || plan.userLimit === null
    );

    console.log('userLimitValidationPlans', userLimitValidationPlans)

    const current = new Date();
    const validDateRangePlans = userLimitValidationPlans.filter(
      (plan) =>
        (plan.planValidityRange && current <= plan.planValidityRange.endDate) || !plan.planValidityRange
    );

    console.log('validDateRangePlans', validDateRangePlans)


    let baseUrl;
    if (channelId == 1) {
      baseUrl = process.env.BASE_URL_LAWSIKHO_STUDENT;
    } else {
      baseUrl = process.env.BASE_URL_SKILLARBITRA_STUDENT;
    }
    
    
    const response = await axios.get(`${baseUrl}/api/v1/lawsikho/student-details/${studentId}`);
    const student = response.data?.data[0];
    console.log('student',student)

    for (const plan of validDateRangePlans) {
      const referralLink = await ReferralLink.findOne({
        $and: [{ planId: plan?._id }, { "userInfo.id": studentId }],
      });




      if (!referralLink) {
        const referralCode = await generateUniqueReferralCode("student");

        const existingReferralLink = await ReferralLink.findOne({
          referralCode,
        });

        if (existingReferralLink) {
          return res
            .status(400)
            .json({ message: "Referral code already exists." });
        }

        const generatedToken = await generateJwtToken({
          planId: plan._id,
          // Add other necessary payload data
        });


        //Changes Regarding Link
        console.log(plan, "plan")
        console.log(plan?.courseInfo, "testingggg")
        //

        const channelInfo = plan?.channelInfo;
        const courseInfo = undefined;
        const courseType = plan?.courseType
        console.log(courseInfo, "courseInfo")
        const urlSegment = courseInfo?.urlSegment;

        console.log(urlSegment, "urlSegment")



        const myreferralLink = await generateReferralLink(channelInfo, courseInfo, urlSegment, referralCode, courseType);

        console.log(myreferralLink, "myreferralLink")
        const referralLink1 = myreferralLink.referralLink

        console.log(referralLink1, "referralLink")

        const shortUrl = shortid.generate();

        const newReferralLink = new ReferralLink({
          userInfo: {
            id: studentId,
            name: student?.full_name,
            email: student?.email,
            phone: student?.phone
          },
          channelInfo: plan?.channelInfo,
          planName: plan?.planName,
          userType: "student",
          planId: plan?._id,
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

        const savedReferralLink = await newReferralLink.save();
      }
    }
    console.log('working till middleware')
    next();
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({
        message: "Internal server error.",
        err: error.message,
        error: true,
      });
  }
};

module.exports = generalReferralLinkStdnt;
