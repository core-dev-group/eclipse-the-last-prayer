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
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        const { email } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
        }

        const client = await clientPromise;
        const db = client.db('namelessking');
        const collection = db.collection('preregister');

        // Cek apakah email sudah terdaftar
        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: 'Email ini sudah terdaftar sebelumnya!' });
        }

        // Simpan email baru
        await collection.insertOne({
            email,
            date: new Date().toISOString(),
            status: 'waiting'
        });

        res.status(200).json({ success: true, message: 'Berhasil didaftarkan.' });
    } catch (error) {
        console.error('Error saving preregister email:', error);
        res.status(500).json({ success: false, error: 'Gagal menghubungi database server.' });
    }
};
