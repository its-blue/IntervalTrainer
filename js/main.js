import { generateScaleIntervals, intervalNames, majorScaleSteps } from './config.js';
import { initAudio, playInterval } from './audio.js';
import { elements, updateScore, setFeedback, setPlayButtonState, updateTitle } from './ui.js';

// --- State ---
let currentInterval = null;
let correctCount = 0;
let wrongCount = 0;
let currentMode = 'standard';
let audioInitialized = false;
let currentScale = 'A4'; // Default scale root note
let currentDirection = 'up'; // 'up', 'down', or 'mixed'
let activeIntervals = {}; // Will hold the intervals for the current scale

// --- Game Logic ---
function generateRandomInterval() {
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

function setScale(scaleRoot) {
    currentScale = scaleRoot;
    activeIntervals = generateScaleIntervals(currentScale);
    
    const selectedOption = elements.scaleSelect.querySelector(`option[value="${scaleRoot}"]`);
    const displayName = selectedOption ? selectedOption.textContent : "Unbekannt";
    updateTitle(displayName);
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

        // NEUE LOGIK: Bestimme die Noten basierend auf der Richtung
        let direction = currentDirection;
        if (direction === 'mixed') {
            direction = Math.random() < 0.5 ? 'up' : 'down';
        }

        let notesToPlay;
        const rootNote = currentScale;

        if (direction === 'up') {
            notesToPlay = activeIntervals[currentInterval];
        } else { // direction ist 'down'
            const semitones = majorScaleSteps[currentInterval];
            const root = Tone.Frequency(rootNote);
            const secondNote = root.transpose(-semitones).toNote();
            notesToPlay = [rootNote, secondNote];
        }

        await playInterval(notesToPlay);

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
    elements.scaleSelect.value = currentScale;
    elements.directionSelect.value = currentDirection; // Aktuellen Wert im Dropdown setzen
    
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
    // Modus speichern
    const selectedMode = document.querySelector('input[name="mode"]:checked').value;
    currentMode = selectedMode;
    elements.currentModeLabel.textContent = currentMode === 'standard' ? 'Standardmodus' : 'Fokussierter Modus';

    // Tonart speichern
    const selectedScale = elements.scaleSelect.value;
    setScale(selectedScale);

    // Richtung speichern
    currentDirection = elements.directionSelect.value;

    closeModal();
}

// --- Initialization ---
function initialize() {
    setScale(currentScale); // Generate intervals for the default scale on load
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