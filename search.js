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
        <div class="info-icon">
            <i class="fas fa-info"></i>
        </div>
        <audio id="audio_${song.id}" src="${song.preview}"></audio>
    `;

    // Add event listeners
    const audio = songElement.querySelector('audio');

    // Click event for song
    songElement.addEventListener('click', (e) => {
        if (!e.target.matches('.info-icon, .info-icon *')) {
            togglePlay(song.id, audio, songElement);
            updateBackgroundImage();
        }
    });

    // Info icon click
    const infoIcon = songElement.querySelector('.info-icon');
    if (infoIcon) {
        infoIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            showSongDetails(e, song.title, song.artist.name, song.album.title, song.album.cover_xl);
        });
    }

    return songElement;
}

function togglePlay(songId, audio, songElement) {
    // Remove playing class from all songs
    document.querySelectorAll('.song').forEach(song => {
        if (song !== songElement) {
            song.classList.remove('playing');
        }
    });

    // If there's a currently playing audio that's different from this one, stop it
    if (currentAudio && currentAudio !== audio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentlyPlayingSong) {
            currentlyPlayingSong.classList.remove('playing');
        }
    }

    // Toggle play/pause for the clicked song
    if (currentAudio === audio && !audio.paused) {
        audio.pause();
        songElement.classList.remove('playing');
        currentAudio = null;
        currentlyPlayingSong = null;
    } else {
        audio.play();
        songElement.classList.add('playing');
        currentAudio = audio;
        currentlyPlayingSong = songElement;

        // Add ended event listener for auto-play next song
        audio.addEventListener('ended', () => {
            songElement.classList.remove('playing');
            const nextSong = songElement.nextElementSibling;
            if (nextSong) {
                const nextAudio = nextSong.querySelector('audio');
                setTimeout(() => {
                    togglePlay(nextSong.getAttribute('data-song-id'), nextAudio, nextSong);
                }, 2000);
            }
        });
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

function playSong(title, artist, albumCover, previewUrl, songData) {
    if (currentAudio) {
        currentAudio.pause();
    }

    currentAudio = new Audio(previewUrl);
    currentAudio.volume = 0.5;

    currentAudio.play().catch(error => {
        console.error('Error playing audio:', error);
    });

    if (currentlyPlayingSong) {
        currentlyPlayingSong.classList.remove('playing');
    }
    currentlyPlayingSong = songData;
    if (songData) {
        songData.classList.add('playing');
    }
}

// Show home section on page load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.section').forEach(section => {
        section.style.display = 'none';
    });

    showSection('home');
});
