const express = require("express");
const router = express.Router();

const { getNotifications } = require("../controllers/getNotifications.controller");

router.get("/notifications", getNotifications);

module.exports = router;