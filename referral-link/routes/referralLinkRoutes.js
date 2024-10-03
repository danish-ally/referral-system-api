const router = require("express").Router();
const auth = require("../../middleware/auth");
const generalReferralLinkStdnt = require('../../middleware/generalReferralLink')
const referralLinkController = require('../controller/v1/referralLink');




router.post("/", auth, referralLinkController.generate_referral_link);
router.post("/admin", auth, referralLinkController.generate_referral_link_By_Admin_For_Influencer);
router.get("/", auth, referralLinkController.list_of_referral_link);
router.get("/influencer/:id", referralLinkController.list_of_referral_link_for_influencer);
router.delete("/:referralLinkId", referralLinkController.delete_referral_link);
router.put("/:referralLinkId", auth, referralLinkController.update_referral_link);
router.patch("/:referralLinkId/status", referralLinkController.change_status_referral_link);
router.get("/studentEarningDetails/channel/:channelId", referralLinkController.student_earning_details_by_channelId);
router.post("/:referralLinkId/send/mail", referralLinkController.sendingMail);







module.exports = router;