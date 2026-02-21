require("dotenv").config();
const express = require("express");
const cors = require("cors");

const loginRoutes = require("./routes/login.routes");
const signupRoutes = require("./routes/signup.routes");
const verifyTokenRoutes = require("./routes/verifyToken.routes");

const app = express();
app.use(express.json());
app.use(cors()); // Force the use of Access-Control-Allow-Origin: *

app.use('/', (req, res, next) => {
    console.log(`Request type: ${req.method}`);
    next();
})

app.get("/health", (_req, res) => {
    res.json({ ok: true});
});

app.use("/api/", loginRoutes);
app.use("/api/", signupRoutes);
app.use("/api/", verifyTokenRoutes);

// Do not move this, keep it at the bottom of the middleware stack, otherwise it won't pick up the 404 errors properly
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
})

module.exports = app;