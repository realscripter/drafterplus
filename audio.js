import { AUDIO_SETTINGS } from './config.js';

// Create audio context
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let isMuted = AUDIO_SETTINGS.isMuted;

// Create hover sound
function createHoverSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(AUDIO_SETTINGS.buttonHoverVolume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);
}

// Create click sound
function createClickSound() {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    oscillator.frequency.linearRampToValueAtTime(300, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(AUDIO_SETTINGS.buttonClickVolume, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
}

// Background music iframe control
let backgroundMusicIframe = null;
let soundCloudWidget = null;

// Play button hover sound
export function playButtonSound() {
    if (!isMuted && audioContext.state === 'running') {
        createHoverSound();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Play button click sound
export function playClickSound() {
    if (!isMuted && audioContext.state === 'running') {
        createClickSound();
    } else if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Set volume from settings panel
export function setVolume(volume) {
    AUDIO_SETTINGS.buttonHoverVolume = volume;
    AUDIO_SETTINGS.buttonClickVolume = volume * 1.5;
    return Math.round(volume * 100);
}

// Set background music volume
export function setBackgroundMusicVolume(volume) {
    AUDIO_SETTINGS.backgroundMusicVolume = volume;
    updateBackgroundMusicVolume();
    return Math.round(volume * 100);
}

// Update background music volume
function updateBackgroundMusicVolume() {
    if (soundCloudWidget) {
        soundCloudWidget.setVolume(AUDIO_SETTINGS.backgroundMusicVolume * 100);
    }
}

// Initialize background music
export function initBackgroundMusic(iframeElement) {
    backgroundMusicIframe = iframeElement;
    
    // Wait for SC Widget API to load
    if (window.SC && window.SC.Widget) {
        soundCloudWidget = SC.Widget(backgroundMusicIframe);
        updateBackgroundMusicVolume();
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => {
                if (window.SC && window.SC.Widget) {
                    soundCloudWidget = SC.Widget(backgroundMusicIframe);
                    updateBackgroundMusicVolume();
                }
            }, 1000);
        });
    }
}

// Toggle mute function
export function toggleMute() {
    isMuted = !isMuted;
    AUDIO_SETTINGS.isMuted = isMuted;
    
    if (soundCloudWidget) {
        if (isMuted) {
            soundCloudWidget.pause();
        } else {
            soundCloudWidget.play();
        }
    }
    
    return isMuted;
}

// Toggle game mute function
export function toggleGameMute() {
    AUDIO_SETTINGS.isGameMuted = !AUDIO_SETTINGS.isGameMuted;
    return AUDIO_SETTINGS.isGameMuted;
}

// Initialize audio on first interaction
export function initAudio() {
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}