const { MongoClient } = require('mongodb');

// URI diambil dari Environment Variable Vercel
const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
    throw new Error('Please add your Mongo URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else {
    client = new MongoClient(uri);
    clientPromise = client.connect();
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const client = await clientPromise;
        
        // Asumsi DB nama 'test' karena mongoose defaultnya test jika tidak dispesifikasi.
        // Sebaiknya baca dari db name yang ada di uri.
        const db = client.db(); 

        const patchNotes = await db
            .collection('patchnotes')
            .find({})
            .sort({ timestamp: -1 })
            .limit(10)
            .toArray();

        res.status(200).json({ success: true, data: patchNotes });
    } catch (e) {
        console.error(e);
        res.status(500).json({ success: false, error: 'Database connection failed' });
    }
};
