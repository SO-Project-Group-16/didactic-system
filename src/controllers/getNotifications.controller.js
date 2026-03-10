const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

function formatDate(date) {
    const d = new Date(date);

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    const hours = String(d.getHours()).padStart(2,"0)");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

const getNotifications = async (req, res) => {
    const { userApiKey } = req.query;

    if (!userApiKey) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: "A userApiKey is required"
        });
    }
    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        const notifications = await prisma.userNotification.findMany({
            where: {
                userId: decoded.userId
            },
            orderBy: {
                sent: "desc"
            }
        });
        
        const result = {};
        for (const notification of notifications) {

            const item = {
                appointment: notification.appoitmentId !== null,
                sent: formatDate(notification.sent),
                content: notification.content
            };
            if (notification.appoitmentId !== null) {
                item["appointment-id"] = notification.appoitmentId;
            }

            result[notification.notificationId] = item;
        }
        return res.status(200).json({
            notifications: result
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: err.name
        });

    }
};
module.exports = { getNotifications };