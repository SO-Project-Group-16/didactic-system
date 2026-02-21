const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../utils/prisma");


const signupUser = async (req, res) => {
    const { username, emailAddress, password } = req.body;

    if (!emailAddress || !password) {
        return res.status(400).json({
            error: "An emailAddress and password is required",
        });
    }

    // Handle checking all the data in the DB here,
    // Check the email address is unique, etc
    let emailAddressUnique = true;

    // Check that there is no user with the given email
    emailAddressUnique = await prisma.user.count({
        where: { emailAddress: emailAddress }
    }) === 0

    
    if (emailAddressUnique) {        
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user account
        const user = await prisma.user.create({
            data: {
                emailAddress: emailAddress,
                pwHash: hashedPassword,
                fcmKey: "",
                age: 0,
                biologicalSex: ""
            }
        });

        // Create a UserThreshold record for the new user
        const userThreshold = await prisma.userThreshold.create({
            data: {
                userId: user.userId
            }
        });

        // Create a UserGoal record for the new user
        const userGoal = await prisma.userGoal.create({
            data: {
                userId: user.userId
            }
        });

        console.log("Created new user record");

        // Send the response
        res.status(200).json(user)
    } else if (!emailAddressUnique) {
        // The email address has been used
    }
}

module.exports = {
    signupUser,
}