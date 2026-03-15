const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const getGraphData = async (req, res) => {

    const { userApiKey, type, dateFrame} = req.body;

    if (!userApiKey || type == undefined || !dateFrame && false != 0) {
        return res.status(400).json ({
            message: "An api key, type, and dateFrame are required",
        });
    };

    try {
        const decoded = jwt.verify(userApiKey, process.env.JWT_SECRET);

        if (!isBiometricTypeValid(type)) {
            return res.status(400).json({
                message: `Biometric Type must be between 0 and 3, received: ${type}`
            });
        };

        if (!isDateFrameValid(dateFrame)) {
            return res.status(400).json({
                message: `DateFrame must be in the format 'integer...string'. Received: ${dateFrame}`
            });
        };

        // Try to get the user which matches with the userId in the jwt
        const user = await prisma.user.findFirst({
            where: {
                userId: decoded.userId
            }
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid token"
            })
        };

        const outputData = [];

        const dateFrameIdentifer = dateFrame.at(-1);
        const dateFrameTimespan = dateFrame.slice(0, -1);
        var daysToGrab = 0;

        // Turn the string into a number of days
        switch (dateFrameIdentifer) {
            case "d":daysToGrab = dateFrameTimespan;break;
            case "w":daysToGrab = dateFrameTimespan * 7;break;
            case "m":daysToGrab = dateFrameTimespan * 30;break; // On average there are 30.44 days in a month, so this will work
            case "y":daysToGrab = dateFrameTimespan * 365;break; // Leap years don't need to be accounted in this case, as this is only a prototype, but in a full system we should probaby adapt this
        }

        const start_date = new Date();
        start_date.setDate(start_date.getDate() - daysToGrab);
        start_date.setHours(0,0,0,0);

        console.log(start_date);

        var values;

        switch (type) {
            case 0:
                values = await prisma.dailyRecord.findMany({
                    where: {
                        date: {
                            gte: start_date
                        },
                    },
                    select: {
                        calories: true
                    }
                });
                break;

            case 1:
                values = await prisma.dailyRecord.findMany({
                    where: {
                        date: {
                            gte: start_date
                        },
                    },
                    select: {
                        steps: true
                    }
                });
                break;

            case 2:
                values = await prisma.dailyRecord.findMany({
                    where: {
                        date: {
                            gte: start_date
                        },
                    },
                    select: {
                        diastolic: true,
                        systolic: true
                    }
                });
                break;

            case 3:
                values = await prisma.dailyRecord.findMany({
                    where: {
                        date: {
                            gte: start_date
                        },
                    },
                    select: {
                        calories: true
                    }
                });
                break;
        }

        // The variable  values should now always contain key value pairs.
        // Loop through each and take only the value, appending it to output data
        values.forEach((object) => {
            for (const [key, value] of Object.entries(object))  {
                outputData.push(value);
            };
        });

        return res.status(200).json({
            message: "PLACEHOLDER",
            data: outputData
        });
    } catch (err) {
        if (err.name == "TokenExpiredError") {
            return res.status(401).json({
                error: "Token expired"
            })
        }

        console.log(err);
        
        return res.status(401).json({
            error: "Invalid token",
            message: err.name
        });
    }
}

/**
 * Check if the supplied type identifier falls within the expected range
 * 
 * @param {string} type Should be a string containing an integer value
 * @returns true if the biometric type identifier is valid, false otherwise
 */
function isBiometricTypeValid(type) {
    return type <= 3 && type >= 0 ? true : false;
}

/**
 * Check if the date frame consists of only integers followed by a single character
 * It also checks if the single character is one of the expected values
 * 
 * @param {string} dateFrame 
 * @returns true if the date frame is in a valid format, false otherwise
 */
function isDateFrameValid(dateFrame) {
    const dateIdentifierIsValid = ["d", "w", "m", "y"].includes(dateFrame.at(-1));

    // Check that the string minus the character at position -1 is only numbers
    const dateQuantifierIsNaN = isNaN(dateFrame.slice(0, -1).toString());


    if (dateIdentifierIsValid && !dateQuantifierIsNaN) {
        return true;
    }

    return false;
}

module.exports = {
    getGraphData
};