const router = require('express').Router();
const leadCtrl = require('../controller/v1/leadCtrlr');
const auth = require('../../middleware/auth')

router.post("/addLead" , leadCtrl.addLead);
router.patch("/paymentSuccessfull" , leadCtrl.paymentSuccessfullyConsumed);

module.exports = router;