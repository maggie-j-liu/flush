<script>
  import Flashcard from "./components/Flashcard.svelte";
  import crypto from "crypto";
  console.log(window.location);
  const urlParams = new URLSearchParams(window.location.search);
  const site = urlParams.get("site");
  let inputAnswer = "";
  let correctAnswer = "blueprint";
  let correct = false;
  let answered = false;

  const checkAnswer = () => {
    if (inputAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      correct = true;
      const origin = new URL(site).origin;
      const laterDate = Date.now() + 60 * 1000 * 1;
      chrome.storage.local.set(
        {
          [origin]: laterDate,
        },
        () => {
          setTimeout(() => {
            window.location.href = site;
          }, 3000);
        }
      );
    }
    answered = true;
  };
</script>

<main class="text-base px-16 py-20 flex flex-col items-center">
  <h1
    class="text-5xl font-bold text-center bg-gradient-to-r from-pink-400 to-yellow-500 w-max mx-auto text-transparent bg-clip-text"
  >
    Flush.
  </h1>
  <p class="text-xl text-center mt-1 font-light text-gray-600">
    you have been blocked from <span class="font-normal"
      >{site ? site : "this page"}</span
    >
    :(
  </p>
  <p class="text-xl text-center">Answer the flashcard below to gain access:</p>
  <div
    class="mt-8 text-xl flex items-end bg-gradient-to-r from-pink-200 to-yellow-100 px-4 py-2 rounded"
  >
    <label>
      <span class="text-gray-600 align-baseline">Answer: </span>
      <input
        class="bg-transparent border-0 border-b-2 border-gray-400 focus:outline-none focus:ring-0 focus:border-pink-400"
        type="text"
        bind:value={inputAnswer}
      />
    </label>
    <button
      class="ml-4 bg-pink-400 text-white font-medium text-lg px-3 py-0.5 rounded disabled:cursor-not-allowed disabled:opacity-70"
      type="button"
      on:click|preventDefault={checkAnswer}
      disabled={correct || !inputAnswer.length}>Submit</button
    >
  </div>

  <div class="h-4">
    {#if answered}
      {#if correct}
        <p>that was correct! redirecting to {site}</p>
      {:else}
        <p>that was incorrect :(</p>
      {/if}
    {/if}
  </div>
  <div class="container mx-auto flex items-center my-8">
    <Flashcard />
  </div>
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
