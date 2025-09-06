// Major scale intervals in semitones from the root
const majorScaleSteps = {
    'prime': 0,
    'sekunde': 2,    // Major Second
    'terz': 4,       // Major Third
    'quarte': 5,     // Perfect Fourth
    'quinte': 7,     // Perfect Fifth
    'sexte': 9,      // Major Sixth
    'septime': 11,   // Major Seventh
    'oktave': 12     // Perfect Octave
};

export const intervalNames = Object.keys(majorScaleSteps);

/**
 * Generates the notes for each interval in a major scale based on a root note.
 * @param {string} rootNote - The root note of the scale (e.g., 'A4', 'C4').
 * @returns {Object} - An object mapping interval names to an array of two notes.
 */
export function generateScaleIntervals(rootNote) {
    const intervals = {};
    const root = Tone.Frequency(rootNote);

    for (const name in majorScaleSteps) {
        const semitones = majorScaleSteps[name];
        // The second note is transposed up from the root.
        const secondNote = root.transpose(semitones).toNote();
        intervals[name] = [rootNote, secondNote];
    }
    return intervals;
}