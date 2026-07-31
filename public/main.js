// Efek Scroll Navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Efek Reveal / Muncul saat discroll (Scroll Animation)
function reveal() {
    var reveals = document.querySelectorAll(".reveal");

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 100; // Mulai muncul saat elemen berjarak 100px dari bawah layar

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add("active");
        }
    }
}

// Jalankan saat pertama kali *load* dan setiap kali di-*scroll*
window.addEventListener("scroll", reveal);
reveal(); // Trigger saat halaman pertama dibuka agar Hero Section langsung muncul

// Logika Modal Pop-Up
const loreBtns = document.querySelectorAll('.btn-lore');
const closeBtns = document.querySelectorAll('.close-btn');

// Buka modal sesuai data-modal
loreBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-modal');
        const modal = document.getElementById(modalId);
        modal.classList.add('show');
    });
});

// Tutup modal lewat tombol silang (X)
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').classList.remove('show');
    });
});

// Tutup modal jika klik di luar area konten
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('show');
    }
});

// Logika FAQ Accordion
const faqItems = document.querySelectorAll('.faq-item');
faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Toggle the active class
        const isActive = item.classList.contains('active');
        
        // Optional: Close all other open FAQs
        faqItems.forEach(otherItem => {
            otherItem.classList.remove('active');
            otherItem.querySelector('.faq-answer').style.maxHeight = null;
        });

        if (!isActive) {
            item.classList.add('active');
            const answer = item.querySelector('.faq-answer');
            answer.style.maxHeight = answer.scrollHeight + 30 + "px"; // 30px for padding
        }
    });
});

// Logika Audio Player
const audio = document.getElementById('bgmPlayer');
const playBtn = document.getElementById('playBtn');
const audioTime = document.getElementById('audioTime');
const audioError = document.getElementById('audioError');
const visualizerBars = document.querySelectorAll('.audio-visualizer .bar');
let isPlaying = false;

if (audio && playBtn) {
    // Format waktu (detik ke menit:detik)
    function formatTime(seconds) {
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min < 10 ? '0' : ''}${min}:${sec < 10 ? '0' : ''}${sec}`;
    }

    // Update durasi saat audio diload
    audio.addEventListener('loadedmetadata', () => {
        audioTime.innerText = `00:00 / ${formatTime(audio.duration)}`;
    });

    // Update waktu berjalan
    audio.addEventListener('timeupdate', () => {
        if (!isNaN(audio.duration)) {
            audioTime.innerText = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        }
    });

    // Tangani error (file tidak ditemukan)
    audio.addEventListener('error', () => {
        audioError.style.display = 'block';
        playBtn.disabled = true;
        playBtn.style.opacity = '0.5';
    });

    // Animasi visualizer
    function toggleVisualizer(play) {
        visualizerBars.forEach(bar => {
            if (play) {
                bar.style.animation = `bounce ${0.5 + Math.random()}s infinite alternate`;
            } else {
                bar.style.animation = 'none';
                bar.style.height = '10px';
            }
        });
    }

    // Play / Pause
    playBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            toggleVisualizer(false);
        } else {
            // Coba play, tangkap error jika file tidak ada
            audio.play().then(() => {
                playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                toggleVisualizer(true);
            }).catch(e => {
                audioError.style.display = 'block';
            });
        }
        isPlaying = !isPlaying;
    });

    // CSS Keyframes untuk animasi bounce visualizer (ditambahkan via JS)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes bounce {
            0% { height: 10px; }
            100% { height: 30px; }
        }
    `;
    document.head.appendChild(style);
}

