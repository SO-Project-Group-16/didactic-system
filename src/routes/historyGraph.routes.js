const express = require("express");
const router = express.Router();

const { getHistoryGraphData } = require("../controllers/historyGraph.controller");

router.post("/history-graph-data", getHistoryGraphData);

module.exports = router;