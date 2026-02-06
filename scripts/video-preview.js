// ====================
// VIDEO PREVIEW LOGIC
// ====================

const video = document.getElementById('szakdogaVideo');
const gifPreview = document.querySelector('.video-gif-preview');
const projectPreview = document.querySelector('.project-preview');
const playButton = document.querySelector('.video-play-button');

if (video && gifPreview && projectPreview && playButton) {
    let hasStarted = false;

    video.addEventListener('play', () => {
        hasStarted = true;
        video.setAttribute('controls', 'controls');
        gifPreview.classList.remove('active');
        gifPreview.style.opacity = '0';
        playButton.classList.add('hidden');
    });

    video.addEventListener('ended', () => {
        hasStarted = false;
        video.removeAttribute('controls');
        video.currentTime = 0;
        video.load(); // Reload to show poster
        playButton.classList.remove('hidden');
    });

    projectPreview.addEventListener('mouseenter', () => {
        if (!hasStarted) {
            gifPreview.style.opacity = '1';
            gifPreview.classList.add('active');
        }
    });

    projectPreview.addEventListener('mouseleave', () => {
        if (!hasStarted) {
            gifPreview.style.opacity = '0';
            gifPreview.classList.remove('active');
        }
    });

    // Click on GIF preview or play button to start video
    gifPreview.addEventListener('click', () => {
        if (!hasStarted) {
            video.play();
        }
    });

    playButton.addEventListener('click', () => {
        if (!hasStarted) {
            video.play();
        }
    });
}
