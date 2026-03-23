const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { sendNotification } = require("../services/fcm.services");

function formatAppointmentDate(dateInput) {
    const d = new Date(dateInput);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

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
        const user = await prisma.user.findUnique({
            where: {
                userId: Number(patientId)
            },
            select: {
                userId: true,
                fcmKey: true
            }
        });
        const formattedDate = formatAppointmentDate(appointment.datetime);
        const content = `You have a new appointment on ${formattedDate} at ${location} regarding ${purpose}.`;
        // Save in-app notification
        if (user){
            await prisma.userNotification.create({
                data: {
                    userId: user.userId,
                    appointmentId: appointment.appointmentId,
                    content,
                    sent: new Date()
                }
            });
        }
        let pushSent = false;
        let pushError = null;

        if(user?.fcmKey) {
            try{
                await sendNotification(
                    user.fcmKey,
                    "New Appointment Scheduled",
                    content
                );
                pushSent = true;
            } catch (err){
                pushError = err.message;
                console.log("FCM send error =", err);

                if (
                    err.code === "messaging/registration-token-not-registered" ||
                    err.code === "messaging/invalid-registration-token"
                ) {
                    await prisma.user.update({
                        where: { userId: userId },
                        data: { fcmKey: null}
                    });
                }
            }
        }
        return res.status(200).json({
            message: "Appointment created successfully",
            appointmentId: appointment.appointmentId,
            pushSent,
            pushError
        });
    } catch (err){
        console.log("createAppointment error =", err);
        return res.status(500).json({
            error: "Servor error"
        })
    }
}
module.exports = { createAppointment };