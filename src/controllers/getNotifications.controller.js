const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");
const { app } = require("firebase-admin");

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Check if a given date object is less than a week old
 * 
 * @param {Date} date 
 * @returns True if the date is less than a week old, false otherwise
 */
function isDateLessThanWeekOld(date) {
    return date > Date.now() - (1000 * 60 * 60 * 24 * 7);
}

/**
 * Format a given date object into a human readable format. 
 * If the date is less than a week old, it will come out with the short name of the day at the begining,
 * otherwise it will come out in the dd/mm/yyyy format
 * 
 * @param {Date} date 
 * @returns A string containing the date in a human readable format
 */
function formatDate(date) {
    const d = new Date(date);

    if (isDateLessThanWeekOld(d)) {
        // Date is less than a week old, format the date as the day of the week

        const day = dayNames[d.getDay()];
        const hours = String(d.getHours()).padStart(2,"0)");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${day} ${hours}:${minutes}`;
    } else {
        // Date is more than a week old, use the original date formatting method

        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const year = d.getFullYear();

        const hours = String(d.getHours()).padStart(2,"0)");
        const minutes = String(d.getMinutes()).padStart(2, "0");

        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
}

const getNotifications = async (req, res) => {
    const { userApiKey } = req.body;

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
            let isAppointment = true;

            if (!notification.appointmentId){
                isAppointment = false;
            }

            const item = {
                appointment: isAppointment,
                sent: formatDate(notification.sent),
                content: notification.content
            };

            if (isAppointment) {
                item["appointment-id"] = notification.appoitmentId;

                // Get the appointment from the db
                const appointment = await prisma.appointment.findFirst({
                    where: {
                        appointmentId: notification.appointmentId
                    }
                });


                item.content = `You have an appointment with your clinician on ${appointment.datetime}. The appointment will be at ${appointment.location} and is regarding: ${appointment.purpose}`;
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