const config = require('../config/config');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.requestHandler = async (req, res, next) => {
    
    // Check for Request cookies
    if (req.cookies) {

        const cookies = req.cookies

        // Extract access and refresh tokens
        const accessToken = cookies.access_token;
        const refreshToken = cookies.refresh_token;

        // Verify access token
        jwt.verify(
            accessToken,
            config.access_token_secret,
            async (error, decoded) => {

                // If decode of access_token unsuccessful, use refreshToken to get
                // a new access token
                if (error) {

                    // Start by validating the refresh token
                    // Retrieve user
                    const user = await User.findOne({ refreshToken : refreshToken });

                    if (!user) {
                        // Ask user to log back in for a new refresh token
                        return res.sendStatus(403);
                    } else {

                        // Create new access token 
                        const newAccessToken = jwt.sign(
                            {
                                "sub": user._id,
                                "role": user.role
                            },
                            config.access_token_secret,
                            { expiresIn: "5m" }
                        );

                        // Send a new access token and mark as logged in
                        res.cookie('access_token', newAccessToken,
                            {
                                httpOnly: true,
                                /* secure: process.env.NODE_ENV === 'production' */
                                sameSite: 'Lax',
                                maxAge: 5 * 60 * 1000 // 5 mins
                            }
                        );

                        // Attach req variables
                        attachRequestVariables(
                            verified=true,
                            req=req,
                            sub=user._id,
                            role=user.role
                        );
                    }
                } else {
                    attachRequestVariables(
                        verified=true,
                        req=req,
                        sub=decoded.sub,
                        role=decoded.role,
                    );
                }
            }
        )
        console.log(req.cookies);
    } else {
        // If no cookies found then the user is not / has never logged in
       attachRequestVariables(verified=false);
    }
    next();
}

/**
 * 
 * @param {Boolean} verified 
 * @param {Request} req
 * @param {String} sub
 * @param {String} role
 */
const attachRequestVariables = (verified, req, sub, role) => {
    if (verified) {
        req.sub = sub;
        req.role = role;
        req.login = true;
    } else {
        req.login = false;
    }
}