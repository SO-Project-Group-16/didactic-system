const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getClinicianPatients = async (req, res) => {
    const { userApiKey } = req.body;

    if (!userApiKey) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: "A userApiKey is required"
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

        const links = await prisma.clinicianPatient.findMany({
            where: {
                clinicianId: decoded.clinicianId
            },
            include: {
                patient: true
            },
            orderBy: {
                assignedAt: "desc"
            }
        });

        const patients = links.map(link => ({
            userId: link.patient.userId,
            emailAddress: link.patient.emailAddress
        }));

        return res.status(200).json({
            patients
        });

    } catch (err) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: err.name
        });
    }
};

module.exports = { getClinicianPatients };