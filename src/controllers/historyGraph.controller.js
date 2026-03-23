const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getHistoryGraphData = async (req, res) => {
    const { userApiKey, type, date } = req.body;

    if (!userApiKey || type === undefined || !date) {
        return res.status(400).json({
            message: "A userApiKey, type, and date are required"
        });
    }

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        if (!isBiometricTypeValid(type)) {
            return res.status(400).json({
                message: `Biometric type must be between 0 and 3, received: ${type}`
            });
        }

        const selectedDate = new Date(date);
        if (Number.isNaN(selectedDate.getTime())) {
            return res.status(400).json({
                message: `Invalid date received: ${date}`
            });
        }

        const startDate = new Date(selectedDate);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(selectedDate);
        endDate.setHours(23, 59, 59, 999);

        const numericType = Number(type);

        if (numericType === 0) {
            const records = await prisma.dailyRecord.findMany({
                where: {
                    userId: decoded.userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    userHeartRates: true
                },
                orderBy: {
                    date: "asc"
                }
            });

            const labels = [];
            const values = [];

            records.forEach((record) => {
                const sorted = [...record.userHeartRates].sort((a, b) => {
                    if (a.hour !== b.hour) return a.hour - b.hour;
                    return a.minute - b.minute;
                });

                sorted.forEach((row) => {
                    labels.push(`${pad(row.hour)}:${pad(row.minute)}`);
                    values.push(row.reading);
                });
            });

            return res.status(200).json({ labels, values });
        }

        if (numericType === 1) {
            const record = await prisma.dailyRecord.findFirst({
                where: {
                    userId: decoded.userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            return res.status(200).json({
                labels: record ? [formatDate(record.date)] : [],
                values: record ? [record.steps] : []
            });
        }
        if (numericType === 2) {
            const records = await prisma.dailyRecord.findMany({
                where: {
                    userId: decoded.userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                orderBy: {
                    date: "asc"
                }
            });
            return res.status(200).json({
                labels: records.map((r) => formatDate(r.date)),
                systolic: records.map((r) => r.systolic),
                diastolic: records.map((r) => r.diastolic)
            });
        }

        if (numericType === 3) {
            const record = await prisma.dailyRecord.findFirst({
                where: {
                    userId: decoded.userId,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            return res.status(200).json({
                labels: record ? [formatDate(record.date)] : [],
                values: record ? [record.calories] : []
            });
        }

        return res.status(400).json({
            message: "Invalid graph type"
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid token",
            message: err.name
        });
    }
};

function isBiometricTypeValid(type) {
    return Number(type) >= 0 && Number(type) <= 3;
}

function pad(value) {
    return String(value).padStart(2, "0");
}

function formatDate(date) {
    const d = new Date(date);
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}
module.exports = {
    getHistoryGraphData
};