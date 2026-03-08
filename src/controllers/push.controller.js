const { upsertDeviceToken, deactivateDevice } = require("../db/deviceTokens.memory");

// auth placeholder, once we set up firebase replace with real auth
function requireUser(req, res) {
    const userId = req.get("example-userId");
    if (!userId){
        res.status(401).json({ error: "unauthorised", message: "Missing user id header" });
        return null;
    }
    return String(userId);
}

async function registerToken(req, res, next){
    try {
        const userId = requireUser(req, res);
        if(!userId) return;

        const {deviceId, platform, token } = req.body || {};
        if(!deviceId || !platform || !token){
            return res.status(400).json({
                error: "Missing fields",
                required: ["deviceId", "platform", "token"],
            });
        }
        if (typeof token !== "string" || token.length > 4096) {
            return res.status(400).json({ error: "invalid_token", message: "Token must be a string characters < 4096"});

        }
        await upsertDeviceToken({
            userId,
            deviceId: String(deviceId),
            platform: String(platform),
            token: String(token),
        });
        return res.json({ ok: true});
    } catch (err){
        next(err);
    }
}
async function unregisterDevice(req, res, next){
    try{
        const userId = requireUser(req, res);
        if(!userId) return;

        const {deviceId} = req.body || {};
        if(!deviceId){
            return res.status(400).json({ error: "missing deviceID" });
        }
        await deactivateDevice({ userId, deviceId: String(deviceId) });
        return res.json({ ok: true });

    } catch(error){
        next(error);
    }
}
module.exports = { registerToken, unregisterDevice };