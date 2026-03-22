const express = require("express");
const router = express.Router();

const { getClinicianPatientDashboard } = require("../controllers/getClinicianPatientDashBoard.controller");

router.post("/clinician/patients/dashboard", getClinicianPatientDashboard);

module.exports = router;