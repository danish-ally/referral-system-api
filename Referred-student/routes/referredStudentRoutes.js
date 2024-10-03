const router = require("express").Router();
const referredStudentController = require('../controller/v1/referredStudent');
const auth = require("../../middleware/auth");

router.post("/", referredStudentController.create_referred_student);
router.get("/", auth,referredStudentController.list_of_referred_student);
router.get("/influencerstudentlist",auth,referredStudentController.list_of_referred_student_basedon_Influencer);



module.exports = router;