const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const isValidThresholdArray = (value) => {
    return (
        Array.isArray(value) && value.length === 4 && value.every((item) => Number.isInteger(item))
    );
};
const setThresholds = async (req, res) => {
    const { userApiKey, data } = req.body;

    if (!userApiKey) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: "A userApiKey is required"
        });
    }

    if (!data || typeof data !== "object") {
        return res.status(400).json({
            error: "Invalid data",
            message: "A data object is required"
        });
    }

    const keys = ["0", "1", "2", "3"];
    for (const key of keys) {
        if (!isValidThresholdArray(data[key])) {
            return res.status(400).json({
                error: "Invalid data",
                message: "A data object is required"
            });
        }
    }

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        await prisma.userThreshold.update({
            where: {
                userId: decoded.userId
            },
            data: {
                pAlertHrMin: data["0"][0],
                pAlertHrMax: data["0"][1],
                cAlertHrMin: data["0"][2],
                cAlertHrMax: data["0"][3],

                pAlertStepsMin: data["1"][0],
                pAlertStepsMax: data["1"][1],
                cAlertStepsMin: data["1"][2],
                cAlertStepsMax: data["1"][3],
                
                pAlertBpMin: data["2"][0],
                pAlertBpMax: data["2"][1],
                cAlertBpMin: data["2"][2],
                cAlertBpMax: data["2"][3],

                pAlertCaloriesMin: data["3"][0],
                pAlertCaloriesMax: data["3"][1],
                cAlertCaloriesMin: data["3"][2],
                cAlertCaloriesMax: data["3"][3],

                
            }
        });
        return res.status(200).json({
            message: "Thresholds updated successfully"
        });
    } catch (err) {
        return res.status(401).json({
            error: "Invalid userApiKey",
            message: err.name
        });
    }
};
module.exports = { setThresholds };