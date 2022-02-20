<script>
  import Tailwind from "./components/Tailwind.svelte";
  let sites = [];
  let input = "";
  let unlock = 5;
  const saveSites = () => {
    if (chrome.storage) {
      chrome.storage.local.set({ sites: sites });
    }
  };

  const saveUnlock = () => {
    if (chrome.storage) {
      chrome.storage.local.set({ unlock: unlock });
    }
  };

  const getData = () => {
    if (chrome.storage) {
      chrome.storage.local.get(["sites", "unlock"], (result) => {
        console.log(result);
        if (result.sites) {
          sites = result.sites;
        }
        if (result.unlock) {
          unlock = result.unlock;
        }
      });
    }
  };

  $: [unlock] && saveUnlock();

  getData();
</script>

<main
  class="text-base px-6 py-8 flex flex-col justify-items-center"
  style="width: 448px; height: 576px;"
>
  <h1
    class="text-2xl font-bold bg-gradient-to-r from-pink-400 to-yellow-500 w-max mx-auto text-transparent bg-clip-text"
  >
    Flush.
  </h1>
  <label class="flex gap-4 mt-4"
    ><h2 class="text-lg font-bold">Unlock Time.</h2>
    <input
      class="bg-gray-100 text-center"
      type="number"
      min="1"
      bind:value={unlock}
    /></label
  >

  <p class="text-sm">
    Websites will be unlocked for this number of minutes after you answer a
    flashcard.
  </p>

  <h2 class="text-lg font-bold mt-4">Blocked Sites.</h2>
  <div class="flex w-full gap-2 mt-1">
    <input
      class="bg-gray-100 py-0.5 px-2 flex-grow"
      type="text"
      bind:value={input}
    />
    <button
      type="button"
      class="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      on:click|preventDefault={() => {
        sites = [...sites, input];
        saveSites();
        input = "";
      }}>add website</button
    >
  </div>
  <div class="flex flex-col items-stretch w-full gap-2 mt-4">
    {#each sites as site, i (i)}
      <div
        class="px-2 py-1 border border-gray-300 rounded flex justify-between items-center"
      >
        <span>{site}</span>
        <button
          on:click|preventDefault={() => {
            sites = sites.filter((_, idx) => idx !== i);
            saveSites();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    {/each}
  </div>
</main>
<Tailwind />
