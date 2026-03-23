require("dotenv").config();
const express = require("express");
const cors = require("cors");

const loginRoutes = require("./routes/login.routes");
const signupRoutes = require("./routes/signup.routes");
const verifyTokenRoutes = require("./routes/verifyToken.routes");
const updateFcmKeyRoutes = require("./routes/updateFcmKey.routes");
const userDashboardRoutes = require("./routes/dashboard.routes");
const getThresholdsRoutes = require("./routes/getThresholds.routes");
const dashboardGraphRoutes = require("./routes/dashboardGraph.routes");
const setThresholdsRoutes = require("./routes/setThresholds.routes");
const getNotificationsRoutes = require("./routes/getNotifications.routes");
const getClinicianPatientsRoutes = require("./routes/getClinicianPatients.routes");
const clinicianAuthRoutes = require("./routes/clinicianAuth.routes");
const getClinicianPatientDashboardRoutes = require("./routes/getClinicianPatientDashboard.routes");
const getClinicianPatientGraphRoutes = require("./routes/getClinicianPatientGraph.routes");
const createAppointmentRoutes = require("./routes/createAppointment.routes");

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
app.use("/api", updateFcmKeyRoutes);
app.use("/api/", userDashboardRoutes);
app.use("/api/", getThresholdsRoutes);
app.use("/api/", dashboardGraphRoutes);
app.use("/api/", setThresholdsRoutes);
app.use("/api/", getNotificationsRoutes);
app.use("/api/", getClinicianPatientsRoutes);
app.use("/api/", clinicianAuthRoutes);
app.use("/api", getClinicianPatientDashboardRoutes);
app.use("/api/", getClinicianPatientGraphRoutes);
app.use("/api/", createAppointmentRoutes);

// Do not move this, keep it at the bottom of the middleware stack, otherwise it won't pick up the 404 errors properly
app.use((req, res, next) => {
    res.status(404).send("Sorry, can't find that!");
})

module.exports = app;