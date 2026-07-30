const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

const viewsDir = path.join(__dirname, 'views');
const publicDir = path.join(__dirname, 'public');
const inputFile = path.join(viewsDir, 'index.ejs');
const outputFile = path.join(publicDir, 'index.html');

console.log('Memulai proses build The Nameless King...');

ejs.renderFile(inputFile, {}, { views: [viewsDir] }, (err, str) => {
    if (err) {
        console.error('❌ Gagal merender EJS:', err);
        process.exit(1);
    }
    
    // Tulis hasilnya ke public/index.html
    fs.writeFileSync(outputFile, str);
    console.log('✅ Build sukses! File HTML tersimpan di public/index.html');
});
