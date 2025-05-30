// Configuration EmailJS
(function() {
    // Remplacez "YOUR_PUBLIC_KEY", "YOUR_SERVICE_ID", et "YOUR_TEMPLATE_ID" par vraies clés EmailJS
    emailjs.init("YOUR_PUBLIC_KEY"); 
})();

// État global
let currentLang = 'fr'; // Langue par défaut

// Éléments DOM (s'assurer qu'ils existent tous dans le HTML)
const header = document.getElementById('header');
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const closeMenuBtn = document.getElementById('close-menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
const overlay = document.querySelector('.overlay');
const backToTopBtn = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    if (typeof translations === 'undefined') {
        console.error("Le fichier translations.js n'a pas été chargé ou la variable 'translations' n'est pas définie.");
        return;
    }
    initLanguage();
    initNavigation();
    initMobileMenu();
    initScrollEffects();
    initTestimonials();
    initFAQ();
    initContactForm();
    initXSSProtection(); // Appel de la fonction de protection XSS
});

// Système de traduction
function initLanguage() {
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language.split('-')[0];
    currentLang = savedLang || (translations[browserLang] ? browserLang : 'fr');
    
    setLanguage(currentLang);
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            setLanguage(lang);
            if (this.closest('.mobile-menu')) {
                closeMobileMenu();
            }
        });
    });
}

function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Langue "${lang}" non trouvée dans les traductions. Utilisation de la langue par défaut "fr".`);
        lang = 'fr'; // Revenir à la langue par défaut si la langue demandée n'existe pas
    }
    currentLang = lang;
    localStorage.setItem('preferredLanguage', lang);
    
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        } else {
            console.warn(`Traduction manquante pour la clé "${key}" en langue "${lang}". Affichage en français.`);
            // Afficher la traduction en français si elle existe
            if (translations['fr'] && translations['fr'][key]) {
                element.textContent = translations['fr'][key];
                 console.warn(`Traduction manquante pour la clé "${key}" en langue "${lang}". Affichage en français.`);
            } else {
                console.warn(`Clé de traduction "${key}" non trouvée, même en français. L'élément ne sera pas traduit.`);
            }
        }
    });
    
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);
}

// Navigation
function initNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    function updateActiveLink() {
        if (!sections.length) return; // S'il n'y a pas de sections, ne rien faire
        const scrollPosition = window.scrollY + (header ? header.offsetHeight : 0) + 50; // Ajout d'un offset pour le header
        
        let currentSectionId = null;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });

        // Gérer le cas où l'utilisateur est tout en haut (section #home)
        if (window.scrollY < sections[0].offsetTop - (header ? header.offsetHeight : 0) - 50) {
             navLinks.forEach(link => {
                link.classList.toggle('active', link.getAttribute('href') === `#${sections[0].id}`);
            });
        }
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').slice(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                if (mobileMenu && mobileMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            }
        });
    });
    
    window.addEventListener('scroll', updateActiveLink);
    updateActiveLink(); // Appel initial pour définir le lien actif au chargement
}

// Menu mobile
function initMobileMenu() {
    if (mobileMenuBtn && closeMenuBtn && mobileMenu && overlay) {
        mobileMenuBtn.addEventListener('click', openMobileMenu);
        closeMenuBtn.addEventListener('click', closeMobileMenu);
        overlay.addEventListener('click', closeMobileMenu);
    }
}

function openMobileMenu() {
    if (mobileMenu && overlay) {
        mobileMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    if (mobileMenu && overlay) {
        mobileMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Effets de scroll
function initScrollEffects() {
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.scrollY;
        
        if (header) {
            if (currentScroll > 50) {
                header.style.padding = '0.5rem 0';
            } else {
                header.style.padding = '1rem 0';
            }
        }
        
        if (backToTopBtn) {
            if (currentScroll > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }
        
        lastScroll = currentScroll;
    });
    
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Témoignages
function initTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dots .dot');
    if (testimonialCards.length === 0 || dots.length === 0) return;

    let currentTestimonial = 0;
    let testimonialInterval;

    function showTestimonial(index) {
        testimonialCards.forEach((card, i) => {
            card.classList.toggle('active', i === index);
        });
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
        currentTestimonial = index;
    }

    function startInterval() {
        testimonialInterval = setInterval(() => {
            const nextIndex = (currentTestimonial + 1) % testimonialCards.length;
            showTestimonial(nextIndex);
        }, 5000);
    }

    function stopInterval() {
        clearInterval(testimonialInterval);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopInterval();
            showTestimonial(index);
            startInterval(); // Redémarre l'intervalle après un clic manuel
        });
    });
    
    showTestimonial(0); // Afficher le premier témoignage au chargement
    startInterval(); // Démarrer la rotation automatique
}

// FAQ
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Fermer tous les autres avant d'ouvrir celui-ci
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });
                
                item.classList.toggle('active', !isActive);
            });
        }
    });
}

// Formulaire de contact
function initContactForm() {
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const nameInput = this.name;
            const emailInput = this.email;
            const subjectInput = this.subject;
            const messageInput = this.message;

            // Vérification simple que les champs ne sont pas vides
            if (!nameInput.value.trim() || !emailInput.value.trim() || !subjectInput.value.trim() || !messageInput.value.trim()) {
                alert('Veuillez remplir tous les champs requis.');
                return;
            }

            const formData = {
                name: sanitizeInput(nameInput.value),
                email: sanitizeInput(emailInput.value),
                subject: sanitizeInput(subjectInput.value),
                message: sanitizeInput(messageInput.value)
            };
            
            if (!isValidEmail(formData.email)) {
                alert(translations[currentLang]['contact.form.invalidEmail'] || 'Veuillez entrer une adresse email valide.');
                return;
            }
            
            // Désactiver le bouton pendant l'envoi
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = translations[currentLang]['contact.form.sending'] || 'Envoi en cours...';


            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', formData)
                .then(function(response) {
                    console.log('SUCCESS!', response.status, response.text);
                    if (formStatus) {
                        formStatus.classList.remove('hidden');
                        // Mettre à jour le texte du message de succès avec la traduction
                        const successMsgElement = formStatus.querySelector('p');
                        if (successMsgElement) {
                             successMsgElement.textContent = translations[currentLang]['contact.form.successMsg'] || 'Message envoyé avec succès.';
                        }
                    }
                    contactForm.reset();
                    
                    setTimeout(() => {
                        if (formStatus) formStatus.classList.add('hidden');
                    }, 5000);
                }, function(error) {
                    console.log('FAILED...', error);
                    alert(translations[currentLang]['contact.form.errorMsg'] || 'Une erreur est survenue. Veuillez réessayer plus tard.');
                })
                .finally(() => {
                    // Réactiver le bouton et restaurer son texte
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                });
        });
    }
}

// Fonctions utilitaires
function sanitizeInput(input) {
    const temp = document.createElement('div');
    temp.textContent = input;
    return temp.innerHTML;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

// Protection contre les attaques XSS (simple)
function initXSSProtection() {
    document.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(input => {
        input.addEventListener('input', function() {
            // Ceci est une mesure très basique. Une vraie sanitization côté serveur est cruciale.
            // Elle empêche l'injection directe de balises <script>.
            this.value = this.value.replace(/</g, "<").replace(/>/g, ">");
        });
    });
}