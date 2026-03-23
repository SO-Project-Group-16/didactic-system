const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getClinicianPatientGraph = async (req, res) => {
    const { userApiKey, patientId, type, dateFrame } = req.body;
    if (!userApiKey || !patientId || type === undefined || !dateFrame) {
        return res.status(400).json({
            error: "Missing data",
            message: "userApiKey, patientId, type, and dateFrame are required"
        });
    }

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);
        console.log("graph req body =", req.body);
        console.log("decoded token =", decoded);
        if (decoded.role !== "clinician") {
            return res.status(401).json({
                error: "Invalid account type",
                message: `Clinician token required, got ${decoded.role}`
            });
        }
        const link = await prisma.clinicianPatient.findFirst({
            where: {
                clinicianId: decoded.clinicianId,
                patientId: Number(patientId)
            }
        });
        console.log("link =", link);
        if (!link) {
            return res.status(401).json({
                error: "Unauthorised",
                message: "Clinician not assigned to this patient"
            });
        }

        if (!isBiometricTypeValid(type)) {
            return res.status(400).json({
                error: "Invalid type",
                message: `Biometric type must be between 0 and 3. Received: ${type}`
            });
        }

        if (!isDateFrameValid(dateFrame)) {
            return res.status(400).json({
                error: "Invalid dateFrame",
                message: `dateFrame must be like 7d, 2w, 1m, 1y. Received: ${dateFrame}`
            });
        }
        // check the amount of days of data needed
        const daysToGrab = convertDateFrameToDays(dateFrame);

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToGrab);
        startDate.setHours(0, 0, 0, 0);

        let data = [];
        switch (Number(type)) {
            case 0: {
                // Heart rate, uses the userHeartRates table along with dailyRecords
                const records = await prisma.dailyRecord.findMany({
                    where: {
                        userId: Number(patientId),
                        date: {
                            gte: startDate
                        }
                        
                    },
                    include: {
                        userHeartRates: true
                    },
                    orderBy: {
                        date: "asc"
                    }
                });
                data = [];
                records.forEach((record) => {
                    const sortedHeartRates = [...record.userHeartRates].sort((a,b)=> {
                        if (a.hour !== b.hour) return a.hour - b.hour;
                        return a.minute - b.minute;                    
                    });
                    sortedHeartRates.forEach((row) => {
                        data.push({
                        label: `${formatDate(record.date)} ${pad(row.hour)}:${pad(row.minute)}`,
                        value: row.reading
                    });
                });
            });

            break;
            }

            case 1: {
                // Steps
                const records = await prisma.dailyRecord.findMany({
                    where: {
                        userId: patientId,
                        date: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        date: "asc"
                    }
                });

                data = records.map((row) => ({
                    label: formatDate(row.date),
                    value: row.steps
                }));
                break;
            }

            case 2: {
                // Blood pressure
                const records = await prisma.dailyRecord.findMany({
                    where: {
                        userId: patientId,
                        date: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        date: "asc"
                    }
                });

                data = records.map((row) => ({
                    label: formatDate(row.date),
                    systolic: row.systolic,
                    diastolic: row.diastolic
                }));
                break;
            }

            case 3: {
                // Calories
                const records = await prisma.dailyRecord.findMany({
                    where: {
                        userId: patientId,
                        date: {
                            gte: startDate
                        }
                    },
                    orderBy: {
                        date: "asc"
                    }
                });

                data = records.map((row) => ({
                    label: formatDate(row.date),
                    value: row.calories
                }));
                break;
            }
        }
        // debugging
        console.log("patientId =", patientId);
        console.log("type =", type);
        console.log("dateFrame =", dateFrame);
        console.log("data =", data);

        return res.status(200).json({
            data
        });

    } catch (err) {
        console.log("graph controller error =", err);
        return res.status(500).json({
            error: "Server error",
            message: err.message,
            name: err.name
        });
    }
};

function isBiometricTypeValid(type) {
    return Number(type) >= 0 && Number(type) <= 3;
}
function isDateFrameValid(dateFrame) {
    const unit = dateFrame.at(-1);
    const numberPart = dateFrame.slice(0, -1);

    return ["d", "w", "m", "y"].includes(unit) && !isNaN(numberPart);
}

function convertDateFrameToDays(dateFrame) {
    const unit = dateFrame.at(-1);
    const numberPart = Number(dateFrame.slice(0, -1));

    switch (unit) {
        case "d": return numberPart;
        case "w": return numberPart * 7;
        case "m": return numberPart * 30;
        case "y": return numberPart * 365;
        default: return 0;
    }
}

function formatDate(date) {
    const d = new Date(date);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

module.exports = { getClinicianPatientGraph };