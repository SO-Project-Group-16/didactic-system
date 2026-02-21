const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const verifyJwt = async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            error: "A token is required",
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, async function(err, decoded) {
        if (err) {
            if (err.name == "TokenExpiredError") {
                // The closest status code I could think of for this is 401
                // Since technically the user is unauthenticed.

                return res.status(401).json({
                    error: "Token expired",
                })
            }
        } else {
            // The JWT has not expired, but might still have wrong data
            const userExists = await prisma.user.count({
                where: {
                    AND: [
                        {
                            userId: {
                                equals: decoded.userId,
                            },
                            emailAddress: {
                                equals: decoded.emailAddress,
                            },
                        }
                    ]
                }
            });

            if (userExists > 0) {
                return res.status(200).json({
                    message: "Verified",
                });
            } else {
                return res.status(401).json({
                    error: "Token expired",
                });
            }
        }
    })
}

module.exports = {
    verifyJwt,
}