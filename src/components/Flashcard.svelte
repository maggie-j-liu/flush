<script>
  export let showCardBack;
  export let answer;
  export let question;
  export let questionNum;
</script>

<div
  class="group relative max-w-2xl w-full mx-auto overflow-visible aspect-5/3"
  style="perspective: 100rem;"
>
  <div
    class="{showCardBack
      ? 'front-flip'
      : 'front'} card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"
  >
    <span class="text-gray-700 text-center">Question {questionNum}</span>
    <div
      class="w-1/2 border-b-2 border-gray-300 pb-4 mb-4 flex justify-between"
    />
    <!-- <h2 class="text-2xl font-bold mb-2">Card title</h2> -->
    <p
      class="text-lg text-center text-gray-800 leading-relaxed overflow-y-auto"
    >
      {question}
    </p>
  </div>
  <div
    class="{showCardBack
      ? 'back-flip'
      : 'back'} card absolute inset-0 flex flex-col items-center justify-center bg-gray-100 mx-auto rounded-xl p-8 aspect-5/3 overflow-y-auto"
  >
    {#if showCardBack}
      <span class="text-gray-700 text-center">Correct Answer</span>
      <div
        class="w-1/2 border-b-2 border-gray-300 pb-4 mb-4 flex justify-between"
      />
      <!-- <h2 class="text-2xl font-bold mb-2">Card title</h2> -->
      <p
        class="text-lg text-center text-gray-800 leading-relaxed overflow-y-auto"
      >
        {answer}
      </p>
    {/if}
  </div>
</div>
