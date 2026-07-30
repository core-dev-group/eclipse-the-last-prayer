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
