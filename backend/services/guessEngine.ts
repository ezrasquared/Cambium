export function evaluateEncounterGuess(
  actualSpecies: string,
  guesses: string[]
) {

  const correct = guesses.includes(actualSpecies);

  if (!correct) {
    return {
      correct: false,
      xp: 0,
      message: "Incorrect identification."
    };
  }

  if (guesses.length === 1) {
    return {
      correct: true,
      xp: 100,
      message: "Perfect identification!"
    };
  }

  return {
    correct: true,
    xp: 50,
    message: "Correct, but multiple guesses made."
  };

}