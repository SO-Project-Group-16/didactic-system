const express = require("express");
const router = express.Router();

const { setThresholds } = require("../controllers/setThresholds.controller");

router.post("/threshold/set", setThresholds);

module.exports = router;