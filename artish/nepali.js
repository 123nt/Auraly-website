// Image URLs for each song
const backgroundImages = {
  song1: "IMAGE/download.gif",
  song2: "IMAGE/1e2dc86d-2100-4d9e-89e4-129149e346ff.gif",
  song3: "IMAGE/66260834-7429-46f4-b208-765939b36198.gif",
  song4: "IMAGE/dumpster.gif",
  song5: "IMAGE/DOWN.gif",
  song6: "IMAGE/….gif",
  song7: "IMAGE/download (1).gif",
  song8: "IMAGE/Days with dad.gif",
  song9: "IMAGE/83b0013c-3629-4ddd-be0f-67975924393d.gif",
  song10: "IMAGE/Amazing Nostalgic Pixelart Animations by Gerardo Quiroz.gif",
  song11: "IMAGE/07b526ea-9e1f-41fa-b437-9f570940526e.gif",
  song12: "IMAGE/40f06eba-3472-4638-81eb-2b8fdab1dc8b.gif",
  song13: "IMAGE/302f2c5d-beff-40d2-856b-75f7bb39b592.gif",
  song14: "IMAGE/5d09a224-c768-4667-9d0a-3915c15634ad.gif",
  song15: "IMAGE/4475d897-97a2-424e-9acc-c90263da9982.gif",
  song16: "IMAGE/392b7bbf-386f-4c56-bd54-9111075f1a41.gif",
  song17: "IMAGE/7her4ja.gif",
  song18: "IMAGE/country road, take me home.gif",
  song19: "IMAGE/random anime gif i wanted to post _).gif",
  song20: "IMAGE/facts.gif",
  song21: "IMAGE/Mason London.gif",
  // Add more URLs for each song as needed, up to song20
};

let currentlyPlayingAudio = null;
let currentlyPlayingContainer = null;
let isDragging = false; // Flag to track if the user is dragging the progress bar

function togglePlay(songId) {
  const bgContainer = document.getElementById("backgroundImage");
  const audio = document.getElementById(`audio${songId.replace("song", "")}`);
  const progressContainer = document.getElementById(songId);

  // Set background image for the selected song
  if (backgroundImages[songId]) {
    bgContainer.style.backgroundImage = `url('${backgroundImages[songId]}')`;
    bgContainer.classList.add("background-image-active");
  }

  // Pause the current song if another one is clicked
  if (currentlyPlayingAudio && currentlyPlayingAudio !== audio) {
    currentlyPlayingAudio.pause();
    if (!isDragging) currentlyPlayingContainer.style.display = "none"; // Hide previous song's progress only if not dragging
  }

  // Toggle play/pause of the selected song
  if (currentlyPlayingAudio === audio) {
    audio.pause();
    currentlyPlayingAudio = null;
    if (!isDragging) currentlyPlayingContainer.style.display = "none"; // Hide progress bar only if not dragging
    currentlyPlayingContainer = null;
  } else {
    audio.play();
    progressContainer.style.display = "block"; // Show the progress bar when playing
    currentlyPlayingAudio = audio;
    currentlyPlayingContainer = progressContainer;
    updateProgress(audio, songId);
  }

  // When the song ends, play the next song automatically
  audio.addEventListener("ended", () => {
    currentlyPlayingAudio = null;
    if (!isDragging) currentlyPlayingContainer.style.display = "none"; // Hide only if not dragging
    const nextSongId = getNextSongId(songId);
    if (nextSongId) {
      setTimeout(() => togglePlay(nextSongId), 2000); // Auto-play next song after 2 seconds
    }
  });
}

function getNextSongId(currentSongId) {
  const currentIndex = parseInt(currentSongId.replace("song", ""));
  const nextIndex = currentIndex + 1;
  return nextIndex <= 20 ? `song${nextIndex}` : null;
}

function updateProgress(audio, songId) {
  const progress = document.getElementById(
    `progress${songId.replace("song", "")}`
  );
  const durationLabel = document.getElementById(
    `duration${songId.replace("song", "")}`
  );

  // Update progress and time display
  audio.addEventListener("timeupdate", () => {
    if (!isDragging) {
      // Update progress only if not dragging
      const duration = audio.duration || 0;
      const currentTime = audio.currentTime || 0;
      const progressValue = (currentTime / duration) * 100;
      progress.value = progressValue;

      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60)
        .toString()
        .padStart(2, "0");
      durationLabel.textContent = `${minutes}:${seconds}`;
    }
  });

  // Set flag when dragging starts
  progress.addEventListener("mousedown", () => {
    isDragging = true;
  });

  // Allow user to seek by clicking on the progress bar
  progress.addEventListener("input", (event) => {
    const newTime = (event.target.value / 100) * audio.duration;
    audio.currentTime = newTime;
  });

  // Reset flag when dragging stops
  progress.addEventListener("mouseup", () => {
    isDragging = false;
  });
}
