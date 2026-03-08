const express = require("express");
const router = express.Router();

const { getThresholds } = require("../controllers/getThresholds.controller");
router.get("/threshold/all", getThresholds);

module.exports = router;