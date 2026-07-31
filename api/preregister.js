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
        const { email, turnstileToken } = req.body;
        
        if (!email || !email.includes('@')) {
            return res.status(400).json({ success: false, error: 'Format email tidak valid.' });
        }
        
        if (!turnstileToken) {
            return res.status(400).json({ success: false, error: 'Verifikasi keamanan (CAPTCHA) gagal. Silakan coba lagi.' });
        }

        // Ambil IP Address pengirim (Di Vercel, biasanya ada di header x-forwarded-for)
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';

        // Verifikasi Turnstile ke server Cloudflare
        const turnstileVerify = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: process.env.TURNSTILE_SECRET,
                response: turnstileToken,
                remoteip: ip
            })
        });
        
        const turnstileResult = await turnstileVerify.json();
        if (!turnstileResult.success) {
            return res.status(403).json({ success: false, error: 'Aktivitas mencurigakan terdeteksi (Bot). Silakan coba lagi.' });
        }

        const client = await clientPromise;
        const db = client.db('namelessking');
        const collection = db.collection('preregister');


        // Cek Anti-Spam: Berapa kali IP ini mendaftar dalam 24 jam terakhir?
        const oneDayAgo = new Date();
        oneDayAgo.setHours(oneDayAgo.getHours() - 24);
        
        const recentRegistrations = await collection.countDocuments({ 
            ip: ip,
            date: { $gte: oneDayAgo.toISOString() }
        });
        
        // Batas maksimal 3 kali daftar per IP dalam sehari
        if (recentRegistrations >= 3 && ip !== 'unknown') {
            return res.status(429).json({ success: false, error: 'Batas pendaftaran harian tercapai. Coba lagi besok.' });
        }

        // Cek apakah email sudah terdaftar
        const existingEmail = await collection.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ success: false, error: 'Email ini sudah terdaftar sebelumnya!' });
        }

        // Simpan email baru beserta IP-nya
        await collection.insertOne({
            email,
            ip,
            date: new Date().toISOString(),
            status: 'waiting'
        });

        res.status(200).json({ success: true, message: 'Berhasil didaftarkan.' });
    } catch (error) {
        console.error('Error saving preregister email:', error);
        res.status(500).json({ success: false, error: 'Gagal menghubungi database server.' });
    }
};
