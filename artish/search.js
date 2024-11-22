let currentAudio = null;
let isDragging = false;
let audioElements = new Map();
let currentlyPlaying = null;
let currentlyPlayingSong = null;

const searchInput = document.getElementById('searchInput');
const searchButton = document.querySelector('.search-button');
const searchResults = document.getElementById('searchResults');
const bgContainer = document.querySelector('.background-image-container');
const clearSearchButton = document.getElementById('clearSearch');

// Search function
async function performSearch(query) {
    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    try {
        const response = await fetch(`https://deezerdevs-deezer.p.rapidapi.com/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'X-RapidAPI-Key': '903be63565mshedcf652879b28c0p126a8cjsnd125834c310b',
                'X-RapidAPI-Host': 'deezerdevs-deezer.p.rapidapi.com'
            }
        });

        const data = await response.json();
        displayResults(data.data);
    } catch (error) {
        console.error('Error:', error);
        searchResults.innerHTML = '<p>Error fetching results. Please try again.</p>';
    }
}

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounced search function
const debouncedSearch = debounce(performSearch, 300);

// Attach search events
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    if (query) {
        clearSearchButton.style.display = 'block';
        debouncedSearch(query);
    } else {
        clearSearchButton.style.display = 'none';
        searchResults.innerHTML = '';
    }
});

clearSearchButton.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchButton.style.display = 'none';
    searchResults.innerHTML = '';
});

// Remove the old search button event listener since we're doing real-time search
searchButton.removeEventListener('click', () => performSearch(searchInput.value));
searchButton.addEventListener('click', () => performSearch(searchInput.value.trim()));

function displayResults(songs) {
    if (!songs || songs.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
    }

    searchResults.innerHTML = '';
    songs.forEach((song, index) => {
        const songElement = createSongElement(song);
        songElement.style.setProperty('--animation-order', index);
        searchResults.appendChild(songElement);
    });
}

function createSongElement(song) {
    const songElement = document.createElement('div');
    songElement.className = 'song';
    songElement.setAttribute('data-song-id', song.id);
    songElement.setAttribute('data-audio-url', song.preview);
    songElement.setAttribute('data-image-url', song.album.cover_xl);

    songElement.innerHTML = `
        <img src="${song.album.cover_medium}" alt="${song.title}">
        <div class="song-details">
            <div class="song-title">${song.title}</div>
            <div class="song-artist">${song.artist.name}</div>
        </div>
    `;

    songElement.addEventListener('click', (e) => {
        if (!e.target.closest('.progress-bar')) {
            togglePlay(songElement);
        }
    });

    return songElement;
}

function togglePlay(songElement) {
    const songId = songElement.getAttribute('data-song-id');
    const audioUrl = songElement.getAttribute('data-audio-url');
    const audio = audioElements.get(songId) || createAudioElement(songId, audioUrl);
    
    if (imageUrl = songElement.getAttribute('data-image-url')) {
        bgContainer.style.backgroundImage = `url('${imageUrl}')`;
        bgContainer.classList.add('background-image-active');
    }

    if (currentlyPlaying === audio) {
        if (audio.paused) {
            audio.play().catch(console.error);
            songElement.classList.remove('paused');
            songElement.classList.add('playing');
        } else {
            audio.pause();
            songElement.classList.add('paused');
            setTimeout(() => {
                songElement.classList.remove('playing', 'paused');
            }, 500);
        }
        return;
    }

    if (currentlyPlaying) {
        currentlyPlaying.pause();
        if (currentlyPlayingSong) {
            currentlyPlayingSong.classList.add('paused');
            setTimeout(() => {
                currentlyPlayingSong.classList.remove('playing', 'paused');
            }, 500);
        }
    }

    audio.currentTime = 0;
    audio.play().catch(console.error);
    songElement.classList.add('playing');
    songElement.classList.remove('paused');
    currentlyPlaying = audio;
    currentlyPlayingSong = songElement;
}

// Space bar control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault();
        if (currentlyPlaying) {
            if (currentlyPlaying.paused) {
                currentlyPlaying.play();
                if (currentlyPlayingSong) {
                    currentlyPlayingSong.classList.remove('paused');
                    currentlyPlayingSong.classList.add('playing');
                }
            } else {
                currentlyPlaying.pause();
                if (currentlyPlayingSong) {
                    currentlyPlayingSong.classList.add('paused');
                }
            }
        }
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function createAudioElement(songId, audioUrl) {
    const audio = new Audio(audioUrl);
    audio.addEventListener('ended', () => {
        const currentSongElement = document.querySelector(`[data-song-id="${songId}"]`);
        const nextSong = currentSongElement.nextElementSibling;
        if (nextSong && nextSong.classList.contains('song')) {
            togglePlay(nextSong);
        }
    });
    audioElements.set(songId, audio);
    return audio;
}

function playSong(title, artist, albumCover, previewUrl, songData) {
    currentSongData = songData;
    
    let bottomPlayer = document.querySelector('.bottom-player');
    if (!bottomPlayer) {
        bottomPlayer = document.createElement('div');
        bottomPlayer.id = 'bottomPlayer';
        bottomPlayer.className = 'bottom-player';
        bottomPlayer.innerHTML = `
            <img src="${albumCover}" alt="${title}" class="album-cover">
            <div class="song-info">
                <div class="song-title">${title}</div>
                <div class="song-artist">${artist}</div>
            </div>
            <button class="play-pause-btn">
                <i class="fas fa-play"></i>
            </button>
        `;
        document.body.appendChild(bottomPlayer);

        const playPauseBtn = bottomPlayer.querySelector('.play-pause-btn');
        playPauseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.audio) {
                if (window.audio.paused) {
                    window.audio.play();
                    playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
                } else {
                    window.audio.pause();
                    playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
                }
            }
        });

        bottomPlayer.addEventListener('click', function(e) {
            if (e.target.closest('.play-pause-btn')) {
                return;
            }

            const sidebar = document.getElementById('sidebar');

            if (!sidebar.classList.contains('active')) {
                const bottomPlayerColor = window.getComputedStyle(bottomPlayer).backgroundColor;
                sidebar.style.background = bottomPlayerColor;
                sidebar.style.transform = '';
                sidebar.classList.add('active');
                bottomPlayer.classList.add('sidebar-active');
            }

            e.stopPropagation();
        });
    } else {
        bottomPlayer.querySelector('img').src = albumCover;
        bottomPlayer.querySelector('.song-title').textContent = title;
        bottomPlayer.querySelector('.song-artist').textContent = artist;
    }

    if (window.audio) {
        window.audio.pause();
    }
    window.audio = new Audio(previewUrl);
    window.audio.addEventListener('ended', () => {
        const playPauseBtn = document.querySelector('.play-pause-btn i');
        playPauseBtn.className = 'fas fa-play';
    });

    setTimeout(() => {
        bottomPlayer.classList.add('active');
    }, 100);
}

function handleSongClick(songId) {
    const songElement = document.getElementById(songId);
    const songTitle = songElement.querySelector('.song-title').textContent;
    const songArtist = songElement.querySelector('.song-artist').textContent;
    const albumCover = songElement.querySelector('img').src;
    const bottomPlayer = document.getElementById('bottomPlayer');
    const sidebar = document.getElementById('sidebar');

    const computedStyle = window.getComputedStyle(songElement);
    const backgroundColor = computedStyle.backgroundColor;
    
    const moreOpaqueColor = backgroundColor.replace('0.3', '0.95');
    bottomPlayer.style.background = moreOpaqueColor;
    sidebar.style.background = moreOpaqueColor;
    
    document.getElementById('playerSongTitle').textContent = songTitle;
    document.getElementById('playerArtist').textContent = songArtist;
    document.getElementById('playerAlbumCover').src = albumCover;
    
    if (currentlyPlayingSong) {
        currentlyPlayingSong.classList.remove('playing');
    }
    songElement.classList.add('playing');
    currentlyPlayingSong = songElement;
    
    bottomPlayer.classList.add('active');
    updatePlayPauseButton();
}

document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const bottomPlayer = document.getElementById('bottomPlayer');

    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !bottomPlayer.contains(e.target)) {
        sidebar.classList.remove('active');
        bottomPlayer.classList.remove('sidebar-active');
        sidebar.style.transform = '';
    }
});

document.getElementById('bottomPlayer').addEventListener('touchmove', function(e) {
    e.preventDefault();
});

// Add scroll event listener to minimize sidebar
let lastScrollTop = 0;
let isScrolling;

window.addEventListener('scroll', function() {
    const sidebar = document.getElementById('sidebar');
    const bottomPlayer = document.getElementById('bottomPlayer');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;

    // Clear the timeout
    window.clearTimeout(isScrolling);

    if (sidebar.classList.contains('active')) {
        if (currentScroll > lastScrollTop) {
            // Scrolling down
            sidebar.style.transform = `translateX(-50%) translateY(${Math.min(100, (currentScroll - lastScrollTop) / 2)}%)`;
            
            // Set a timeout to close the sidebar after scrolling stops
            isScrolling = setTimeout(() => {
                sidebar.classList.remove('active');
                bottomPlayer.classList.remove('sidebar-active');
                sidebar.style.transform = '';
            }, 150);
        } else {
            // Scrolling up
            sidebar.style.transform = `translateX(-50%) translateY(0)`;
        }
    }

    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
}, { passive: true });

// Bottom player click handler
document.getElementById('bottomPlayer').addEventListener('click', function(e) {
    if (e.target.closest('.play-pause-btn')) {
        return;
    }

    const sidebar = document.getElementById('sidebar');
    const bottomPlayer = document.getElementById('bottomPlayer');

    if (!sidebar.classList.contains('active')) {
        const bottomPlayerColor = window.getComputedStyle(bottomPlayer).backgroundColor;
        sidebar.style.background = bottomPlayerColor;
        sidebar.style.transform = '';
        sidebar.classList.add('active');
        bottomPlayer.classList.add('sidebar-active');
    }

    e.stopPropagation();
});

// Document click handler for closing sidebar
document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const bottomPlayer = document.getElementById('bottomPlayer');

    if (sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !bottomPlayer.contains(e.target)) {
        sidebar.classList.remove('active');
        bottomPlayer.classList.remove('sidebar-active');
        sidebar.style.transform = '';
    }
});
