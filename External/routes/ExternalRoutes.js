const router = require("express").Router();
const referralController = require("../controllers/v1/ExternalController");

router.get("/getcourse/:channelId", referralController.getCourseByChannel);
router.get("/getpackage/:channelId", referralController.getPackageByChannel);
router.get("/getbootcamp/:channelId", referralController.getBootcampByChannel);
router.get("/getCoursePlan/:courseId/:channelId", referralController.getCoursePlan);
router.get("/getPackagePlan/:packageId/:channelId", referralController.getPackagePlan);
router.get("/getUserdata/:channelId", referralController.getUserList);
router.get("/getStudentlist/:channelId", referralController.getStudentList);

module.exports = router;
