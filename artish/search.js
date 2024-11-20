let currentAudio = null;
let currentSongItem = null;
let isDragging = false;
let audioElements = new Map();
let currentlyPlaying = null;

const searchInput = document.getElementById('searchInput');
const searchButton = document.querySelector('.search-button');
const searchResults = document.getElementById('searchResults');
const bgContainer = document.querySelector('.background-image-container');

// Initialize sidebar
const sidebar = new Sidebar();

// Get search query from URL if present
const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('q');
if (searchQuery) {
    searchInput.value = searchQuery;
    performSearch(searchQuery);
}

// Debounce function
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

// Attach search events
const debouncedSearch = debounce(performSearch, 500);
searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
searchButton.addEventListener('click', () => performSearch(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(searchInput.value);
    }
});

function displayResults(songs) {
    if (!songs || songs.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
    }

    searchResults.innerHTML = '';
    songs.forEach((song, index) => {
        const songItem = createSongElement(song);
        searchResults.appendChild(songItem);
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
            <div class="progress-container">
                <progress class="progress" value="0" max="100"></progress>
            </div>
        </div>
    `;

    songElement.addEventListener('click', () => togglePlay(songElement));
    return songElement;
}

function togglePlay(songElement) {
    const songId = songElement.getAttribute('data-song-id');
    const audioUrl = songElement.getAttribute('data-audio-url');
    const audio = document.querySelector(`#audio-${songId}`) || createAudioElement(songId, audioUrl);
    const progressContainer = songElement.querySelector('.progress-container');
    const bgContainer = document.querySelector('.background-image-container');
    
    // Set background image
    const imageUrl = songElement.getAttribute('data-image-url');
    if (imageUrl) {
        bgContainer.style.backgroundImage = `url('${imageUrl}')`;
        bgContainer.classList.add('background-image-active');
    }

    // If clicking the same song
    if (currentlyPlaying === audio) {
        if (audio.paused) {
            audio.play();
            songElement.classList.add('zoom');
            progressContainer.style.display = 'block';
        } else {
            audio.pause();
            songElement.classList.remove('zoom');
            progressContainer.style.display = 'none';
        }
        return;
    }

    // If playing a different song
    if (currentlyPlaying) {
        currentlyPlaying.pause();
        currentlyPlayingSong.classList.remove('zoom');
        currentlyPlayingSong.querySelector('.progress-container').style.display = 'none';
    }

    // Play new song
    audio.play();
    songElement.classList.add('zoom');
    progressContainer.style.display = 'block';
    currentlyPlaying = audio;
    currentlyPlayingSong = songElement;

    // Update progress
    const progress = songElement.querySelector('.progress');
    audio.addEventListener('timeupdate', () => {
        const value = (audio.currentTime / audio.duration) * 100;
        progress.value = value;
    });

    // Handle song end
    audio.addEventListener('ended', () => {
        songElement.classList.remove('zoom');
        progressContainer.style.display = 'none';
        currentlyPlaying = null;
        currentlyPlayingSong = null;
        
        // Auto-play next song
        const nextSong = songElement.nextElementSibling;
        if (nextSong && nextSong.classList.contains('song')) {
            setTimeout(() => togglePlay(nextSong), 2000);
        }
    });
}

function createAudioElement(songId, audioUrl) {
    const audio = document.createElement('audio');
    audio.id = `audio-${songId}`;
    audio.src = audioUrl;
    document.body.appendChild(audio);
    return audio;
}

// Space bar control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault();
        if (currentlyPlaying) {
            if (currentlyPlaying.paused) {
                currentlyPlaying.play();
                currentlyPlayingSong.classList.add('zoom');
            } else {
                currentlyPlaying.pause();
                currentlyPlayingSong.classList.remove('zoom');
            }
        }
    }
});

// Listen for suggestion clicks
window.addEventListener('play-suggestion', (event) => {
    const songData = event.detail;
    
    // Create a temporary element to hold the song
    const tempElement = document.createElement('div');
    tempElement.innerHTML = createSongElement(songData);
    const songElement = tempElement.firstChild;
    
    // Add it to the results
    document.querySelector('.search-results').appendChild(songElement);
    
    // Play the song
    togglePlay(songElement);
});

// Function to format time
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
}

// Function to update background
function updateBackground(imageUrl) {
    bgContainer.style.backgroundImage = `url('${imageUrl}')`;
    bgContainer.classList.add('background-image-active');
}
