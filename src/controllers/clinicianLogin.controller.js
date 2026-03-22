const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../utils/prisma");

const clinicianLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "A username and password are required"
        });
    }

    try {
        const clinician = await prisma.clinician.findUnique({
            where: {
                emailAddress: username
            }
        });

        if (!clinician) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const validPassword = await bcrypt.compare(password, clinician.pwHash);

        if (!validPassword) {
            return res.status(400).json({
                error: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            {
                clinicianId: clinician.clinicianId,
                emailAddress: clinician.emailAddress,
                role: "clinician"
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            userApiKey: token
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            message: err.message
        });
    }
};

module.exports = { clinicianLogin };