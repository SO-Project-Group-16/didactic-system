const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getThresholds = async (req, res) => {
    const { userApiKey } = req.body;

    if (!userApiKey) {
        return res.status(401).json({
            error: "A userApiKey is required",
        });
    }
    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);
        
        const thresholds = await prisma.userThreshold.findUnique({
            where: {
                userId: decoded.userId
            }
        });
        
        if (!thresholds) {
            return res.status(200).json({
                "0": [0,0,0,0],
                "1": [0,0,0,0],
                "2": [0,0,0,0],
                "3": [0,0,0,0]
            })
        }
        return res.status(200).json({
            "0": [
                thresholds.pAlertHrMin,
                thresholds.pAlertHrMax,
                thresholds.cAlertHrMin,
                thresholds.cAlertHrMax
            ],
            "1": [
                thresholds.pAlertStepsMin,
                thresholds.pAlertStepsMax,
                thresholds.cAlertStepsMin,
                thresholds.cAlertStepsMax
            ],
            "2": [
                thresholds.pAlertBpMin,
                thresholds.pAlertBpMax,
                thresholds.cAlertBpMin,
                thresholds.cAlertBpMax
            ],
            "3": [
                thresholds.pAlertCaloriesMin,
                thresholds.pAlertCaloriesMax,
                thresholds.cAlertCaloriesMin,
                thresholds.cAlertCaloriesMax
            ]
            
        });

    } catch (err) {
        return res.status(401).json({
            error: "Invalid userApiKey"
        });
    }

    
};
module.exports = { getThresholds };