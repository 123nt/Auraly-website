let deferredPrompt;
const installBanner = document.getElementById('install-banner');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    
    // Check if user is on mobile
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        // Show the install banner
        if (installBanner) {
            installBanner.style.display = 'block';
        }
    }
});

// Installation button click handler
document.getElementById('install-button')?.addEventListener('click', async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Hide the banner after user makes a choice
    if (installBanner) {
        installBanner.style.display = 'none';
    }

    // Clear the deferredPrompt
    deferredPrompt = null;
});
