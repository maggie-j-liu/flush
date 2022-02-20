<script>
  import Flashcard from "./components/Flashcard.svelte";
  import Tailwind from "./components/Tailwind.svelte";
  import flashCards from "./components/flashcardData.js";
  console.log(window.location);
  const urlParams = new URLSearchParams(window.location.search);
  const site = urlParams.get("site");
  let inputAnswer = "";
  let correct = false;
  let answered = false;
  let questionNum = 1;

  let availableCards = JSON.parse(JSON.stringify(flashCards));

  const getRandomIndex = () => {
    return Math.floor(Math.random() * availableCards.length);
  };

  let showCardBack = false;
  let flashcardIndex = getRandomIndex();
  console.log(availableCards);
  // add to the above index if the user correctly answers the question
  let question = availableCards[flashcardIndex].question;
  let correctAnswer = availableCards[flashcardIndex].answer;

  // flip if the answer is wrong in the checkanswer v
  const checkAnswer = () => {
    if (inputAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      correct = true;
      const laterDate = Date.now() + 60 * 1000 * 1;
      if (chrome.storage) {
        const origin = new URL(site).origin;

        chrome.storage.local.set(
          {
            [origin]: laterDate,
          },
          () => {
            setTimeout(() => {
              window.location.href = site;
            }, 2000);
          }
        );
      }
    } else {
      showCardBack = true;
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
    <img
      class="w-5 h-5 inline"
      alt=":("
      src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/160/twitter/53/flushed-face_1f633.png"
    />
  </p>
  <p class="text-xl text-center">Answer the flashcard below to gain access:</p>
  <div
    class="mt-8 text-xl flex items-end bg-gradient-to-r from-pink-200 to-yellow-100 px-4 py-2 rounded"
  >
    <label>
      <span class="text-gray-600 align-baseline">Answer: </span>
      <input
        class="{answered
          ? `${correct ? 'text-green-600' : 'text-red-500'}`
          : ''} bg-transparent border-0 border-b-2 {answered
          ? `${correct ? 'border-green-600' : 'border-red-500'}`
          : 'border-gray-400'}  focus:outline-none focus:ring-0 focus:border-pink-400"
        type="text"
        bind:value={inputAnswer}
        disabled={answered}
      />
    </label>
    <button
      class="ml-4 bg-pink-400 text-white font-medium text-lg px-3 py-0.5 rounded disabled:cursor-not-allowed disabled:opacity-70"
      type="button"
      on:click|preventDefault={checkAnswer}
      disabled={answered || !inputAnswer.length}>Submit</button
    >
  </div>

  <div class="h-4 mt-2">
    {#if answered}
      {#if correct}
        <p class="text-green-500">that was correct! redirecting to {site}</p>
      {:else}
        <p class="text-red-500">that was incorrect, try again :(</p>
      {/if}
    {/if}
  </div>
  <div class="container mx-auto flex items-center my-8 h-fit">
    <Flashcard {question} answer={correctAnswer} {showCardBack} {questionNum} />
  </div>
  {#if answered && !correct}
    <button
      on:click|preventDefault={() => {
        answered = false;
        inputAnswer = "";
        correct = false;
        showCardBack = false;
        availableCards.splice(flashcardIndex, 1);
        availableCards = availableCards;
        if (availableCards.length === 0) {
          console.log("no more cards");
          availableCards = flashCards;
        }
        flashcardIndex = getRandomIndex();
        console.log(availableCards, flashcardIndex);
        question = availableCards[flashcardIndex].question;
        correctAnswer = availableCards[flashcardIndex].answer;
        questionNum++;
      }}>next &rarr;</button
    >
  {/if}
</main>

<Tailwind />
