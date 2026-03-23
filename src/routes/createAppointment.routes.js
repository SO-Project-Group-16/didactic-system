const express = require("express");
const router = express.Router();

const { createAppointment } = require("../controllers/createAppointment.controller");

router.post("/clinician/appointment/create", createAppointment);

module.exports = router;