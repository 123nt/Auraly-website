// Image URLs for each song
const backgroundImages = {
  song1: "uk photo/Memories Of Dying (1).gif",
  song2: "uk photo/8b66b880-ea1a-406a-bb57-53e6edc42f67.gif",
  song3: "uk photo/⁂ (1).gif",
  song4: "uk photo/❯ Motion _ Are_na.gif",
  song5: "uk photo/9a36151e-3748-4462-8ff0-56796fdbb865.jfif",
  song6: "uk photo/195cc269-f457-443c-8196-601a9bbe47cf.gif",
  song7: "uk photo/933d0a0b-d88d-44ae-a478-f756d75f51f6.gif",
  song8: "uk photo/4492e9ad-2cfd-42b3-bf66-5d3341e1b391.gif",
  song9: "uk photo/7187fafa-3e33-4832-95b0-bfdee712053a.gif",
  song10: "uk photo/09805cea-4def-4141-8236-618f96c11f66.gif",
  song11: "uk photo/464465ac-4a3a-4bd1-9d16-1bb23917165f.gif",
  song12: "uk photo/A Day in Santa Fe, 1931.gif",
  song13: "uk photo/ab1d3643-2f89-4db1-be83-bd0d4106afbc.gif",
  song14: "uk photo/c94f5aee-215c-4324-b063-679743356aea.gif",
  song15: "uk photo/caa557ff-0d54-4509-9ffc-c3677b23de00.gif",
  song16: "uk photo/Cut — TraceLoops.gif",
  song17: "uk photo/f0482f47-4101-47f9-94a8-bbd18219d5d7.gif",
  song18: "uk photo/Hey Arnold.gif",
  song19: "uk photo/Illustrations 2017.gif",
  song20: "uk photo/paradoxe.gif",
  song21: "uk photo/SwampThingy.gif",
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
