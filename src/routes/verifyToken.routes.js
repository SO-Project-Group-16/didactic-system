const express = require("express");
const router = express.Router();

const { verifyJwt } = require("../controllers/verifyToken.controller");

router.post("/verify/token", verifyJwt);

module.exports = router;