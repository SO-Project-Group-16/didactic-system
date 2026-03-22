const bcrypt = require("bcrypt");
const prisma = require("../utils/prisma");

const clinicianSignup = async (req, res) => {
    const { name, emailAddress, password } = req.body;

    if (!name || !emailAddress || !password) {
        return res.status(400).json({
            error: "Name, emailAddress and password are required"
        });
    }

    try {
        const existing = await prisma.clinician.findUnique({
            where: {
                emailAddress
            }
        });

        if (existing) {
            return res.status(400).json({
                error: "A clinician with that email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const clinician = await prisma.clinician.create({
            data: {
                name,
                emailAddress,
                pwHash: hashedPassword
            }
        });

        return res.status(200).json({
            clinicianId: clinician.clinicianId,
            name: clinician.name,
            emailAddress: clinician.emailAddress
        });

    } catch (err) {
        return res.status(500).json({
            error: "Server error",
            message: err.message
        });
    }
};

module.exports = { clinicianSignup };