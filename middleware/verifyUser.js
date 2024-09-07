const verifyUser = (req, res, next) => {
    const id = req.query.id;
    
    // Check if url params id = the JWT user id
    if (String(req.sub) !== id) {
        // Potential random XSS attack :(
        return res.sendStatus(403);
    }
    next();
}

module.exports = verifyUser;