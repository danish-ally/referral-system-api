const router = require('express').Router();
const influencerCtrl = require('../controller/v1/InfluencerCtrl');
const auth = require('../../middleware/auth')

router.post("/addInfluencer" , influencerCtrl.addInfluencer);
router.put("/updateInfluencer", auth, influencerCtrl.updateInfluencer);
router.put("/changeInfluencerStatus", auth, influencerCtrl.changeInfluencerStatus);
router.put("/admin/updateInfluencer/:id",auth, influencerCtrl.updateInfluencerByAdmin);
router.get("/getInfluencer/:id", influencerCtrl.getInfluencerDetails);
router.get("/getAllInfluencer" , influencerCtrl.getAllInfluencer);
router.get("/getAllInfluencer/external", influencerCtrl.getInfluencerForExternal);
router.delete("/deleteInfluencer/:id", influencerCtrl.deleteInfluencer);

router.post("/login/email-verification" , influencerCtrl.emailVerificationLogin);
router.post("/login/password-verification" , influencerCtrl.loginInfluencer);
router.post("/changePassword" , auth, influencerCtrl.changePassword);
router.post("/forgotPassword/email-verification", influencerCtrl.forgotPasswordEmailVerify);
router.post("/forgotPassword/otp-verification", influencerCtrl.verifyOtpForgotPassword);
router.post("/forgotPassword/reset-password", influencerCtrl.resetForgotPassword);
router.post("/forgotPassword/resendOtp", influencerCtrl.resendOtp);

router.get("/countriesData", influencerCtrl.getCountryData);

module.exports = router;