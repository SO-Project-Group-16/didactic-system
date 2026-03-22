const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getClinicianPatientDashboard = async (req, res) => {
    const { userApiKey, patientId } = req.body;

    if (!userApiKey || !patientId) {
        return res.status(400).json({
            error: "Missing data",
            message: "userApiKey and patientId are required"
        });
    }

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        if (decoded.role !== "clinician") {
            return res.status(401).json({
                error: "Invalid account type",
                message: "Clinician token required"
            });
        }

        const link = await prisma.clinicianPatient.findFirst({
            where: {
                clinicianId: decoded.clinicianId,
                patientId: patientId
            }
        });

        if (!link) {
            return res.status(401).json({
                error: "Unauthorised",
                message: "Clinician not assigned to this patient"
            });
        }

        const latestRecord = await prisma.dailyRecord.findFirst({
            where: {
                userId: patientId
            },
            orderBy: {
                date: "desc"
            }
        });

        if (!latestRecord) {
            return res.status(200).json({
                heartRate: null,
                steps: 0,
                systolic: 0,
                diastolic: 0,
                calories: 0
            });
        }

        const latestHeartRate = await prisma.userHeartRate.findFirst({
            where: {
                dailyRecordId: latestRecord.dailyRecordId
            },
            orderBy: [
                { hour: "desc" },
                { minute: "desc" }
            ]
        });

        return res.status(200).json({
            heartRate: latestHeartRate ? latestHeartRate.reading : null,
            steps: latestRecord.steps,
            systolic: latestRecord.systolic,
            diastolic: latestRecord.diastolic,
            calories: latestRecord.calories
        });

    } catch (err) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: err.name
        });
    }
};

module.exports = { getClinicianPatientDashboard };