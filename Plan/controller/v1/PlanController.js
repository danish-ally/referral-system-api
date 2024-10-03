const Plan = require("../../models/PlanModel");
const ReferralLink = require("../../../referral-link/models/referralLink");
const StudentPlan = require("../../../StudentPlanMapping/models/studentPlanMappingModel");
const ReferredStudent = require("../../../Referred-student/models/referredStudent");
const PlanLog = require("../../../log/model/planLog");

//Add Plan Api
const addPlan = async (req, res) => {
  try {
    console.log(req.user, "11111111");
    // Check if a plan with the same planName already exists
    const existingPlan = await Plan.findOne({ planName: req.body.planName });

    if (existingPlan) {
      return res.status(400).json({
        success: false,
        error: "Plan with the same name already exists ",
      });
    }


    let planData = { ...req.body }

    console.log(planData,"planData")

    if (planData.planValidityRange?.startDate) {
      planData.planValidityRange.startDate = new Date(planData.planValidityRange.startDate)
      planData.planValidityRange.endDate = new Date(new Date(planData.planValidityRange.endDate).setHours(23, 59, 0, 0));

    }

    


    // Create a new plan
    const newPlan = new Plan(planData);

    console.log(newPlan,"newPlan")

    // Set createdBy based on req.user
    newPlan.createdBy = {
      id: req.user?.user_id,
      name: req.user?.name,
      email: req.user?.email,
    };

    console.log(newPlan.courseInfo,"courseInfo")

   // If courseType is "bootcamp" and lsSaId is valid, set apId as lsSaId
if (newPlan.courseType === "bootcamp" && req.body.courseInfo && Object.keys(req.body.courseInfo).length > 0) {
  newPlan.courseInfo = {
    apId: req.body.courseInfo.apId,
    label: req.body.courseInfo.label,
    urlSegment: req.body.courseInfo.urlSegment,
    lsSaId: req.body.courseInfo.apId
  }
}

console.log(newPlan.courseInfo,"newPlan.courseInfo")



    // Validate the new plan before saving
    const validationError = newPlan.validateSync();

    if (validationError) {
      // If there are validation errors, return a response with the errors
      return res.status(400).json({
        success: false,
        error: "Validation error",
        validationErrors: validationError.errors,
      });
    }

    // Save the new plan
    const savedPlan = await newPlan.save();

    res.status(201).json({
      success: true,
      message: "Plan added successfully",
      plan: savedPlan,
    });
  } catch (error) {
    console.error("Error adding plan:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//Get Plan Details
const getPlanDetails = async (req, res) => {
  try {
    const size = parseInt(req.query.size) || 10;
    const page = parseInt(req.query.page) - 1 || 0;
    const course = parseInt(req.query.course);
    const library = parseInt(req.query.library);
    const offer = parseInt(req.query.offer);
    const planId = req.query.planId;
    const channel = (req.query.channel);
    // Constructing startDate and endDate
    const startDate = req.query.startDate ?? undefined;
    const endDate = req.query.endDate ?? undefined;

    const offerFor = req.query.offerFor;


    console.log(req.query, "req.query")

    console.log(startDate, "startDate", endDate, "endDate")


    // Parse the search query parameter
    const searchQuery = req.query.search || "";

    // Define fields to search for in the database
    const searchFields = [
      "planName",
      "userLimit",
      "planValidityRange.startDate",
      "status",
      "courseType",
    ];

    // Construct the filter options based on the search query
    const filterOptions = {};


    if (offerFor && offerFor != "all") {
      let offerForValues = offerFor.split(',');
    }



    if (req.query.offerFor && offerFor != "all") {
      filterOptions.offerFor = offerForValues;
    }




    if (startDate !== undefined && endDate !== undefined) {
      filterOptions.$and = [
        { 'planValidityRange.startDate': { $gte: new Date(startDate) } },
        { 'planValidityRange.endDate': { $lte: new Date(endDate) } }
      ];
    }


    console.log(filterOptions, "filterOptions")


    if (searchQuery) {
      const searchRegex = new RegExp(searchQuery, "i");
      filterOptions.$or = searchFields
        .filter(
          (field) =>
            field !== "userLimit" && field !== "planValidityRange.startDate"
        ) // Exclude userLimit and startDate from the search
        .map((field) => ({ [field]: searchRegex }));
    }

    if (req.query.courseType) {
      filterOptions.courseType = {
        $regex: new RegExp(req.query.courseType, "i"),
      };
    }

    if (req.query.userLimit) {
      filterOptions.userLimit = parseInt(req.query.userLimit);
    }
    if (req.query.status) {
      filterOptions.status = req.query.status;
    }

    if (planId) {
      filterOptions._id = planId;
    }

    if (channel) {
      filterOptions['channelInfo.lsSaRefId'] = channel
    }

    if (course) {
      filterOptions.$or = [
        { courseType: "standalone", "courseInfo.lsSaId": course },
        ...(filterOptions.$or || []),
      ];
    }

    if (library) {
      filterOptions.$or = [
        { courseType: "package", "courseInfo.lsSaId": library },
        ...(filterOptions.$or || []),
      ];
    }

    if (offer) {
      filterOptions.$or = [
        { courseType: "bootcamp", "courseInfo.lsSaId": offer },
        ...(filterOptions.$or || []),
      ];
    }

    if (offer && library) {
      filterOptions.$or = [
        ...(filterOptions.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": offer }],
        },
        {
          $and: [
            { courseType: "package" },
            { "courseInfo.lsSaId": library },
          ],
        },
      ];
    }

    if (course && offer) {
      filterOptions.$or = [
        ...(filterOptions.$or || []),
        {
          $and: [{ courseType: "bootcamp" }, { "courseInfo.lsSaId": offer }],
        },
        {
          $and: [
            { courseType: "standalone" },
            { "courseInfo.lsSaId": course },
          ],
        },
      ];
    }

    if (course && library) {
      filterOptions.$or = [
        ...(filterOptions.$or || []),
        {
          $and: [{ courseType: "package" }, { "courseInfo.lsSaId": library }],
        },
        {
          $and: [
            { courseType: "standalone" },
            { "courseInfo.lsSaId": course },
          ],
        },
      ];
    }









    // Check for date range in createdAt
    if (req.query.fromDate && req.query.toDate) {
      const fromDate = new Date(req.query.fromDate);
      const toDate = new Date(req.query.toDate);

      // If fromDate and toDate are both set to today, include today's data
      if (isSameDate(fromDate, toDate) && isSameDate(fromDate, new Date())) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        filterOptions.createdAt = {
          $gte: todayStart,
          $lte: todayEnd,
        };
      } else {
        filterOptions.createdAt = {
          $gte: fromDate,
          $lte: new Date(toDate.getTime() + 86399000), // Adjust the toDate to the end of the day
        };
      }
    }

    // Helper function to check if two dates are on the same day
    function isSameDate(date1, date2) {
      return (
        date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear()
      );
    }
    // Add more conditions as needed

    const noOfPlans = await Plan.countDocuments(filterOptions);
    const noOfPages = Math.ceil(noOfPlans / size);

    const plans = await Plan.find(filterOptions)
      .skip(size * page)
      .limit(size)
      .sort({ createdAt: -1 }) // Assuming you have a createdAt field for sorting
      .lean()
      .exec();

    // Update plans to include offerFor field based on selectedAdmin, selectedStudent, and selectedInfluencer
    const updatedPlans = plans.map((plan) => {
      const hasAdmin = plan.selectedAdmin && plan.selectedAdmin.length > 0;
      const hasStudent = plan.selectedStudent && plan.selectedStudent.length > 0;
      const hasInfluencer = plan.selectedInfluencer && plan.selectedInfluencer.length > 0;

      if (hasInfluencer && hasAdmin && plan.appliedForAllStudent) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (hasInfluencer && hasStudent && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (hasStudent && hasAdmin && plan.appliedForAllInfluencer) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (hasAdmin && plan.appliedForAllInfluencer && plan.appliedForAllStudent) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (hasStudent && plan.appliedForAllInfluencer && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (hasInfluencer && plan.appliedForAllStudent && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (plan.appliedForAllStudent && plan.appliedForAllInfluencer && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin,influencer,student';
      }
      else if (plan.appliedForAllStudent && hasAdmin) {
        plan.offerFor = 'admin,student';
      }
      else if (plan.appliedForAllStudent && hasInfluencer) {
        plan.offerFor = 'influencer,student';
      }
      else if (plan.appliedForAllAdmin && hasInfluencer) {
        plan.offerFor = 'admin,influencer';
      }
      else if (plan.appliedForAllAdmin && hasStudent) {
        plan.offerFor = 'admin,student';
      }
      else if (plan.appliedForAllInfluencer && hasStudent) {
        plan.offerFor = 'influencer,student';
      }
      else if (plan.appliedForAllInfluencer && hasAdmin) {
        plan.offerFor = 'admin,influencer';
      }
      else if (hasAdmin && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin';
      } else if (hasStudent && plan.appliedForAllStudent) {
        plan.offerFor = 'student';
      } else if (hasInfluencer && plan.appliedForAllInfluencer) {
        plan.offerFor = 'influencer';
      } else if (plan.appliedForAllStudent && plan.appliedForAllInfluencer) {
        plan.offerFor = 'influencer,student';
      } else if (plan.appliedForAllInfluencer && plan.appliedForAllAdmin) {
        plan.offerFor = 'admin,influencer';
      } else if (plan.appliedForAllAdmin && plan.appliedForAllStudent) {
        plan.offerFor = 'admin,student';
      } else if (plan.appliedForAllStudent) {
        plan.offerFor = 'student';
      } else if (plan.appliedForAllInfluencer) {
        plan.offerFor = 'influencer';
      } else if (plan.appliedForAllAdmin) {
        plan.offerFor = 'admin';
      } else if (hasAdmin && hasStudent && hasInfluencer) {
        plan.offerFor = 'admin,influencer,student';
      } else if (hasAdmin && hasStudent) {
        plan.offerFor = "admin,student";
      } else if (hasAdmin && hasInfluencer) {
        plan.offerFor = "admin,influencer";
      } else if (hasStudent && hasInfluencer) {
        plan.offerFor = "influencer,student";
      } else if (hasAdmin) {
        plan.offerFor = "admin";
      } else if (hasStudent) {
        plan.offerFor = "student";
      } else if (hasInfluencer) {
        plan.offerFor = "influencer";
      } else {
        // If none of them has data, don't include offerFor field
        plan.offerFor = undefined;
      }

      return plan;
    });

    // Create an array to store update operations
    const updateOperations = updatedPlans.map((updatedPlan) => ({
      updateOne: {
        filter: { _id: updatedPlan._id }, // Use the appropriate identifier for your plans
        update: { $set: { offerFor: updatedPlan.offerFor } },
      },
    }));

    // Bulk update the documents in the database
    await Plan.bulkWrite(updateOperations);

    console.log(updateOperations, "updateOperations")


    res.status(200).json({
      status: 1,
      message: "Got All Plan details successfully",
      noOfPlans,
      noOfPages,
      plansPerPageCount: size,
      currentPage: page + 1,
      plans: updatedPlans,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Get Active Plan api
const getActivePlans = async (req, res) => {
  try {
    // Define filter options to get only active plans

    const activePlans = await Plan.find()
      .sort({ createdAt: -1 }) // Assuming you have a createdAt field for sorting
      .lean()
      .exec();

    res.status(200).json({
      status: 1,
      message: "Got Active Plans successfully",
      activePlans,
    });
  } catch (error) {
    res.status(500).json({
      status: 0,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

//Plan Update Api
const updatePlan = async (req, res) => {
  try {
    const user = req.user;
    // Check if the plan with the specified planId exists
    const existingPlan = await Plan.findById(req.params.id);

    if (!existingPlan) {
      return res.status(404).json({
        success: false,
        error: "Plan not found",
      });
    }

    // Check if the updated planName conflicts with other plans
    const conflictingPlan = await Plan.findOne({
      planName: req.body.planName,
      _id: { $ne: req.params.id }, // Exclude the current plan from the check
    });

    if (conflictingPlan) {
      return res.status(400).json({
        success: false,
        error: "Plan with the same name already exists",
      });
    }

    let planData = { ...req.body }

    if (planData.planValidityRange?.startDate) {
      planData.planValidityRange.startDate = new Date(planData.planValidityRange.startDate)
      planData.planValidityRange.endDate = new Date(new Date(planData.planValidityRange.endDate).setHours(23, 59, 0, 0));
    }

    // Save the existing plan data for beforeChanges
    const beforeChangesData = JSON.parse(JSON.stringify(existingPlan));

    // Remove the editLog property
    delete beforeChangesData.editLog;

    console.log("beforeChangesData", beforeChangesData);

    // Update the existing plan with the new data
    Object.assign(existingPlan, planData);

    // Validate the updated plan before saving
    const validationError = existingPlan.validateSync();

    if (validationError) {
      // If there are validation errors, return a response with the errors
      return res.status(400).json({
        success: false,
        error: "Validation error",
        validationErrors: validationError.errors,
      });
    }

    // Save the changes for afterChanges
    const afterChangesData = JSON.parse(JSON.stringify(existingPlan));

    // Remove the editLog property
    delete afterChangesData.editLog;

    console.log("afterChangesData", afterChangesData);

    existingPlan.editLog.push({
      changeTime: new Date(),
      changeBy: {
        refId: req.user?.user_id || null,
        name: user?.name || null,
        email: user?.email,
        countryCode: user?.countryCode || null,
        phoneNo: user?.phone || null,
        contactedNumber: `${user?.countryCode || "" + user?.phone || ""}`,
      },
      beforeChanges: beforeChangesData,
      afterChanges: afterChangesData,
      //payload: { ...req.body, planId: req.params.id },
    });

    // Save the updated plan
    const updatedPlan = await existingPlan.save();


    const newPlanlog = new PlanLog({
      planDetails: existingPlan,
      changedBy: {
        userId: req.user.user_id,
        email: req.user.email,
      },
    });

    await newPlanlog.save();

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      plan: updatedPlan,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

//Get Plan Details with Plan Id
const getplanDetailswithId = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Plan.findById(id);

    res.status(200).json({
      error: false,
      data,
      message: "got plan Details successfully",
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ error: true, err: error, message: "Internal Server Error" });
  }
};

//Plan Remove Api
const removePlan = async (req, res) => {
  try {
    const planId = req.params.id;

    // Find the plan by ID
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // Update the status to 'Deleted'
    plan.status = "Deleted";

    // Save the updated plan
    const updatedPlan = await plan.save();

    res.json({ message: "Plan marked as deleted", data: updatedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//Coupon Code Validity Check
const couponCodeValityCheck = async (req, res) => {
  try {
    const { referralLink, referralCode, email } = req.body;





    // Find the referral link
    if (!referralLink && !referralCode && !email) {
      return res
        .status(400)
        .json({ success: false, message: "Missing referral link and code or email in the request body" });
    }

    const query = { status: "Active" };

    if (referralLink) {
      query.referralLink = referralLink;
    }

    if (referralCode) {
      query.referralCode = referralCode;
    }

    const link = await ReferralLink.findOne(query);




    if (!link) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid referral code",
        });
    }



    // Check plan validity range
    const now = new Date();
    if (
      link.validityRange?.endDate !== null &&
      now > link.validityRange?.endDate
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Referral code is expired" });
    }




    if (
      now < link.validityRange?.startDate
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid referral code",
        });
    }


    // Check user limit
    if (link.registeredCount >= link.userLimit && link.registeredCount != 0 && link.userLimit != 0 && link.userLimit != null) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid referral code for limit in link" });
    }





    // Find the associated plan
    const plan = await Plan.findById(link.planId);
    if (!plan || plan.status !== "Active") {
      return res
        .status(400)
        .json({ success: false, message: "Invalid referral code" });
    }

    // Check plan validity range
    const currentDate = new Date();
    if (currentDate > plan.planValidityRange?.endDate && plan.planValidityRange !== null &&
      plan.planValidityRange?.endDate !== null) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid referral code" });
    }

    if (
      currentDate < plan.planValidityRange?.startDate
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid referral code",
        });
    }

    // Check user limit
    if (plan.registeredCount >= plan.userLimit && plan.registeredCount != 0 && plan.userLimit != 0 && plan.userLimit !== null) {
      return res.status(400).json({ success: false, message: "Invalid referral code" });
    }


    // If email is provided, check if the referral code is already associated with the email
    if (email) {
      const referredStudent = await ReferredStudent.findOne({
        'studentDetails.email': email,
        referralCode,
      });

      if (referredStudent) {
        return res.status(400).json({
          success: false,
          message: "Referral code already used for this email",
        });
      }
    }


    // Add the new condition
    let responseObject = {}; // Define a single response object


    // Influencer or Admin user type
    if (link.userType === "influencer") {
      if (plan.influencerDiscount && plan.influencerDiscount.discountType === "Flat" || link.userDiscount && link.userDiscount.discountType === "Flat") {
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.influencerDiscount.discountType,
            Amount: plan.influencerDiscount.userEarning,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: null,
            }
          }
        };
        responseObject.validReferralLink.userDiscount = undefined;
      } else if (plan.influencerDiscount && plan.influencerDiscount.discountType === "Percentage" || link.userDiscount && link.userDiscount.discountType === "Percentage") {
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.influencerDiscount.discountType,
            Amount: plan.influencerDiscount.userEarning,
            upto: plan.influencerDiscount.upto,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: link.userDiscount.upto
            }
          }

        };
        responseObject.validReferralLink.userDiscount = undefined;
      } else if (plan.influencerDiscount && plan.influencerDiscount.discountType === "Percentage" || link.userDiscount && link.userDiscount.discountType === "Flat") {
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.influencerDiscount.discountType,
            Amount: plan.influencerDiscount.userEarning,
            upto: plan.influencerDiscount.upto,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: null,
            }
          }

        };
        responseObject.validReferralLink.userDiscount = undefined;
      }
      else if (plan.influencerDiscount && plan.influencerDiscount.discountType === "Flat" || link.userDiscount && link.userDiscount.discountType === "Percentage") {
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.influencerDiscount.discountType,
            Amount: plan.influencerDiscount.userEarning,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: link.userDiscount.upto
            }
          }
        };
        responseObject.validReferralLink.userDiscount = undefined;
      }

    }


    else if (link.userType === "admin") {
      if (plan.adminDiscount && plan.adminDiscount.discountType === "Flat" && link.userDiscount && link.userDiscount.discountType === "Flat") {
        console.log(plan.adminDiscount.discountType, "flatcondition111")
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.adminDiscount.discountType,
            Amount: plan.adminDiscount.userEarning,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: null,
            }
          }

        };
        responseObject.validReferralLink.userDiscount = undefined;

      } else if (plan.adminDiscount && plan.adminDiscount.discountType === "Flat" && link.userDiscount && link.userDiscount.discountType === "Percentage") {
        console.log(plan.adminDiscount.discountType, "flatpercentagecondition111")
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.adminDiscount.discountType,
            Amount: plan.adminDiscount.userEarning,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: link.userDiscount.upto
            }
          }

        };
        responseObject.validReferralLink.userDiscount = undefined;
      }
      else if (plan.adminDiscount && plan.adminDiscount.discountType === "Percentage" && link.userDiscount && link.userDiscount.discountType === "Flat") {
        console.log(plan.adminDiscount.discountType, "percentageflatcondition1111")
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.adminDiscount.discountType,
            Amount: plan.adminDiscount.userEarning,
            upto: plan.adminDiscount.upto,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: null,
            }
          },

        };

        responseObject.validReferralLink.userDiscount = undefined;
      }


      else if (plan.adminDiscount && plan.adminDiscount.discountType === "Percentage" && link.userDiscount && link.userDiscount.discountType === "Percentage") {
        console.log(plan.adminDiscount.discountType, "percentagepercentagecondition111")
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: plan.adminDiscount.discountType,
            Amount: plan.adminDiscount.userEarning,
            upto: plan.adminDiscount.upto,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.discountAmount,
              upto: link.userDiscount.upto
            }
          }

        };

        responseObject.validReferralLink.userDiscount = undefined;
      }

    }
    // Student user type
    else if (link.userType === "student") {
      if (link.userDiscount && link.userDiscount.discountType === "Flat") {
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: "Percentage",
            Amount: 100,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.studentEarning,
              upto: null
            }
          }
        };
        responseObject.validReferralLink.userDiscount = undefined;
      } else if (link.userDiscount && link.userDiscount.discountType === "Percentage") {
        console.log("cominggggg",link.userDiscount.studentEarning)
        responseObject = {
          success: true,
          message: "Validity check passed successfully",
          validReferralLink: link,
          planDetails: {
            PlanDiscountType: "Percentage",
            Amount: 100,
            upto: null,
            endUserDiscount: {
              distributionType: link.userDiscount.discountType,
              Amount: link.userDiscount.studentEarning,
              upto: link.userDiscount.upto
            }
          }
        };
        responseObject.validReferralLink.userDiscount = undefined;
      }

      else {
        // Handle other conditions for student userType if needed
        responseObject = {
          success: false,
          message: "Invalid conditions for student userType"
        };
      }
    }
    // Other user types
    else {
      responseObject = {
        success: false,
        message: "Invalid user type or condition"
      };
    }




    // Send the response
    if (!res.headersSent) {

      res.status(responseObject.success ? 200 : 400).json(responseObject);

    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const getInfluencerandAdminActivePlan = async (req, res) => {
  try {
    console.log(req.user, "11111111");

    const role = req.user.role;
    const lsSaRefId = req.query.lsSaRefId;
    let validPlans;

    let plansQuery = { status: "Active" };

    if (lsSaRefId) {
      plansQuery = {
        "channelInfo.lsSaRefId": lsSaRefId,
      };
    }

    let allPlans; // Declare the variable outside the if block

    console.log(plansQuery, "hhhh");
    console.log(lsSaRefId, "gggg");
   

    if (lsSaRefId) {
      allPlans = await Plan.find(plansQuery);
      console.log(allPlans);

    } else {
      if (role === "influencer") {
        const userId = req.user._id;

        allPlans = await Plan.find({
          $or: [
            { 'selectedInfluencer': { $elemMatch: { 'id': userId } } },
            { 'appliedForAllInfluencer': true }
          ],
          status: "Active",
        }).sort({ createdAt: -1 });


        console.log(allPlans,"allPlans")

        // Filter valid plans based on your conditions
        validPlans = allPlans.filter(plan => {
          return (plan.registeredCount <= plan.userLimit || plan.userLimit == null) &&
            (plan.planValidityRange === null || (plan.planValidityRange && new Date(plan.planValidityRange.endDate) >= new Date()));
        });

        console.log(validPlans, "validPlans");
        console.log(allPlans, "allPlans");
      } else if (role === "admin") {
        const userId = req.user.user_id;
        allPlans = await Plan.find({
          $or: [
            { 'selectedAdmin': { $elemMatch: { 'id': userId } } },
            { 'appliedForAllAdmin': true }
          ],
          status: "Active",
        }).sort({ createdAt: -1 });

        console.log(allPlans,"allPlans")

        // Filter valid plans based on your conditions
        validPlans = allPlans.filter(plan => {
          return (plan.registeredCount <= plan.userLimit || plan.userLimit == null) &&
            (plan.planValidityRange === null || (plan.planValidityRange && new Date(plan.planValidityRange.endDate) >= new Date()));
        });
        
       

        console.log(validPlans, "validPlans");
      } else {
        // If neither influencer nor admin, return a 403 Forbidden status
        return res.status(403).json({ success: false, message: "Forbidden" });
      }
    }


    return res.json({ success: true, role, data: validPlans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};


//Status Change Api
const planStatusChange = async (req, res) => {
  const { planId } = req.params;
  const { status } = req.query;

  if (!["Active", "Inactive", "Deleted"].includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    if (plan.status === status) {
      return res.json({ message: "Status value is already set to " + status });
    }

    plan.status = status;

    await plan.save();

    res.status(200).json({
      message: "Status value changed successfully for this status",
      plan,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Plan Consumed Api
const planConsumed = async (req, res) => {
  const { referralLink, referralCode } = req.body;

  try {
    // Check in ReferralLink table
    const referralLinkData = await ReferralLink.findOne({
      referralLink,
      referralCode,
    });

    if (!referralLinkData) {
      // If not found in ReferralLink, check in StudentPlan
      const studentPlanData = await StudentPlan.findOne({
        referralLink,
        referralCode,
      });

      if (!studentPlanData) {
        return res
          .status(404)
          .json({
            success: false,
            message: "Referral link or code not found in student table.",
          });
      }

      // Update registeredCount in Plan schema
      await Plan.updateOne(
        { _id: studentPlanData.planId },
        { $inc: { registeredCount: 1 } }
      );

      const referralLinkData = await ReferralLink.findOne({
        referralLink,
        referralCode,
      });

      // Update registeredCount in ReferralLink
      await ReferralLink.updateOne(
        { _id: referralLinkData._id },
        { $inc: { registeredCount: 1 } }
      );

      // Update consumedUserCount in StudentPlan Mapping
      await StudentPlan.updateOne(
        { _id: studentPlanData._id },
        { $inc: { consumedUserCount: 1 } }
      );

      const planInfo = await Plan.findOne({ _id: studentPlanData.planId });
      const channelInfo = planInfo ? planInfo.channelInfo : null;
      const courseType = planInfo ? planInfo.courseType : null;

      // Save matched student details in ReferredStudent model
      const referredStudent = new ReferredStudent({
        studentDetails: {
          id: studentPlanData.userInfo.id,
          name: studentPlanData.userInfo.name,
          email: studentPlanData.userInfo.email,
          countrycode: studentPlanData.userInfo.countryCode,
          phone: studentPlanData.userInfo.phone,
          consolidatedPhoneNo: studentPlanData.userInfo.consolidatedPhoneNo,
        },
        channelInfo: channelInfo,
        planId: studentPlanData.planId,
        price: {
          originalPrice: "20",
          discountPrice: "10",
        },
        courseType: courseType,
        // courseInfo: studentPlanData.courseInfo,
        studentPlanId: studentPlanData._id,
        referralLinkId: referralLinkData._id,
      });

      await referredStudent.save();

      return res
        .status(200)
        .json({ success: true, message: "Student Data updated successfully." });
    }

    // If found in ReferralLink, continue with the existing logic
    if (
      referralLinkData.userType === "Admin" ||
      referralLinkData.userType === "Influencer"
    ) {
      // Find the Plan and update registeredCount
      await Plan.updateOne(
        { _id: referralLinkData.planId },
        { $inc: { registeredCount: 1 } }
      );

      // Update registeredCount in ReferralLink
      await ReferralLink.updateOne(
        { _id: referralLinkData._id },
        { $inc: { registeredCount: 1 } }
      );

      const studentPlanData = await StudentPlan.findOne({
        referralLink,
        referralCode,
      });

      await StudentPlan.updateOne(
        { _id: studentPlanData._id },
        { $inc: { consumedUserCount: 1 } }
      );

      const planInfo = await Plan.findOne({ _id: studentPlanData.planId });
      const channelInfo = planInfo ? planInfo.channelInfo : null;
      const courseType = planInfo ? planInfo.courseType : null;

      // Save matched student details in ReferredStudent model
      const referredStudent = new ReferredStudent({
        studentDetails: {
          id: studentPlanData.userInfo.id,
          name: studentPlanData.userInfo.name,
          email: studentPlanData.userInfo.email,
          countrycode: studentPlanData.userInfo.countryCode,
          phone: studentPlanData.userInfo.phone,
          consolidatedPhoneNo: studentPlanData.userInfo.consolidatedPhoneNo,
        },
        channelInfo: channelInfo,
        planId: studentPlanData.planId,
        price: {
          originalPrice: "10",
          discountPrice: "20",
        },
        courseType: courseType,
        // courseInfo: studentPlanData.courseInfo,
        studentPlanId: studentPlanData._id,
        referralLinkId: referralLinkData._id,
      });

      await referredStudent.save();

      // Match in Student Plan table
      return res
        .status(200)
        .json({
          success: true,
          message: "Admin or User Data Updated successfully.",
        });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "User type not supported." });
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};


//Plan Reporting Api
const planReporting = async (req, res) => {
  try {
    const skillarbitragePlansCount = await Plan.countDocuments({
      "channelInfo.name": "Skillarbitra",
      status: { $ne: "Deleted" },
    });

    console.log(skillarbitragePlansCount, "skillarbitragePlansCount");

    const lawsikhoPlansCount = await Plan.countDocuments({
      "channelInfo.name": "Lawsikho",
      status: { $ne: "Deleted" },
    });

    const totalPlansCount = await Plan.countDocuments({
      status: { $ne: "Deleted" },
    });

    // Fetch registeredCount in all Active plans
    const totalRegisteredCount = await Plan.aggregate([
      {
        $match: { status: { $ne: "Deleted" } },
      },
      {
        $group: {
          _id: null,
          totalRegisteredCount: { $sum: "$registeredCount" },
        },
      },
    ]);

    // Fetch registeredCount based on Skillarbitrage
    const skillarbitrageRegisteredCountData = await Plan.aggregate([
      {
        $match: {
          "channelInfo.name": "Skillarbitra",
          status: { $ne: "Deleted" },
        },
      },
      {
        $group: {
          _id: null,
          skillarbitrageRegisteredCount: { $sum: "$registeredCount" },
        },
      },
    ]);

    // Fetch registeredCount based on Lawsikho
    const lawsikhoRegisteredCountData = await Plan.aggregate([
      {
        $match: {
          "channelInfo.name": "Lawsikho",
          status: { $ne: "Deleted" },
        },
      },
      {
        $group: {
          _id: null,
          lawsikhoRegisteredCount: { $sum: "$registeredCount" },
        },
      },
    ]);

    // Check if lawsikhoRegisteredCountData is not empty before accessing properties
    const lawsikhoRegisteredCount =
      lawsikhoRegisteredCountData.length > 0
        ? lawsikhoRegisteredCountData[0].lawsikhoRegisteredCount
        : 0;

    // Check if lawsikhoRegisteredCountData is not empty before accessing properties
    const skillarbitrageRegisteredCount =
      skillarbitrageRegisteredCountData.length > 0
        ? skillarbitrageRegisteredCountData[0].skillarbitrageRegisteredCount
        : 0;

    return res.json({
      totalPlansCount,
      skillarbitragePlansCount,
      lawsikhoPlansCount,
      totalRegisteredCount: totalRegisteredCount[0]?.totalRegisteredCount,
      skillarbitrageRegisteredCount,
      lawsikhoRegisteredCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Course Based Plan

const getCoursePlan = async (req, res) => {
  const { courseType, lsSaId, apId, label, channelId, ChannelName, studentId } = req.query;
  // const newlsSaId = parseInt(lsSaId)
  const newapId = parseInt(apId)


  try {
    let plansQuery = { status: "Active" }; // Filter by status: 'Active'

    // Create an array to store multiple conditions
    let conditions = [];

    if (courseType) {
      conditions.push({ courseType: courseType });
    }

    console.log(courseType, "courseType")

    if (studentId) {
      conditions.push({ "userInfo.id": studentId });
    }

    if (lsSaId) {
      conditions.push({ "courseInfo.lsSaId": lsSaId });
    }

    console.log(lsSaId, "lsSaId")

    if (apId) {
      conditions.push({ "courseInfo.apId": newapId });
    }

    if (label) {
      conditions.push({ "courseInfo.label": label });
    }

    if (ChannelName) {
      conditions.push({ "channelInfo.name": ChannelName });
    }

    if (channelId) {
      conditions.push({ "channelInfo.lsSaRefId": channelId });
    }

    // Add $and operator to combine multiple conditions
    if (conditions.length > 0) {
      plansQuery.$and = conditions;
    }


    const referralLinks = await ReferralLink.find(plansQuery).sort({ createdAt: -1 });

    

    if (!referralLinks || referralLinks.length === 0) {
      return res
        .status(200)
        .json({
          error: "No active referralLinks found for the specified criteria",
          activeReferralLinks: [],
        });
    }

    console.log(referralLinks, "referralLinks");


    

    // Check registeredCount and userLimit
    const invalidReferralLinks = referralLinks.filter(
      (link) => link.registeredCount > link.userLimit && link.userLimit !== null
    );

    console.log(invalidReferralLinks, "invalidReferralLinks")

    // Check validityRange
    const now = new Date();
    const invalidDateRangeLinks = referralLinks.filter(
      (link) => now > link.validityRange.endDate && link.validityRange !== null && link.validityRange?.endDate !== null
    );


    // Extract planIds from the fetched referralLinks
    const planIds = referralLinks.map((link) => link?.planId);

    console.log(planIds, "planIds");


    // Fetch associated plan details based on planIds
    // const plans = await Plan.find(
    //   { _id: { $in: planIds }, status: 'Active', appliedForAllStudent: true },
    //   { planName: 1, _id: 1 }
    // );

    // {selectedStudent: { $elemMatch: { id: studentId } }},

    const plans = await Plan.find(
      {
        $or: [
          { _id: { $in: planIds } },
          { selectedStudent: { $elemMatch: { id: { $in: planIds } } } },
          { appliedForAllStudent: true },
        ],
        status: "Active",
      },
      { planName: 1, _id: 1 }
    );

    //console.log(plans, "plans");

    // Check registeredCount and userLimit
    const invalidPlans = plans.filter(
      (plan) => plan.registeredCount > plan.userLimit
    );

    console.log(invalidPlans, "invalidPlans");

    // Check validityRange
    const current = new Date();
    const invalidDateRangePlans = plans.filter(
      (plan) =>
        plan.planValidityRange && current > plan.planValidityRange?.endDate && plan.planValidityRange !== null && plan.planValidityRange?.endDate !== null
    );

    console.log(invalidDateRangePlans, "invalidDateRangePlans");

   // Create a mapping between planId and plan details
   let planDetailsMap = {};
   plans.forEach((plan) => {
     if (plan && plan._id) {
       planDetailsMap[plan._id.toString()] = {
         planName: plan.planName,
         referralUpto: plan.studentDiscount?.referralUpto || null
       };
     }
   });

    // Combine referralLinks and associated plan names
    const finalResponse = referralLinks.map((link) => {
      const planId = link.planId && link.planId.toString();

      // Check if the link is not in the list of invalidReferralLinks and invalidDateRangeLinks
      const isInvalidLink =
        invalidReferralLinks.some(
          (invalidLink) => invalidLink?._id?.toString() === link?._id?.toString()
        ) ||
        invalidDateRangeLinks.some(
          (invalidLink) => invalidLink?._id?.toString() === link?._id?.toString()
        );

        console.log(isInvalidLink,"isInvalidLink")


      // Check if the plan is not in the list of invalidPlans and invalidDateRangePlans
      const isValidPlan =
        !invalidPlans.some(
          (invalidPlan) => invalidPlan._id.toString() === planId
        ) &&
        !invalidDateRangePlans.some(
          (invalidPlan) => invalidPlan._id.toString() === planId
        );

        
     

      if (isInvalidLink && !isValidPlan ) {
        return null; // Skip invalid data
      }

      return {
        referralLink: link,
        planDetails: planDetailsMap[planId] || null,
      };
    });

    console.log(finalResponse,"finalResponse")

    const validResponse = finalResponse.filter((entry) => entry !== null);

    // Filter out entries with null planDetails
   const filteredResponse = validResponse.filter((entry) => entry.planDetails !== null);

    const response = {
      activeReferralLinks: filteredResponse,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Student Based Plan
const generalPlan = async (req, res) => {
  try {
    const studentId = req.params.studentId; // Get studentId from query parameters
    const channelId = req.params.channelId;

    // Find active plans where appliedForAllStudent is true and selectedStudent matches the given studentId
    const referralLinks = await ReferralLink.find({
      $and: [
        { "userInfo.id": studentId },
        { status: "Active" },
        { "channelInfo.lsSaRefId": channelId },
        { courseInfo: null }
      ],
    }).sort({ createdAt: -1 });

    console.log(referralLinks, "referralLinks");

    if (!referralLinks || referralLinks.length === 0) {
      return res
        .status(200)
        .json({
          message: "No active referralLinks found for the specified criteria",
          activeReferralLinks: [],
        });
    }

    //inactive plan related to referralLink that referralLink should not come
    // Extract planIds from the fetched referralLinks
    const planIdsofreferrallink = referralLinks.map((link) => link?.planId);
    // Fetch associated plan details based on planIds
    const plansofreferrallink = await Plan.find(
      {
        _id: { $in: planIdsofreferrallink },
      },
      { _id: 1, status: 1 }
    );
    // Create a mapping between planId and plan status
    const planStatusMap = {};
    plansofreferrallink.forEach((plansofreferrallink) => {
      if (plansofreferrallink && plansofreferrallink._id) {
        planStatusMap[plansofreferrallink._id.toString()] = plansofreferrallink.status;
      }
    });

    // Check registeredCount and userLimit
    const invalidReferralLinks = referralLinks.filter(
      (link) =>
        planStatusMap[link.planId.toString()] === "Inactive" ||
        (link.registeredCount > link.userLimit && link.userLimit !== null)
    );
    console.log(invalidReferralLinks, "invalidReferralLinks");

    // Check validityRange
    const now = new Date();
    const invalidDateRangeLinks = referralLinks.filter(
      (link) => now > link.validityRange?.endDate && link.validityRange !== null && link.validityRange?.endDate !== null
    );

    console.log(invalidDateRangeLinks, "invalidDateRangeLinks");

    // Extract planIds from the fetched referralLinks
    const planIds = referralLinks.map((link) => link?.planId);

    // Fetch associated plan details based on planIds
    const plans = await Plan.find(
      {
        $or: [
          { _id: { $in: planIds } },
          { selectedStudent: { $elemMatch: { id: { $in: planIds } } } },
          { appliedForAllStudent: true },
        ],
        status: "Active",
      },
      { planName: 1, _id: 1 }
    );

    // Check registeredCount and userLimit
    const invalidPlans = plans.filter(
      (plan) => plan.registeredCount > plan.userLimit
    );

    // Check validityRange
    const current = new Date();
    const invalidDateRangePlans = plans.filter(
      (plan) =>
        plan.planValidityRange && current > plan.planValidityRange.endDate && plan.planValidityRange !== null && plan.planValidityRange?.endDate !== null
    );

     // Create a mapping between planId and plan details
     const planDetailsMap = {};
     plans.forEach((plan) => {
       if (plan && plan._id) {
         planDetailsMap[plan._id.toString()] = {
           planName: plan.planName,
           referralUpto: plan.studentDiscount?.referralUpto || null
         };
       }
     });

    // Combine referralLinks and associated plan names
    const finalResponse = referralLinks.map((link) => {
      const planId = link.planId?.toString();

      // Check if the link is not in the list of invalidReferralLinks and invalidDateRangeLinks
      const isInvalidLink =
        invalidReferralLinks.some(invalidLink => invalidLink._id.toString() === link._id.toString()) ||
        invalidDateRangeLinks.some(invalidLink => invalidLink._id.toString() === link._id.toString())

      // Check if the plan is not in the list of invalidPlans and invalidDateRangePlans
      const isValidPlan =
        !invalidPlans.some(
          (invalidPlan) => invalidPlan._id.toString() === planId
        ) &&
        !invalidDateRangePlans.some(
          (invalidPlan) => invalidPlan._id.toString() === planId
        );

      if (isInvalidLink || !isValidPlan) {
        return null; // Skip invalid data
      }

      return {
        referralLink: link,
        planDetails: planDetailsMap[planId] || null,
      };
    });

    const validResponse = finalResponse.filter((entry) => entry !== null);

    const response = {
      activeReferralLinks: validResponse,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const couseInfo = async (req, res) => {
  try {
    const studentId = parseInt(req.query.studentId);
    const channelId = req.query.channelId;
    const courseType = req.query.courseType;

    // Find plans where appliedForAllStudent is true or selectedStudent matches the given studentId
    const plans = await Plan.find({
      $and: [
        {
          $or: [
            { selectedStudent: { $elemMatch: { id: studentId } } },
            { appliedForAllStudent: true },
          ],
        },
        { status: "Active" },
        { "channelInfo.lsSaRefId": channelId },
        { courseType: courseType },
      ],
    });


    console.log(plans, "plans")

    let validPlans1 = plans.filter(plan => {
      return (
        plan.registeredCount <= plan.userLimit || plan.userLimit === null );
    });

    console.log(validPlans1,"validPlans1")

  let validPlans = validPlans1.filter(plan => {
      return (
        plan.planValidityRange === null ||
        (plan.planValidityRange && new Date(plan.planValidityRange?.endDate) >= new Date()) ||
        (plan.planValidityRange && plan.planValidityRange?.endDate === null)
      );
    });

    console.log(validPlans, "validPlans")

    // Use a Set to store unique courseInfos
    const uniqueCourseInfos = new Set();

    validPlans.forEach((plan) => {
      if (plan.courseInfo && Object.keys(plan.courseInfo).length > 0 || Object.values(plan.courseInfo).every(value => value !== null && value !== undefined)) {
        // Check if the courseInfo is not already in the Set
        if (!isDuplicateCourseInfo(uniqueCourseInfos, plan.courseInfo)) {
          uniqueCourseInfos.add(plan.courseInfo);
        }
      }
    });


    // Convert Set back to an array
    const courseInfos = Array.from(uniqueCourseInfos);

    console.log(courseInfos, "courseInfos")
    

    // Filter out empty courseInfos
    const nonEmptyCourseInfos = courseInfos.filter((item) => {
     
      return JSON.stringify(item) !== '{}';
    
    });

    

    console.log(nonEmptyCourseInfos, "nonEmptyCourseInfos")

   
    res
      .status(200)
      .json({ message: "Got CourseInfo Data", data: { courseInfos: nonEmptyCourseInfos } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to check if the courseInfo is already in the Set
const isDuplicateCourseInfo = (uniqueCourseInfos, courseInfo) => {
  for (const existingCourseInfo of uniqueCourseInfos) {
    if (
      existingCourseInfo.lsSaId === courseInfo.lsSaId &&
      existingCourseInfo.apId === courseInfo.apId &&
      existingCourseInfo.label === courseInfo.label
    ) {
      return true;
    }
  }
  return false;
};

//Get All Active Plans Based On Influencer Id
const planBasedonInfluencerId = async (req, res) => {
  try {
    const { influencerId } = req.params;

    const activePlans = await Plan.find({
      selectedInfluencer: { $elemMatch: { id: influencerId } },
      status: "Active",
    });

    if (activePlans.length === 0) {
      return res.json({ message: "No plans exist for this influencer" });
    }

    res
      .status(200)
      .json({ error: "Got All Active Plans Based on Influencer", activePlans });
  } catch (error) {
    console.error("Error fetching active plans for influencer:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const remainingUserCount = async (req, res) => {
  try {
    const planId = req.params.plan_id;
    const plan = await Plan.findById(planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    const remainingUserCount =
      plan.userLimit !== null ? plan.userLimit - plan.registeredCount : null;

    res
      .status(200)
      .json({ message: "Got remaining user count", remainingUserCount });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  addPlan,
  getPlanDetails,
  getActivePlans,
  updatePlan,
  getplanDetailswithId,
  removePlan,
  couponCodeValityCheck,
  getInfluencerandAdminActivePlan,
  planStatusChange,
  planConsumed,
  planReporting,
  getCoursePlan,
  generalPlan,
  couseInfo,
  planBasedonInfluencerId,
  remainingUserCount
};
