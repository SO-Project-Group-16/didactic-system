const express = require("express");
const router = express.Router();

const { clinicianLogin } = require("../controllers/clinicianLogin.controller");
const { clinicianSignup } = require("../controllers/clinicianSignup.controller");

router.post("/clinician/login", clinicianLogin);
router.post("/clinician/signup", clinicianSignup);

module.exports = router;