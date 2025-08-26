// Caching DOM elements for export
export const elements = {
    correct: document.getElementById('correct'),
    wrong: document.getElementById('wrong'),
    feedback: document.getElementById('feedback'),
    playButton: document.getElementById('playButton'),
    playBtnLabel: document.getElementById('playBtnLabel'),
    intervalButtons: document.querySelectorAll('.interval-button'),
    
    // Modal elements
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    dialogCard: document.querySelector('#settingsModal div[role="dialog"]'),
    closeSettings: document.getElementById('closeSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    saveSettings: document.getElementById('saveSettings'),
    currentModeLabel: document.getElementById('currentModeLabel'),
    modeStandard: document.getElementById('modeStandard'),
    modeFocused: document.getElementById('modeFocused'),
};

export function updateScore(correct, wrong) {
    elements.correct.textContent = correct;
    elements.wrong.textContent = wrong;
}

export function setFeedback(message) {
    elements.feedback.textContent = message;
}

export function setPlayButtonState(state, text) {
    const defaultText = 'Intervall abspielen';
    elements.playBtnLabel.textContent = text || defaultText;
    elements.playButton.disabled = (state === 'disabled' || state === 'loading');
}