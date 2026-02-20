const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../utils/prisma");

/**
 * Validate the incoming POST data to check if the user is allowed to log in
 */
const attemptLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "A username and a password is required",
        });
    }

    // Check for a user with the given email address
    const userMatch = await prisma.user.findUnique({
        where: { emailAddress: username }
    })

    if (userMatch != null){        
        // Check the password
        bcrypt.compare(password, userMatch.pwHash, function(err, result) {
            if (result) {
                console.log("Password hash is valid");

                // Generate the access token for the api
                const token = jwt.sign({ username: username }, 'secret', {
                    expiresIn: '1h',
                });

                // console.log(jwt.verify(token, 'secret').username);

                res.status(200).json({
                    userApiKey: token,
                })
            } else {
                console.log("Invalid password");
                
                res.status(400).json({
                    error: "Invalid Credentials",
                })
            }
        });
    } else {
        // For data security reasons, if no user account exists, the error
        // is still Invalid Credentials. I want to ensure that you can't brute force 
        // your way into stealing credentials.

        console.log("No user account found")

        res.status(400).json({
            error: "Invalid Credentials",
        })
    }
}

module.exports = {
    attemptLogin,
}