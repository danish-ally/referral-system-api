const router = require('express').Router();
const planCtrl = require('../controller/v1/PlanController');
const verifyAccessToken = require("../../common/utils/VerifyAccessToken");
const auth = require("../../middleware/auth");
const generalReferralLinkStdnt = require('../../middleware/generalReferralLink')
const generateCourseBasedReferrallink = require('../../middleware/generateCourseBasedReffLink')

router.post("/addPlan" ,auth, planCtrl.addPlan);
router.get("/getplan",planCtrl.getPlanDetails);
router.get("/getActiveplan",planCtrl.getActivePlans);
router.put("/updateplan/:id",auth,planCtrl.updatePlan);
router.get("/getplandetails/:id",planCtrl.getplanDetailswithId);
router.delete("/removeplan/:id",planCtrl.removePlan);
router.post("/checkValidity",planCtrl.couponCodeValityCheck);
router.get("/getinfluencerandadminactiveplan",auth,planCtrl.getInfluencerandAdminActivePlan)
router.patch("/planstatuschange/:planId",planCtrl.planStatusChange)
router.post("/planconsume",planCtrl.planConsumed)
router.get("/planreporting",planCtrl.planReporting)
router.get("/getCourseBasedRefferallink" ,generateCourseBasedReferrallink, planCtrl.getCoursePlan);
router.get("/generalRefferalLink/:studentId/:channelId" ,generalReferralLinkStdnt, planCtrl.generalPlan);
router.get("/courseInfo" , planCtrl.couseInfo);
router.get("/activeplansBasedonInfluencer/:influencerId" , planCtrl.planBasedonInfluencerId);
router.get("/remainingUserCount/:plan_id",planCtrl.remainingUserCount);





module.exports = router;