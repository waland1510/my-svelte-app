<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { recordsStore, loadRecords, type Record } from '../store'; // Import the store
  import { translations } from './translations';

  export let language: 'en' | 'fr' | 'es' | 'uk';
  let records: Record[] = [];

  const unsubscribe = recordsStore.subscribe((value) => {
    records = value;
  });

  onMount(() => {
    loadRecords();
  });

  onDestroy(() => {
    unsubscribe();
  });

  const getEmojiForRank = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank.toString();
    }
  };
</script>

<main>
  <section id="records">
    <h2 class="records-title">{translations[language].recordsTitle}</h2>
    {#if records.length === 0}
      <p>{translations[language].noRecords}</p>
    {:else if window.innerWidth <= 600}
      <div class="records-list">
        {#each records as record, index}
          <div class="record-item">
            <p>
              <strong>{translations[language].rank}:</strong>
              {getEmojiForRank(index + 1)}
            </p>
            <p>
              <strong>{translations[language].type}:</strong>
              {translations[language][record.type]}
            </p>
            <p><strong>{translations[language].time}:</strong> {record.time.toFixed(2)}s</p>
            <p>
              <strong>{translations[language].incorrectAttempts}:</strong>
              {record.incorrectAttempts}
            </p>
            <p><strong>{translations[language].date}:</strong> {record.date}</p>
          </div>
        {/each}
      </div>
    {:else}
      <div class="table-responsive">
        <table class="records-table">
          <thead>
            <tr>
              <th>{translations[language].rank}</th>
              <th>{translations[language].type}</th>
              <th>{translations[language].time}</th>
              <th>{translations[language].incorrectAttempts}</th>
              <th>{translations[language].date}</th>
            </tr>
          </thead>
          <tbody>
            {#each records as record, index}
              <tr>
                <td>{getEmojiForRank(index + 1)}</td>
                <td>{translations[language][record.type]}</td>
                <td>{record.time.toFixed(2)}s</td>
                <td>{record.incorrectAttempts}</td>
                <td>{record.date}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</main>

<style>
  .records-title {
    font-size: 2em;
    text-align: center;
    color: #4a4a4a;
    margin-bottom: 20px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  }

  .records-list {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .record-item {
    margin-bottom: 20px;
    border: 1px solid #ddd;
    padding: 10px;
    width: 100%;
    max-width: 500px;
    border-radius: 5px;
    background-color: #f9f9f9;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .records-table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 auto;
  }

  .records-table th,
  .records-table td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: center;
  }

  .records-table th {
    background-color: #4caf50;
    color: white;
  }

  .records-table td {
    background-color: #f9f9f9;
  }

  @media (max-width: 600px) {
    .record-item {
      font-size: 0.9em;
      padding: 8px;
    }
  }
</style>
