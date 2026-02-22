const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");;

const updateFcmKey = async (req, res) => {
    const { userApiKey, fcmToken } = req.body;

    if (!userApiKey || !fcmToken) {
        return res.status(400).json({
            error: "An ApiToken and an FCMToken are required",
        });
    }

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        const updatedUser = await prisma.user.update({
            where: {
                userId: decoded.userId
            },
            data: {
               fcmKey: fcmToken 
            }
        })

        return res.status(200).json({
            fcmToken: updatedUser.fcmKey
        });

    } catch (err) {
        if (err.name == "TokenExpiredError") {
            return res.status(401).json({
                error: "Expired token",
            })
        } else {
            return res.status(400).json({
                error: "Unknown error",
                name: err.name
            })
        }
    }
}

module.exports = {
    updateFcmKey,
}