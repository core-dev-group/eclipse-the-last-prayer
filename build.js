const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');

// Daftar halaman yang akan di-build
const pages = [
    { input: 'index.ejs', output: 'index.html' },
    { input: 'privacy.ejs', output: 'privacy.html' },
    { input: 'terms.ejs', output: 'terms.html' }
];

console.log('Memulai proses build The Nameless King...');

pages.forEach(page => {
    const inputFile = path.join(viewsDir, page.input);
    const outputFile = path.join(publicDir, page.output);

    // Render jika file ejs-nya ada
    if (fs.existsSync(inputFile)) {
        ejs.renderFile(inputFile, {}, { views: [viewsDir] }, (err, str) => {
            if (err) {
                console.error(`❌ Gagal merender ${page.input}:`, err);
                process.exit(1);
            }
            
            // Tulis hasilnya ke public folder
            fs.writeFileSync(outputFile, str);
            console.log(`✅ Build sukses! File HTML tersimpan di public/${page.output}`);
        });
    } else {
        console.warn(`⚠️ Peringatan: File ${page.input} tidak ditemukan, melompati build halaman ini.`);
    }
});
