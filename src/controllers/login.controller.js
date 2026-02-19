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

    res.status(200).json({
        userApiKey: "API_KEY_HERE",
    })
}

module.exports = {
    attemptLogin,
}