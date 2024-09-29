<script lang="ts">
  import { translations, type Translation } from './translations';
  import LanguageSelect from './LanguageSelect.svelte';
  import Quiz from './Quiz.svelte';
  import Records from './Records.svelte';

  let currentLanguage: keyof Translation = 'en' as keyof Translation;
  let quizType: 'multiplication' | 'division' | null = null;

  // Start the quiz with the selected type (multiplication or division)
  const startQuiz = (type: 'multiplication' | 'division') => {
    quizType = type;
  };

  // Change the current language and update all necessary components
  const changeLanguage = (lang: keyof Translation) => {
    currentLanguage = lang;
  };

  // Show the quiz type selector screen
  const showQuizSelector = () => {
    quizType = null; // Reset quiz type to show the selector
  };
</script>

<main>
  {#if !quizType}
    <!-- Language Selector -->
    <div class="language-toggle">
      <LanguageSelect
        {currentLanguage}
        onChangeLanguage={(lang: string) => changeLanguage(lang as keyof Translation)}
      />
    </div>

    <!-- Main Title -->
    <h1>{translations[currentLanguage].title}</h1>

    <!-- Quiz Type Selection Buttons -->
    <div class="start-buttons">
      <button on:click={() => startQuiz('multiplication')}>
        {translations[currentLanguage].startMultiplication}
      </button>
      <button on:click={() => startQuiz('division')}>
        {translations[currentLanguage].startDivision}
      </button>
    </div>
  {/if}

  {#if quizType}
    <!-- Render Quiz Component -->
    <Quiz {quizType} language={currentLanguage} on:backToSelector={showQuizSelector} />
  {/if}
  <!-- Render Records Component, passing the current language -->
  <Records language={currentLanguage as 'en' | 'fr' | 'es' | 'uk'} />
</main>

<style>
  /* Centering the main heading and adding a subtle text shadow */
  h1 {
    text-align: center;
    color: #4a4a4a;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
    font-size: 2em;
  }

  /* Styling for start buttons in the quiz type selection screen */
  .start-buttons {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .start-buttons button {
    padding: 12px 24px;
    font-size: 1.2em;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    margin: 10px;
    min-width: 180px;
  }

  .start-buttons button:hover {
    background-color: #45a049;
  }

  /* Styling for language selector toggle */
  .language-toggle {
    position: absolute;
    top: 20px;
    right: 20px;
  }

  /* Responsive styling for smaller screens */
  @media (max-width: 600px) {
    h1 {
      font-size: 1.8em;
    }

    .start-buttons button {
      padding: 10px 20px;
      font-size: 1em;
    }
  }
</style>