// Logika Fetch Real-Time Patch Notes
const patchNotesContainer = document.getElementById('patchNotesContainer');
if (patchNotesContainer) {
    fetch('/api/patchnotes')
        .then(res => res.json())
        .then(async json => {
            const loading = document.getElementById('loadingPatchNotes');
            if (loading) loading.remove();
            
            // Hapus log-cursor dulu
            const cursor = patchNotesContainer.querySelector('.log-cursor');
            if (cursor) cursor.remove();

            const terminalBody = document.querySelector('.terminal-body');

            if (json.success && json.data && json.data.length > 0) {
                // Balikkan urutan agar yang terbaru diprint terakhir di bawah
                const logs = [...json.data].reverse();
                
                // Fungsi untuk mengetik karakter satu per satu (efek Hacker lambat)
                async function typeText(element, text, speed) {
                    for (let i = 0; i < text.length; i++) {
                        element.textContent += text.charAt(i);
                        if (terminalBody) {
                            terminalBody.scrollTo({
                                top: terminalBody.scrollHeight,
                                behavior: 'auto' // Jangan smooth agar tidak patah-patah saat ngetik cepat
                            });
                        }
                        await new Promise(r => setTimeout(r, speed));
                    }
                }

                // Fungsi Looping Tanpa Henti
                async function runInfiniteLoop() {
                    while (true) {
                        // Bersihkan layar setiap kali ulang dari awal
                        patchNotesContainer.innerHTML = ''; 
                        
                        for (const note of logs) {
                            const entry = document.createElement('div');
                            entry.className = 'log-entry';
                            patchNotesContainer.appendChild(entry);
                            
                            // Kontainer Judul
                            const titleEl = document.createElement('div');
                            entry.appendChild(titleEl);
                            
                            // Ngetik Tanggal
                            const dateSpan = document.createElement('span');
                            dateSpan.className = 'log-date';
                            titleEl.appendChild(dateSpan);
                            await typeText(dateSpan, `[${note.date}] `, 20); // Kecepatan ngetik
                            
                            // Ngetik Versi
                            const versionSpan = document.createElement('span');
                            versionSpan.className = 'log-version';
                            titleEl.appendChild(versionSpan);
                            await typeText(versionSpan, note.version, 20);
                            
                            // Ngetik Perubahan (Baris demi baris)
                            if (note.changes && Array.isArray(note.changes)) {
                                for (const change of note.changes) {
                                    const p = document.createElement('p');
                                    p.className = 'log-text';
                                    entry.appendChild(p);
                                    await typeText(p, `> ${change}`, 15); // Ngetik isi log lebih cepat sedikit
                                }
                            }
                            
                            // Jeda sejenak sebelum ngetik update berikutnya
                            await new Promise(r => setTimeout(r, 600)); 
                        }
                        
                        // Setelah SEMUA teks selesai diketik, munculkan kursor Hacker berkedip
                        const cursor = document.createElement('div');
                        cursor.className = 'log-cursor';
                        cursor.innerText = '█';
                        patchNotesContainer.appendChild(cursor);
                        
                        if (terminalBody) {
                            terminalBody.scrollTo({ top: terminalBody.scrollHeight, behavior: 'smooth' });
                        }
                        
                        // Tunggu 6 Detik untuk dibaca, lalu bersihkan layar dan ulang dari awal!
                        await new Promise(r => setTimeout(r, 6000));
                    }
                }
                
                // Mulai animasinya
                runInfiniteLoop();

            } else {
                const empty = document.createElement('div');
                empty.className = 'log-entry';
                empty.innerHTML = `<span class="log-text" style="color:#8b949e;">Tidak ada pembaruan saat ini.</span>`;
                patchNotesContainer.appendChild(empty);
            }

            // Kembalikan cursor di paling bawah (efek blok berkedip hacker)
            const newCursor = document.createElement('div');
            newCursor.className = 'log-cursor';
            newCursor.innerText = '█';
            patchNotesContainer.appendChild(newCursor);
            
            if (terminalBody) {
                terminalBody.scrollTo({
                    top: terminalBody.scrollHeight,
                    behavior: 'smooth'
                });
            }
        })
        .catch(err => {
            console.error('Gagal mengambil patch notes:', err);
            const loading = document.getElementById('loadingPatchNotes');
            if (loading) {
                loading.innerText = 'Gagal terhubung ke satelit. Menggunakan data cadangan (Offline).';
                loading.style.color = '#ff5f56';
            }
        });
}

// ==========================================
// NEW FEATURES: LIGHTBOX, FAQ, PRE-REGISTER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Lightbox Gallery
    const galleryImages = document.querySelectorAll('.gallery-image');
    
    if (galleryImages.length > 0) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <span class="lightbox-close"><i class="fa-solid fa-xmark"></i></span>
            <img src="" alt="Lightbox Image">
        `;
        document.body.appendChild(lightbox);
        
        const lightboxImg = lightbox.querySelector('img');
        const closeBtn = lightbox.querySelector('.lightbox-close');
        
        galleryImages.forEach(img => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden'; // Prevent scrolling
            });
        });
        
        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
        
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }

    // 2. FAQ Accordion
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const item = question.parentElement;
            
            // Close others (optional, for accordion effect)
            document.querySelectorAll('.faq-item').forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            item.classList.toggle('active');
        });
    });

    // 3. Pre-Register Form
    const preRegForm = document.getElementById('preRegisterForm');
    const preRegMsg = document.getElementById('preregisterMsg');
    
    if (preRegForm) {
        preRegForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('preregisterEmail');
            const email = emailInput.value;
            const btn = preRegForm.querySelector('button');
            
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Memproses...';
            btn.disabled = true;
            
            try {
                const res = await fetch('/api/preregister', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                const data = await res.json();
                
                if (data.success) {
                    preRegMsg.innerHTML = '<span style="color: var(--neon-green);"><i class="fa-solid fa-check"></i> Email berhasil terdaftar! Kamu akan dihubungi saat Gelombang 2 dibuka.</span>';
                    emailInput.value = '';
                } else {
                    preRegMsg.innerHTML = `<span style="color: #ff5f56;"><i class="fa-solid fa-triangle-exclamation"></i> ${data.error || 'Terjadi kesalahan.'}</span>`;
                }
            } catch (err) {
                preRegMsg.innerHTML = '<span style="color: #ff5f56;"><i class="fa-solid fa-triangle-exclamation"></i> Gagal terhubung ke server.</span>';
            } finally {
                btn.innerHTML = '<i class="fa-solid fa-envelope"></i> Daftar';
                btn.disabled = false;
            }
        });
    }
});
