const router = require('express').Router();
const planLogctrl = require('../controller/v1/planLogctrl');
const auth = require('../../middleware/auth')


router.get("/", planLogctrl.planLogList);

module.exports = router;