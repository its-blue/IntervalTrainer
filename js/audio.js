
let pianoSampler = null;
let reverb = null; // <-- ADDED: A variable to hold our reverb effect
let isInitialized = false;

// Create a silent audio element to unlock Web Audio on iOS in silent mode.
const silentAudioElement = new Audio("data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV");
silentAudioElement.loop = true;

export async function initAudio() {
    if (isInitialized) return;

    // On the first user interaction, play silent audio to unlock the audio context on iOS.
    try {
        await silentAudioElement.play();
    } catch (e) {
        console.warn("Silent audio playback for iOS fix failed.", e);
    }

    await Tone.start();
    
    // --- START OF CHANGES ---

    // 1. Create the reverb effect and connect it to the main output.
    reverb = new Tone.Reverb({
        decay: 3.5, // The length of the reverb tail
        wet: 0.4    // The mix between the dry and wet (reverb) sound. 0 is all dry, 1 is all wet.
    }).toDestination();

    return new Promise((resolve, reject) => {
        
        pianoSampler = new Tone.Sampler({
            urls: { "A4": "A4.mp3", "C4": "C4.mp3", "D#4": "Ds4.mp3", "F#4": "Fs4.mp3" },
            release: 1,
            baseUrl: "https://tonejs.github.io/audio/salamander/",
            onload: () => {
                isInitialized = true;
                resolve();
            },
            onerror: (error) => {
                reject(error);
            }
        }).connect(reverb); // <-- MODIFIED: Connect the sampler to the reverb instead of the destination
        
        // --- END OF CHANGES ---
    });
}

function playNote(note, duration = 1) {
    if (!pianoSampler) {
        return Promise.reject("Piano sampler not initialized.");
    }
    return new Promise(resolve => {
        pianoSampler.triggerAttackRelease(note, duration);
        setTimeout(resolve, duration * 1000);
    });
}

export async function playInterval(notes) {
    if (!isInitialized) {
        throw new Error("Audio not initialized. Call initAudio first.");
    }
    if (!notes || notes.length < 2) {
        throw new Error("Invalid notes array provided to playInterval.");
    }
    const [firstNote, secondNote] = notes;
    await playNote(firstNote, 1);
    await new Promise(resolve => setTimeout(resolve, 300)); // Pause between notes
    await playNote(secondNote, 1);
}