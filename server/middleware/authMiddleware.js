import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({
            error: "No access token.",
        });
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = user.id;

        next();
    } catch (err) {

        // console.log("JWT ERROR:", err.name);
        // console.log("JWT MESSAGE:", err.message);
        return res.status(403).json({
            error: "Access token is invalid",
        });
    }
};