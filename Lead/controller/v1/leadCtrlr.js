const refLead = require("../../model/leadModel");
const ReferralLink = require("../../../referral-link/models/referralLink");
const Plan = require("../../../Plan/models/PlanModel");
const ReferredStudent = require("../../../Referred-student/models/referredStudent");

const addLead = async (req, res) => {
  try {
    req.body.leadDetails.combinedPhone =
      req.body.leadDetails.countryCode + req.body.leadDetails.phone;
    console.log(req.body);
    const result = await new refLead(req.body).save();

    res.status(201).json({
      error: false,
      result,
      message: "Lead created successfully",
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

//Payment successfull Consumed Api
const paymentSuccessfullyConsumed = async (req, res) => {
  const { referralCode } = req.body;

  try {
    const trimmedReferralCode = referralCode.trim();
    const originalPrice = req.body.price.originalPrice;
    const userEarnigAmountNew = req.body.userEarnigAmount;
    const studentEarnigAmountNew = req.body.studentEarnigAmount;

    if (!req.body.courseType) {
      return res
        .status(400)
        .json({ success: false, message: "course type required" });
    }

    const referralLinkData = await ReferralLink.findOne({
      referralCode: trimmedReferralCode,
    });

    if (!referralLinkData) {
      // If not found in ReferralLink, check in StudentPlan
      return res
        .status(404)
        .json({ success: false, message: "Referral link not found" });
    }

    referralLinkData.userDiscount.userEarningAmount = userEarnigAmountNew;
    referralLinkData.userDiscount.studentEarningAmount = studentEarnigAmountNew;
    await referralLinkData.save();

    console.log("referralLinkData befor", referralLinkData);

    const planId = referralLinkData.planId;

    const plan = await Plan.findById(planId);

    const courseInfo = plan?.courseInfo;

    let discountType;
    let userEarning;
    let finalUserAmount;

    if (referralLinkData.userType == "student") {
      discountType = plan.studentDiscount.discountType;
      userEarning = plan.studentDiscount.userEarning;

      if (discountType == "Flat") {
        referralLinkData.earningAmount += parseFloat(userEarning);
        finalUserAmount = userEarning;
      } else {
        const Percentage = parseFloat(userEarning) / 100;
        console.log("Percentage", Percentage);
        const amountEarn = parseFloat(originalPrice) * Percentage;
        console.log("amountEarn", amountEarn);
        // Check the value of amountEarn before assigning to earningAmount

        if (amountEarn <= plan.studentDiscount.upto) {
          referralLinkData.earningAmount =
            referralLinkData.earningAmount + parseFloat(amountEarn);
            
          finalUserAmount = amountEarn;
        } else {
          referralLinkData.earningAmount =
            referralLinkData.earningAmount +
            parseInt(plan.studentDiscount.upto);
          finalUserAmount = plan.studentDiscount.upto;
        }

        console.log(
          referralLinkData.earningAmount,
          "referralLinkData.earningAmount"
        );
        // New condition to compare amountEarn with referralUpto
      }
    } else {
      if (courseInfo) {
        discountType = "Flat";
        userEarning = parseFloat(referralLinkData.userDiscount.userEarningAmount);
      } else if (referralLinkData.userType == "admin") {
        discountType = plan.adminDiscount.discountType;
        userEarning = plan.adminDiscount.userEarning;
      } else if (referralLinkData.userType == "influencer") {
        discountType = plan.influencerDiscount.discountType;
        userEarning = plan.influencerDiscount.userEarning;
      }

      if (discountType == "Flat") {
        referralLinkData.earningAmount += parseFloat(
          referralLinkData.userDiscount.userEarningAmount
        );
        finalUserAmount = referralLinkData.userDiscount.userEarningAmount;
      } else {
        const Percentage = parseFloat(userEarning) / 100;
        console.log("Percentage", Percentage);
        const amountEarn = parseFloat(originalPrice) * Percentage;
        console.log("amountEarn", amountEarn);
        // Check the value of amountEarn before assigning to earningAmount
        referralLinkData.earningAmount = referralLinkData.earningAmount + parseFloat(amountEarn);;
        finalUserAmount = amountEarn;
        console.log(
          referralLinkData.earningAmount,
          "referralLinkData.earningAmount"
        );
      }
    }

    referralLinkData.registeredCount += 1;

    console.log("referralLinkData after", referralLinkData);
    await referralLinkData.save();
    const planData = await Plan.updateOne(
      { _id: referralLinkData.planId },
      { $inc: { registeredCount: 1 } }
    );

    if (!planData) {
      // If not found in ReferralLink, check in StudentPlan
      return res
        .status(404)
        .json({ success: false, message: "Plan not found" });
    }
    console.log("planData", planData);

    req.body.studentDetails.consolidatedPhoneNo =
      req.body.studentDetails.countrycode + req.body.studentDetails.phone;

    req.body.channelInfo = referralLinkData.channelInfo;
    req.body.planId = referralLinkData.planId;
    req.body.referralLinkId = referralLinkData._id;
    req.body.earningAmount = finalUserAmount;
    console.log('body',req.body);
    const result = await new ReferredStudent(req.body).save();
    // Match in Student Plan table
    return res
      .status(200)
      .json({ success: true, message: "Lead Updated successfully.", result });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, err: error, message: "Internal server error." });
  }
};

module.exports = {
  addLead,
  paymentSuccessfullyConsumed,
};
