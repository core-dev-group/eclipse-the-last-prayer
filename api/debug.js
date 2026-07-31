module.exports = (req, res) => {
    res.json({
        hasMongoUri: !!process.env.MONGODB_URI,
        uriType: typeof process.env.MONGODB_URI,
        uriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
        nodeEnv: process.env.NODE_ENV,
    });
};
