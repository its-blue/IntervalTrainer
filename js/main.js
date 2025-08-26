import { intervals } from './config.js';
import { initAudio, playInterval } from './audio.js';
import { elements, updateScore, setFeedback, setPlayButtonState } from './ui.js';

// --- State ---
let currentInterval = null;
let correctCount = 0;
let wrongCount = 0;
let currentMode = 'standard';
let audioInitialized = false;

// --- Game Logic ---
function generateRandomInterval() {
    const intervalNames = Object.keys(intervals);
    if (currentMode === 'focused') {
        const focused = ['terz', 'quarte', 'quinte', 'sexte'];
        const others = intervalNames.filter(i => !focused.includes(i));
        // 65% chance for a focused interval
        if (Math.random() < 0.65) {
            return focused[Math.floor(Math.random() * focused.length)];
        } else {
            return others[Math.floor(Math.random() * others.length)];
        }
    }
    // Standard mode: equal probability
    return intervalNames[Math.floor(Math.random() * intervalNames.length)];
}

// --- Event Handlers ---
async function handlePlayButtonClick() {
    try {
        setPlayButtonState('loading', 'Lade...');
        
        if (!audioInitialized) {
            await initAudio();
            audioInitialized = true;
        }

        setFeedback('');
        if (currentInterval === null) {
            currentInterval = generateRandomInterval();
        }

        setPlayButtonState('loading', 'Spiele...');
        await playInterval(currentInterval);

    } catch (error) {
        console.error('Error playing interval:', error);
        setFeedback('Fehler beim Abspielen. Bitte erneut versuchen.');
    } finally {
        setPlayButtonState('enabled');
    }
}

function handleAnswerButtonClick(event) {
    if (!currentInterval) {
        setFeedback('Bitte zuerst ein Intervall abspielen!');
        return;
    }
    
    const selectedInterval = event.target.getAttribute('data-interval');
    
    if (selectedInterval === currentInterval) {
        setFeedback('Richtig!');
        correctCount++;
    } else {
        const name = currentInterval.charAt(0).toUpperCase() + currentInterval.slice(1);
        setFeedback(`Falsch! Das war eine ${name}.`);
        wrongCount++;
    }
    
    updateScore(correctCount, wrongCount);
    currentInterval = null; // Reset for the next round
}

// --- Modal Logic ---
function openModal() {
    elements.modeStandard.checked = currentMode === 'standard';
    elements.modeFocused.checked = currentMode === 'focused';
    
    elements.settingsModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    elements.dialogCard.classList.add('scale-95');
    setTimeout(() => elements.dialogCard.classList.remove('scale-95'), 10);
    
    elements.modeStandard.focus();
}

function closeModal() {
    elements.settingsModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
}

function handleSaveSettings() {
    const selected = document.querySelector('input[name="mode"]:checked').value;
    currentMode = selected;
    elements.currentModeLabel.textContent = currentMode === 'standard' ? 'Standardmodus' : 'Fokussierter Modus';
    closeModal();
}

// --- Initialization ---
function initialize() {
    updateScore(correctCount, wrongCount);

    elements.playButton.addEventListener('click', handlePlayButtonClick);
    elements.intervalButtons.forEach(button => {
        button.addEventListener('click', handleAnswerButtonClick);
    });

    elements.settingsBtn.addEventListener('click', openModal);
    elements.closeSettings.addEventListener('click', closeModal);
    elements.cancelSettings.addEventListener('click', closeModal);
    elements.saveSettings.addEventListener('click', handleSaveSettings);
    
    elements.settingsModal.addEventListener('click', (e) => {
        if (e.target === elements.settingsModal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (!elements.settingsModal.classList.contains('hidden') && e.key === 'Escape') closeModal();
    });
}

document.addEventListener('DOMContentLoaded', initialize);