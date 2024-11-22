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

// Background images for songs
const backgroundImages = {
    1: "IMAGE/download.gif",
    2: "IMAGE/1e2dc86d-2100-4d9e-89e4-129149e346ff.gif",
    3: "IMAGE/66260834-7429-46f4-b208-765939b36198.gif",
    4: "IMAGE/dumpster.gif",
    5: "IMAGE/DOWN.gif",
    6: "IMAGE/….gif",
    7: "IMAGE/download (1).gif",
    8: "IMAGE/Days with dad.gif",
    9: "IMAGE/83b0013c-3629-4ddd-be0f-67975924393d.gif",
    10: "IMAGE/Amazing Nostalgic Pixelart Animations by Gerardo Quiroz.gif",
    11: "IMAGE/07b526ea-9e1f-41fa-b437-9f570940526e.gif",
    12: "IMAGE/40f06eba-3472-4638-81eb-2b8fdab1dc8b.gif",
    13: "IMAGE/302f2c5d-beff-40d2-856b-75f7bb39b592.gif",
    14: "IMAGE/5d09a224-c768-4667-9d0a-3915c15634ad.gif",
    15: "IMAGE/4475d897-97a2-424e-9acc-c90263da9982.gif",
    16: "IMAGE/392b7bbf-386f-4c56-bd54-9111075f1a41.gif",
    17: "IMAGE/7her4ja.gif",
    18: "IMAGE/country road, take me home.gif",
    19: "IMAGE/random anime gif i wanted to post _).gif",
    20: "IMAGE/facts.gif",
    21: "IMAGE/Mason London.gif"
};

let currentSongIndex = 0;

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

        const img = songElement.querySelector('img');
        img.onload = () => {
            const textColor = getAverageColorFromImage(img);
            updateTextColors(songElement, textColor);
        };
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
        <div class="progress-container">
            <input type="range" class="progress-bar" value="0" min="0" max="100">
            <span class="duration-label">0:00</span>
        </div>
    `;

    songElement.addEventListener('click', (e) => {
        if (!e.target.matches('input[type="range"]')) {
            togglePlay(songElement);
        }
    });

    return songElement;
}

function getAverageColorFromImage(imgElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const width = imgElement.naturalWidth || imgElement.width;
    const height = imgElement.naturalHeight || imgElement.height;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(imgElement, 0, 0);

    const imageData = context.getImageData(0, 0, width, height).data;
    let r = 0, g = 0, b = 0;
    const pixelCount = imageData.length / 4;

    for (let i = 0; i < imageData.length; i += 4) {
        r += imageData[i];
        g += imageData[i + 1];
        b += imageData[i + 2];
    }

    r = Math.floor(r / pixelCount);
    g = Math.floor(g / pixelCount);
    b = Math.floor(b / pixelCount);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128 ? '#ffffff' : '#000000';
}

function updateTextColors(songElement, textColor) {
    const titleElement = songElement.querySelector('.song-title');
    const artistElement = songElement.querySelector('.song-artist');
    
    if (titleElement) {
        titleElement.style.color = textColor;
        titleElement.style.textShadow = textColor === '#ffffff' ? 
            '0 1px 2px rgba(0, 0, 0, 0.5)' : 
            '0 1px 2px rgba(255, 255, 255, 0.5)';
    }
    
    if (artistElement) {
        artistElement.style.color = textColor === '#ffffff' ? 
            'rgba(255, 255, 255, 0.8)' : 
            'rgba(0, 0, 0, 0.8)';
    }
}

function updateBackgroundImage() {
    currentSongIndex = (currentSongIndex % 21) + 1;
    const backgroundImage = backgroundImages[currentSongIndex];
    if (backgroundImage) {
        bgContainer.style.backgroundImage = `url('${backgroundImage}')`;
        bgContainer.classList.add('background-image-active');
    }
}

function togglePlay(songElement) {
    const songId = songElement.getAttribute('data-song-id');
    const audioUrl = songElement.getAttribute('data-audio-url');
    const audio = audioElements.get(songId) || createAudioElement(songId, audioUrl);
    const progressBar = songElement.querySelector('.progress-bar');
    const durationLabel = songElement.querySelector('.duration-label');

    // Handle currently playing audio
    if (currentlyPlaying && currentlyPlaying !== audio) {
        currentlyPlaying.pause();
        if (currentlyPlayingSong) {
            currentlyPlayingSong.classList.remove('playing');
        }
    }

    if (audio.paused) {
        // Start playing new song
        audio.play();
        songElement.classList.add('playing');
        currentlyPlaying = audio;
        currentlyPlayingSong = songElement;
        updateBackgroundImage();

        // Show progress bar
        if (progressBar) {
            progressBar.style.display = 'block';
        }
    } else {
        // Pause current song
        audio.pause();
        songElement.classList.remove('playing');
        currentlyPlaying = null;
        currentlyPlayingSong = null;

        // Hide progress bar if not dragging
        if (progressBar && !isDragging) {
            progressBar.style.display = 'none';
        }
    }

    // Set up progress bar events
    if (progressBar) {
        progressBar.addEventListener('mousedown', () => {
            isDragging = true;
        });

        progressBar.addEventListener('input', (e) => {
            const newTime = (e.target.value / 100) * audio.duration;
            audio.currentTime = newTime;
        });

        progressBar.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }
}

function createAudioElement(songId, audioUrl) {
    const audio = new Audio(audioUrl);

    // Add ended event listener
    audio.addEventListener('ended', () => {
        const currentSongElement = document.querySelector(`[data-song-id="${songId}"]`);
        const nextSong = currentSongElement.nextElementSibling;

        if (nextSong && nextSong.classList.contains('song')) {
            setTimeout(() => {
                togglePlay(nextSong);
            }, 2000); // 2 second delay before next song
        }
    });

    // Add timeupdate event listener
    audio.addEventListener('timeupdate', () => {
        if (audio === currentlyPlaying && !isDragging) {
            const progress = (audio.currentTime / audio.duration) * 100;
            const progressBar = currentlyPlayingSong.querySelector('.progress-bar');
            const durationLabel = currentlyPlayingSong.querySelector('.duration-label');

            if (progressBar) {
                progressBar.value = progress;
            }

            if (durationLabel) {
                const minutes = Math.floor(audio.currentTime / 60);
                const seconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
                durationLabel.textContent = `${minutes}:${seconds}`;
            }
        }
    });

    audioElements.set(songId, audio);
    return audio;
}

// Space bar control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault();
        if (currentlyPlayingSong) {
            togglePlay(currentlyPlayingSong);
        }
    }
});

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
