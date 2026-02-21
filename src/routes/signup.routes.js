const express = require("express");
const router = express.Router();

const { signupUser } = require("../controllers/signup.controller");

router.post("/signup", signupUser);

module.exports = router;