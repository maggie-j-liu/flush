<script>
  import Flashcard from "./components/Flashcard.svelte";
  console.log(window.location);
  const urlParams = new URLSearchParams(window.location.search);
  const site = urlParams.get("site");
</script>

<main class="text-base px-16 py-20">
  <h1
    class="text-5xl font-bold text-center bg-gradient-to-r from-pink-400 to-yellow-500 w-max mx-auto text-transparent bg-clip-text"
  >
    Flush.
  </h1>
  <p class="text-xl text-center mt-1 font-light text-gray-600">
    you have been blocked from <span class="font-normal"
      >{site ? site : "this page"}</span
    > :(
  </p>
  <p class="text-2xl text-center">Answer the flashcard below to gain access:</p>
  <div class="container mx-auto flex items-center my-8">
    <Flashcard />
  </div>
</main>

<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
</style>
