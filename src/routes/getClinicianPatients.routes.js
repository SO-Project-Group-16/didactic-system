const express = require("express");
const router = express.Router();

const { getClinicianPatients } = require("../controllers/getClinicianPatients.controller");

router.post("/clinician/patients", getClinicianPatients);

module.exports = router;