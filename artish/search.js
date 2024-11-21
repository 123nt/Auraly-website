let currentAudio = null;
let isDragging = false;
let audioElements = new Map();
let currentlyPlaying = null;
let currentlyPlayingSong = null;

const searchInput = document.getElementById('searchInput');
const searchButton = document.querySelector('.search-button');
const searchResults = document.getElementById('searchResults');
const bgContainer = document.querySelector('.background-image-container');

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
searchInput.addEventListener('input', (e) => performSearch(e.target.value));
searchButton.addEventListener('click', () => performSearch(searchInput.value));
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch(searchInput.value);
});

function displayResults(songs) {
    if (!songs || songs.length === 0) {
        searchResults.innerHTML = '<p>No results found.</p>';
        return;
    }

    searchResults.innerHTML = '';
    songs.forEach(song => {
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
                <div class="progress-bar">
                    <div class="progress" style="width: 0%"></div>
                </div>
            </div>
        </div>
    `;

    songElement.addEventListener('click', (e) => {
        if (!e.target.closest('.progress-bar')) {
            togglePlay(songElement);
        }
    });

    const progressBar = songElement.querySelector('.progress-bar');
    progressBar.addEventListener('mousedown', (e) => {
        if (currentlyPlaying && currentlyPlayingSong === songElement) {
            e.stopPropagation();
            isDragging = true;
            updateProgress(e, progressBar);
        }
    });

    return songElement;
}

function updateProgress(e, progressBar) {
    const rect = progressBar.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    if (currentlyPlaying) {
        currentlyPlaying.currentTime = percentage * currentlyPlaying.duration;
        const progress = progressBar.querySelector('.progress');
        progress.style.width = `${percentage * 100}%`;
    }
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

function togglePlay(songElement) {
    const songId = songElement.getAttribute('data-song-id');
    const audioUrl = songElement.getAttribute('data-audio-url');
    const audio = audioElements.get(songId) || createAudioElement(songId, audioUrl);
    const progressContainer = songElement.querySelector('.progress-container');
    
    if (imageUrl = songElement.getAttribute('data-image-url')) {
        bgContainer.style.backgroundImage = `url('${imageUrl}')`;
        bgContainer.classList.add('background-image-active');
    }

    if (currentlyPlaying === audio) {
        if (audio.paused) {
            audio.play().catch(console.error);
            songElement.classList.add('zoom');
            progressContainer.style.display = 'block';
        } else {
            audio.pause();
            songElement.classList.remove('zoom');
            progressContainer.style.display = 'none';
        }
        return;
    }

    if (currentlyPlaying) {
        currentlyPlaying.pause();
        if (currentlyPlayingSong) {
            currentlyPlayingSong.classList.remove('zoom');
            const prevProgress = currentlyPlayingSong.querySelector('.progress-container');
            if (prevProgress) prevProgress.style.display = 'none';
        }
    }

    audio.currentTime = 0;
    audio.play().catch(console.error);
    songElement.classList.add('zoom');
    progressContainer.style.display = 'block';
    currentlyPlaying = audio;
    currentlyPlayingSong = songElement;

    const progress = songElement.querySelector('.progress');
    const updateProgressBar = () => {
        if (!isDragging && audio) {
            progress.style.width = `${(audio.currentTime / audio.duration) * 100}%`;
        }
    };

    audio.removeEventListener('timeupdate', updateProgressBar);
    audio.addEventListener('timeupdate', updateProgressBar);
}

document.addEventListener('mousemove', (e) => {
    if (isDragging && currentlyPlaying && currentlyPlayingSong) {
        const progressBar = currentlyPlayingSong.querySelector('.progress-bar');
        updateProgress(e, progressBar);
    }
});

document.addEventListener('mouseup', () => isDragging = false);

// Space bar control
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !e.target.matches('input')) {
        e.preventDefault();
        if (currentlyPlaying) {
            if (currentlyPlaying.paused) {
                currentlyPlaying.play().catch(console.error);
                currentlyPlayingSong.classList.add('zoom');
            } else {
                currentlyPlaying.pause();
                currentlyPlayingSong.classList.remove('zoom');
            }
        }
    }
});
