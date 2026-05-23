document.addEventListener('DOMContentLoaded', () => {
    const heroImage = document.getElementById('hero-image');
    const carouselDots = document.getElementById('carousel-dots');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    
    fetch('hero.json')
        .then(res => res.json())
        .then(slides => {
            if (slides && slides.length > 0) {
                let currentSlide = 0;
                
                const renderSlide = (index) => {
                    const slide = slides[index];
                    heroImage.src = slide.image;
                    
                    let dotsHtml = slides.map((_, i) => `<span class="dot ${i === index ? 'active' : ''}" data-index="${i}"></span>`).join('');
                    carouselDots.innerHTML = dotsHtml;
                    
                    document.querySelectorAll('.dot').forEach(dot => {
                        dot.addEventListener('click', (e) => {
                            const newIndex = parseInt(e.target.getAttribute('data-index'));
                            currentSlide = newIndex;
                            renderSlide(currentSlide);
                        });
                    });
                };
                
                renderSlide(currentSlide);
                
                const nextSlide = () => {
                    currentSlide = (currentSlide + 1) % slides.length;
                    renderSlide(currentSlide);
                };
                
                const prevSlide = () => {
                    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                    renderSlide(currentSlide);
                };

                nextBtn.addEventListener('click', nextSlide);
                prevBtn.addEventListener('click', prevSlide);
                
                let slideInterval = setInterval(nextSlide, 5000);
                
                document.querySelector('.hero-image-container').addEventListener('mouseenter', () => clearInterval(slideInterval));
                document.querySelector('.hero-image-container').addEventListener('mouseleave', () => {
                    slideInterval = setInterval(nextSlide, 5000);
                });
            } else {
                document.querySelector('.hero-section').style.display = 'none';
            }
        })
        .catch(err => {
            console.error('Error fetching hero slides:', err);
        });

    const eventsContainer = document.getElementById('events-container');

    fetch('events.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(events => {
            if (!events || events.length === 0) {
                eventsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem; color: var(--text-muted);">Events are coming soon.</p>';
                return;
            }

            eventsContainer.innerHTML = '';
            events.forEach(event => {
                const card = document.createElement('div');
                card.className = 'event-card';

                card.innerHTML = `
                    <div class="region-tag">${event.region}</div>
                    <img src="${event.image}" alt="${event.title}" class="event-image">
                    <div class="event-info">
                        <div class="event-title">${event.title}</div>
                        <div class="event-date">${event.date}</div>
                        <div class="event-actions" style="margin-top: 15px;">
                            <a href="${event.link}" class="btn-primary" style="display: inline-block; text-align: center; width: 100%;">JOIN</a>
                        </div>
                    </div>
                `;

                eventsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Error fetching events:', error);
            eventsContainer.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; font-size: 1.2rem; color: var(--text-muted);">Events are coming soon.</p>';
        });

    const fetchQualifiedTeams = () => {
        fetch('qualified.json')
            .then(res => {
                if (!res.ok) throw new Error('Failed to load qualified teams');
                return res.json();
            })
            .then(data => {
                const renderRegion = (regionKey, containerId, counterId) => {
                    const teams = data[regionKey] || [];
                    const container = document.getElementById(containerId);
                    const counter = document.getElementById(counterId);
                    
                    counter.textContent = `${teams.length}/32`;
                    
                    if (teams.length === 0) {
                        container.innerHTML = '<p style="color: var(--text-muted);">No teams qualified yet.</p>';
                        return;
                    }
                    
                    container.innerHTML = teams.map(team => `
                        <div class="team-card">
                            <div class="team-name">${team.name}</div>
                            <div class="team-members">
                                ${team.members.map(member => `<span>${member}</span>`).join('')}
                            </div>
                        </div>
                    `).join('');
                };
                
                renderRegion('NA', 'na-teams', 'na-counter');
                renderRegion('EU', 'eu-teams', 'eu-counter');
            })
            .catch(err => {
                console.error('Error fetching qualified teams:', err);
                document.getElementById('na-teams').innerHTML = '<p style="color: var(--text-muted);">Failed to load teams. Information coming soon.</p>';
                document.getElementById('eu-teams').innerHTML = '<p style="color: var(--text-muted);">Failed to load teams. Information coming soon.</p>';
            });
    };
    
    fetchQualifiedTeams();

    const navLinks = document.querySelectorAll('.sub-nav a[href^="#"]');
    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                const headerOffset = 70;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                     top: offsetPosition,
                     behavior: "smooth"
                });
            }
        });
    });

    const sections = document.querySelectorAll('header[id], section[id]');
    const observerOptions = {
        root: null,
        rootMargin: '-80px 0px -60% 0px', 
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
});
