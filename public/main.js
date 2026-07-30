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
        .then(json => {
            const loading = document.getElementById('loadingPatchNotes');
            if (loading) loading.remove();
            
            // Hapus log-cursor dulu
            const cursor = patchNotesContainer.querySelector('.log-cursor');
            if (cursor) cursor.remove();

            if (json.success && json.data && json.data.length > 0) {
                json.data.forEach(note => {
                    const entry = document.createElement('div');
                    entry.className = 'log-entry';
                    
                    let changesHTML = '';
                    if (note.changes && Array.isArray(note.changes)) {
                        note.changes.forEach(change => {
                            changesHTML += `<p class="log-text">> ${change}</p>`;
                        });
                    }

                    entry.innerHTML = `
                        <span class="log-date">${note.date}</span> <span class="log-version">${note.version}</span>
                        ${changesHTML}
                    `;
                    patchNotesContainer.appendChild(entry);
                });
            } else {
                const empty = document.createElement('div');
                empty.className = 'log-entry';
                empty.innerHTML = `<span class="log-text" style="color:#8b949e;">Tidak ada pembaruan saat ini.</span>`;
                patchNotesContainer.appendChild(empty);
            }

            // Kembalikan cursor di paling bawah
            const newCursor = document.createElement('div');
            newCursor.className = 'log-cursor';
            newCursor.innerText = '_';
            patchNotesContainer.appendChild(newCursor);
        })
        .catch(err => {
            console.error('Gagal mengambil patch notes:', err);
            const loading = document.getElementById('loadingPatchNotes');
            if (loading) {
                loading.innerHTML = `<span class="log-text" style="color: #ff4444;">Gagal terhubung ke satelit. Menggunakan data cadangan (Offline).</span>`;
            }
        });
}
