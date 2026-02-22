const express = require("express");
const router = express.Router();

const { updateFcmKey } = require("../controllers/updateFcmKey.controller");

router.post("/update/fcm", updateFcmKey);

module.exports = router;