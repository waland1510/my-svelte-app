<script lang="ts">
  import { translations, type Translation } from './translations';
  import { onMount, createEventDispatcher } from 'svelte';
  import { addRecord, type Record } from '../store';

  const dispatch = createEventDispatcher();

  export let quizType: 'multiplication' | 'division';
  export let language: keyof Translation;

  let currentQuestion = 0;
  let questions: { question: string; answer: number }[] = [];
  let feedback = '';
  let answer: number | null = null;
  let incorrectAnswers = 0;
  let quizCompleted = false;
  let selectedVoice: SpeechSynthesisVoice | null = null;
  let encouragementMessage = ''; // For displaying encouragement messages

  const totalQuestions = 10;
  let startTime: number;
  let timeTaken: number = 0;

  const getRandomNumber = () => Math.floor(Math.random() * 7) + 3;

  const generateQuestion = () => {
    const num1 = getRandomNumber();
    const num2 = getRandomNumber();

    if (quizType === 'multiplication') {
      return { question: `${num1} × ${num2}`, answer: num1 * num2 };
    } else {
      const dividend = num1 * num2;
      return { question: `${dividend} ÷ ${num1}`, answer: num2 };
    }
  };

  const convertToSpokenFormat = (questionText: string): string => {
    const mathTranslations = {
      en: { times: 'times', dividedBy: 'divided by' },
      fr: { times: 'fois', dividedBy: 'divisé par' },
      es: { times: 'por', dividedBy: 'dividido por' },
      uk: { times: 'помножити на', dividedBy: 'поділено на' }
    };

    const currentLangMath = mathTranslations[language as keyof typeof mathTranslations];
    return questionText.replace('×', currentLangMath.times).replace('÷', currentLangMath.dividedBy);
  };

  const getEncouragement = (incorrectAttempts: number): string => {
    const encouragements = {
      en: [
        "🌟 Perfect score! You're a math genius!",
        '🚀 Great job! Almost perfect!',
        '👍 Good effort! Keep practicing!',
        "💪 Don't give up! You'll improve with more practice!"
      ],
      fr: [
        '🌟 Score parfait ! Tu es un génie des maths !',
        '🚀 Super travail ! Presque parfait !',
        '👍 Bon effort ! Continue à pratiquer !',
        "💪 N'abandonne pas ! Tu t'amélioreras avec plus de pratique !"
      ],
      es: [
        '🌟 ¡Puntuación perfecta! ¡Eres un genio de las matemáticas!',
        '🚀 ¡Gran trabajo! ¡Casi perfecto!',
        '👍 ¡Buen esfuerzo! ¡Sigue practicando!',
        '💪 ¡No te rindas! ¡Mejorarás con más práctica!'
      ],
      uk: [
        '🌟 Ідеальний результат! Ти математичний геній!',
        '🚀 Чудова робота! Майже ідеально!',
        '👍 Гарне зусилля! Продовжуй практикуватися!',
        '💪 Не здавайся! Ти покращишся з більшою практикою!'
      ]
    };

    let index;
    if (incorrectAttempts === 0) {
      index = 0;
    } else if (incorrectAttempts <= 2) {
      index = 1;
    } else if (incorrectAttempts <= 5) {
      index = 2;
    } else {
      index = 3;
    }

    return encouragements[language as keyof typeof encouragements][index];
  };

  const saveRecord = () => {
  const record: Record = {
    type: quizType,
    time: timeTaken,
    incorrectAttempts: incorrectAnswers,
    date: new Date().toLocaleDateString()
  };

  // Define keys for both record types
  const multiplicationKey = 'multiplicationQuizRecords';
  const divisionKey = 'divisionQuizRecords';

  // Load existing records from local storage
  const multiplicationRecords: Record[] = JSON.parse(localStorage.getItem(multiplicationKey) || '[]');
  const divisionRecords: Record[] = JSON.parse(localStorage.getItem(divisionKey) || '[]');

  // Add the new record to the appropriate list
  if (quizType === 'multiplication') {
    multiplicationRecords.push(record);
  } else {
    divisionRecords.push(record);
  }

  // Combine both records and sort by time taken (ascending)
  const combinedRecords = [...multiplicationRecords, ...divisionRecords];
  combinedRecords.sort((a, b) => a.time - b.time);

  // Keep only the top 5 records
  const bestRecords = combinedRecords.slice(0, 5);

  // Save the best records back to local storage
  const bestMultiplicationRecords = bestRecords.filter(r => r.type === 'multiplication');
  const bestDivisionRecords = bestRecords.filter(r => r.type === 'division');

  localStorage.setItem(multiplicationKey, JSON.stringify(bestMultiplicationRecords));
  localStorage.setItem(divisionKey, JSON.stringify(bestDivisionRecords));

  // Update the state or store (if applicable)
  addRecord(record);
};

  const nextQuestion = () => {
    if (currentQuestion < totalQuestions) {
      const newQuestion = generateQuestion();
      questions.push(newQuestion);
      feedback = '';
      answer = null;
      currentQuestion++;
      document.querySelector('input')?.focus();
      speakQuestion(newQuestion.question);
    } else {
      quizCompleted = true;
      timeTaken = Math.floor((Date.now() - startTime) / 1000);
      encouragementMessage = getEncouragement(incorrectAnswers); // Get encouragement
      saveRecord();
      speakFeedback(encouragementMessage); // Speak out the encouragement
    }
  };

  const checkAnswer = () => {
    const correctAnswer = questions[currentQuestion - 1]?.answer;

    if (answer === correctAnswer) {
      feedback = translations[language].correct;
      speakFeedback(translations[language].correct);
      setTimeout(() => {
        if (!quizCompleted) nextQuestion();
      }, 500);
    } else {
      feedback = translations[language].incorrect;
      incorrectAnswers++;
      speakFeedback(translations[language].incorrect);
    }
    answer = null;
  };

  const speakFeedback = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && answer !== null) {
      checkAnswer();
    }
  };

  const goBackToSelector = () => {
    dispatch('backToSelector');
  };

  const speakQuestion = (text: string) => {
    const spokenText = convertToSpokenFormat(text);
    const utterance = new SpeechSynthesisUtterance(spokenText);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    speechSynthesis.speak(utterance);
  };

  const setVoiceForLanguage = () => {
    const voices = speechSynthesis.getVoices();
    const langMap = {
      en: 'en-CA',
      fr: 'fr-CA',
      es: 'es-MX',
      uk: 'uk-UA'
    } as const;
    selectedVoice =
      voices.find((voice) => voice.lang.startsWith(langMap[language as keyof typeof langMap])) ||
      null;
  };

  $: setVoiceForLanguage();

  onMount(() => {
    speechSynthesis.onvoiceschanged = setVoiceForLanguage;
    startTime = Date.now();
    nextQuestion();
  });
