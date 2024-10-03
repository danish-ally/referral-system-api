const router = require('express').Router();
const studentPlanCtrl = require('../controller/v1/studentPlanMappingCtrl');

router.post("/addStudentPlan" , studentPlanCtrl.addStudentPlanMapping);
router.get("/getStudentPlanwithId/:id" , studentPlanCtrl.getStudentPlanDetails);
router.get("/getGeneralandCoursePlan" , studentPlanCtrl.getGeneralandCoursePlan);





module.exports = router;