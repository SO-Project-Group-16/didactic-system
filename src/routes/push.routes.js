const router = require("express").Router();
const { registerToken, unregisterDevice } = require("../controllers/push.controller");

router.post("/register", registerToken);
router.post("/unregister", unregisterDevice);

module.exports = router;