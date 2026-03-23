const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

console.log(Object.keys(prisma));
const createAppointment = async (req, res) => {
    const { userApiKey, patientId, purpose, location, datetime, notes, requirements } = req.body;
    if (!userApiKey || !patientId || !purpose || !location || !datetime){
        return res.status(400).json({
            error: "Missing data"
        });
    }
    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        if(decoded.role !== "clinician") {
            return res.status(401).json({
                error: "Invalid account type"
            });
        }
        // Link clinician to patient
        const link = await prisma.clinicianPatient.findFirst({
            where: {
                clinicianId: decoded.clinicianId,
                patientId: Number(patientId)
            }
        });
        if (!link){
            return res.status(401).json({
                error: "Unauthorised"
            });
        }
        // create appointment with form data
        const appointment = await prisma.appointment.create({
            data: {
                patientId: Number(patientId),
                clinicianId: decoded.clinicianId,
                purpose: String(purpose),
                location: String(location),
                datetime: new Date(datetime),
                notes: notes ? String(notes) : "",
                requirements: requirements ? String(requirements) : ""
            }
        });
        return res.status(200).json({
            message: "Appointment created successfully",
            appointmentId: appointment.appointmentId
        });
    } catch (err){
        console.log("createAppointment error =", err);
        return res.status(500).json({
            error: "Servor error"
        })
    }
}
module.exports = { createAppointment };