</script>

<!-- Quiz UI -->
<div id="quiz">
  <button id="backButton" on:click={goBackToSelector} aria-label="Go Back">
    {translations[language].backButton}
  </button>

  {#if !quizCompleted}
    <div id="progress">
      <div id="progress-bar" style="width: {(currentQuestion / totalQuestions) * 100}%"></div>
    </div>
    <p>
      {translations[language].question}
      {currentQuestion}
      {translations[language].of}
      {totalQuestions}
    </p>
    <p style="font-size: 1.4em; font-weight: bold; margin-top: 20px; margin-bottom: 20px;">
      {questions[currentQuestion - 1]?.question} = ?
    </p>
    <input type="number" bind:value={answer} on:keydown={handleKeyDown} aria-label="Answer Input" />
    <button on:click={checkAnswer} disabled={answer === null}
      >{translations[language].submit}</button
    >
    <p
      class="feedback {feedback.includes(translations[language].correct) ? 'correct' : 'incorrect'}"
    >
      {feedback}
    </p>
  {:else}
    <p>{translations[language].quizCompleted}</p>
    <p>{translations[language].timeTaken}: {timeTaken} {translations[language].seconds}</p>
    <p>{translations[language].incorrectAttempts}: {incorrectAnswers}</p>
    <p class="encouragement">{encouragementMessage}</p>
  {/if}
</div>

<style>
  /* Your existing styles */

  .encouragement {
    font-size: 1.2em;
    color: #333;
    margin-top: 20px;
  }
  #quiz {
    background-color: #f9f9f9;
    border-radius: 12px;
    padding: 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    margin: 20px auto;
    max-width: 500px;
    text-align: center;
    transition: all 0.3s ease-in-out;
  }

  button {
    padding: 12px 25px;
    font-size: 1.2em;
    color: white;
    background-color: #4caf50;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    margin-top: 15px;
    transition: background-color 0.2s ease-in;
  }

  button:disabled {
    background-color: #9e9e9e;
    cursor: not-allowed;
  }

  button:hover:not(:disabled) {
    background-color: #45a049;
  }

  #backButton {
    position: absolute;
    top: 20px;
    left: 20px;
    padding: 8px 15px;
    font-size: 1em;
    background-color: #008cba;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  #backButton:hover {
    background-color: #007b9a;
  }

  input[type='number'] {
    padding: 10px;
    font-size: 1.2em;
    margin: 10px 0;
    width: 120px;
    text-align: center;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  #progress {
    width: 100%;
    background-color: #f1f1f1;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  #progress-bar {
    height: 10px;
    background-color: #4caf50;
    border-radius: 10px;
    transition: width 0.3s ease-in-out;
  }

  #quiz p.feedback {
    font-size: 1.2em;
    margin-top: 15px;
    color: #333;
    transition: all 0.3s ease-in;
  }

  .correct {
    color: green;
  }

  .incorrect {
    color: red;
  }
</style>
