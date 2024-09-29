<script lang="ts">
  export let currentLanguage: string;
  export let onChangeLanguage: (lang: string) => void;

  const languages = [
    { code: "en", label: "English" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "uk", label: "Українська" }
  ];

  const handleChange = (event: Event) => {
    const select = event.target as HTMLSelectElement;
    onChangeLanguage(select.value);
  };
</script>

<div class="language-selector">
  <label for="language-select">Select Language:</label>
  <select id="language-select" bind:value={currentLanguage} on:change={handleChange}>
    {#each languages as { code, label }}
      <option value={code} selected={currentLanguage === code}>{label}</option>
    {/each}
  </select>
</div>

<style>
  .language-selector {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 20px;
  }

  .language-selector select {
    padding: 8px;
    font-size: 1em;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
    cursor: pointer;
    transition: border-color 0.3s ease;
  }

  .language-selector select:hover {
    border-color: #4caf50;
  }

  .language-selector label {
    font-size: 1.2em;
    color: #4a4a4a;
  }
</style>
