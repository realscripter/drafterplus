import { GAMES, APPS, AUDIO_SETTINGS } from './config.js';
import * as Audio from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const featuredGamesGrid = document.getElementById('featuredGamesGrid');
    const allGamesGrid = document.getElementById('allGamesGrid');
    const searchInput = document.getElementById('searchInput');
    const gameOverlay = document.getElementById('gameOverlay');
    const gameFrame = document.getElementById('gameFrame');
    const currentGameTitle = document.getElementById('currentGameTitle');
    const controlsOverlay = document.querySelector('.game-controls-overlay');
    const closeGameButton = document.getElementById('closeGameButton');
    const fullscreenButton = document.getElementById('fullscreenButton');
    const muteButton = document.getElementById('muteButton');
    const muteIcon = document.getElementById('muteIcon');
    const backgroundMusicIframe = document.getElementById('backgroundMusicIframe');
    const mainContent = document.querySelector('main');
    
    // Create blog overlay
    const blogOverlay = document.createElement('div');
    blogOverlay.className = 'blog-overlay';
    document.body.appendChild(blogOverlay);
    
    // Initialize audio
    Audio.initBackgroundMusic(backgroundMusicIframe);
    
    // Create loading animation
    const loadingAnimation = document.createElement('div');
    loadingAnimation.className = 'loading-animation';
    loadingAnimation.innerHTML = `
        <div class="loading-spinner"></div>
        <div class="corner-logo">Drafterplus.nl</div>
    `;
    
    // Get all games from config
    const allGames = Object.entries(GAMES)
        .map(([id, game]) => ({ id, ...game }));
    
    // Filter games by featured status
    const featuredGames = allGames.filter(game => game.featured);
    
    // Check URL parameters for direct game loading
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game');
    
    if (gameParam && GAMES[gameParam]) {
        setTimeout(() => {
            loadGame(gameParam, GAMES[gameParam].title);
        }, 500);
    }
    
    // Create game card function
    function createGameCard(id, title, description, thumbnail, creator, featured) {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-game-id', id);
        
        let featuredBadge = '';
        if (featured) {
            featuredBadge = `<div class="featured-badge">Featured</div>`;
        }
        
        card.innerHTML = `
            ${featuredBadge}
            <div class="game-thumbnail">
                <img src="${thumbnail}" alt="${title}">
            </div>
            <div class="game-info">
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="game-creator"><i class="fas fa-user-edit"></i> ${creator || 'Unknown'}</div>
            </div>
        `;
        
        card.addEventListener('mouseenter', Audio.playButtonSound);
        card.addEventListener('click', () => {
            Audio.playClickSound();
            loadGame(id, title);
        });
        
        return card;
    }
    
    // Render featured games
    if (featuredGamesGrid) {
        if (featuredGames.length === 0) {
            featuredGamesGrid.innerHTML = '<div class="no-results">No featured games available</div>';
        } else {
            featuredGames.forEach(game => {
                const gameCard = createGameCard(game.id, game.title, game.description, game.thumbnail, game.creator, game.featured);
                featuredGamesGrid.appendChild(gameCard);
            });
        }
    }

    // Render all games (including featured)
    if (allGamesGrid) {
        if (allGames.length === 0) {
            allGamesGrid.innerHTML = '<div class="no-results">No games available</div>';
        } else {
            allGames.forEach(game => {
                const gameCard = createGameCard(game.id, game.title, game.description, game.thumbnail, game.creator, game.featured);
                allGamesGrid.appendChild(gameCard);
            });
        }
    }

    let controlsTimeout;
    
    // Load game function
    function loadGame(gameId, title) {
        // Show game overlay with fade effect
        gameOverlay.classList.add('visible');
        
        // Clear previous src to avoid carrying over old content
        gameFrame.src = '';
        
        // Set timeout to allow transition to occur before loading the game
        setTimeout(() => {
            gameFrame.src = GAMES[gameId].url;
            gameFrame.setAttribute('data-game-id', gameId);
            currentGameTitle.textContent = title;
            
            // Show controls immediately when loading a game
            controlsOverlay.classList.add('visible');
            
            // Make sure control overlay stays visible
            clearTimeout(controlsTimeout);
        }, 100);
        
        // Update URL without refreshing
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('game', gameId);
        window.history.pushState({}, '', newUrl);
    }
    
    // Always show controls for a few seconds when game loads
    gameFrame.addEventListener('load', () => {
        controlsOverlay.classList.add('visible');
        
        // Keep controls visible for 5 seconds after load
        clearTimeout(controlsTimeout);
        controlsTimeout = setTimeout(() => {
            // Don't hide controls - they should always be visible
        }, 5000);
    });
    
    // Close game function
    if (closeGameButton) {
        closeGameButton.addEventListener('click', () => {
            Audio.playClickSound();
            gameOverlay.classList.remove('visible');
            
            // Add corner logo during transition
            const cornerLogo = document.createElement('div');
            cornerLogo.className = 'corner-logo transition-logo';
            cornerLogo.textContent = 'Drafterplus.nl';
            gameOverlay.appendChild(cornerLogo);
            
            // Remove game parameter from URL
            const newUrl = new URL(window.location);
            newUrl.searchParams.delete('game');
            window.history.pushState({}, '', newUrl);
            
            setTimeout(() => {
                gameFrame.src = '';
                gameFrame.removeAttribute('data-game-id');
                gameOverlay.querySelector('.transition-logo')?.remove();
            }, 1500);
        });
    }
    
    // Fullscreen function
    if (fullscreenButton) {
        fullscreenButton.addEventListener('click', () => {
            Audio.playClickSound();
            if (gameFrame.requestFullscreen) {
                gameFrame.requestFullscreen();
            } else if (gameFrame.webkitRequestFullscreen) {
                gameFrame.webkitRequestFullscreen();
            } else if (gameFrame.msRequestFullscreen) {
                gameFrame.msRequestFullscreen();
            }
        });
    }
    
    // Mute button functionality
    if (muteButton) {
        muteButton.addEventListener('click', () => {
            Audio.playClickSound();
            const isMuted = Audio.toggleMute();
            
            if (isMuted) {
                muteIcon.className = 'fas fa-volume-mute';
            } else {
                muteIcon.className = 'fas fa-volume-up';
            }
        });
    }
    
    // Search functionality
    if (searchInput) {
        // Create a search results section that will be shown/hidden
        const searchSection = document.createElement('section');
        searchSection.className = 'search-results hidden';
        searchSection.innerHTML = `
            <h2>Search Results</h2>
            <div class="games-grid" id="searchResultsGrid"></div>
        `;
        
        // Insert search section after featured section
        const featuredSection = document.querySelector('.featured');
        if (featuredSection) {
            featuredSection.after(searchSection);
        } else {
            mainContent.prepend(searchSection);
        }
        
        const searchResultsGrid = searchSection.querySelector('#searchResultsGrid');
        
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase().trim();
            
            if (searchTerm.length > 0) {
                // Show search results section
                searchSection.classList.remove('hidden');
                
                // Filter games based on search term
                const searchResults = allGames.filter(game => 
                    game.title.toLowerCase().includes(searchTerm) || 
                    game.description.toLowerCase().includes(searchTerm) ||
                    (game.creator && game.creator.toLowerCase().includes(searchTerm))
                );
                
                // Clear previous results
                searchResultsGrid.innerHTML = '';
                
                if (searchResults.length === 0) {
                    searchResultsGrid.innerHTML = '<div class="no-results">No games found matching your search</div>';
                } else {
                    searchResults.forEach(game => {
                        const gameCard = createGameCard(game.id, game.title, game.description, game.thumbnail, game.creator, game.featured);
                        searchResultsGrid.appendChild(gameCard);
                    });
                }
                
                // Hide other sections
                document.querySelectorAll('main > section:not(.search-results)').forEach(section => {
                    section.classList.add('hidden');
                });
            } else {
                // Hide search results section and show other sections
                searchSection.classList.add('hidden');
                document.querySelectorAll('main > section:not(.search-results)').forEach(section => {
                    section.classList.remove('hidden');
                });
            }
        });
    }
    
    // Handle app cards click
    document.querySelectorAll('.app-card').forEach(appCard => {
        appCard.addEventListener('mouseenter', Audio.playButtonSound);
        appCard.addEventListener('click', () => {
            Audio.playClickSound();
            const appId = appCard.getAttribute('data-app');
            
            if (appId === 'blog-app') {
                loadBlog();
            }
        });
    });
    
    // Load blog content
    function loadBlog() {
        fetch('blog-drafterplus.html')
            .then(response => response.text())
            .then(html => {
                // Extract blog content
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const blogContainer = doc.querySelector('.blog-container');
                
                if (blogContainer) {
                    // Clear and populate blog overlay
                    blogOverlay.innerHTML = '';
                    
                    // Add close button
                    const closeButton = document.createElement('button');
                    closeButton.className = 'close-blog-button';
                    closeButton.innerHTML = '<i class="fas fa-times"></i>';
                    closeButton.addEventListener('click', () => {
                        Audio.playClickSound();
                        blogOverlay.style.display = 'none';
                    });
                    
                    // Fix scrolling - make sure content is properly shown as one page
                    const blogContent = blogContainer.querySelector('.blog-content');
                    if (blogContent) {
                        // Remove any height restrictions
                        blogContent.style.maxHeight = 'none';
                        blogContent.style.overflow = 'visible';
                    }
                    
                    blogContainer.appendChild(closeButton);
                    blogOverlay.appendChild(blogContainer);
                    blogOverlay.style.display = 'block';
                    
                    // Scroll to top when opening blog
                    blogOverlay.scrollTop = 0;
                }
            })
            .catch(error => console.error('Error loading blog:', error));
    }
    
    // Hover sound for interactive elements
    document.querySelectorAll('.icon-button, .control-button').forEach(button => {
        button.addEventListener('mouseenter', Audio.playButtonSound);
    });
    
    // Initialize audio on first interaction
    document.addEventListener('click', Audio.initAudio, { once: true });
});