<style global lang="postcss">
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer utilities {
    .rotate-y-180 {
      transform: rotateY(180deg);
    }

    .rotate-y--180 {
      transform: rotateY(-180deg);
    }

    .rotate-y-0 {
      transform: rotateY(0deg);
    }

    .aspect-5\/3 {
      aspect-ratio: 5/3;
    }
  }

  @layer components {
    .front {
      @apply rotate-y-0;
    }

    .front-flip {
      @apply rotate-y--180;
    }

    .card {
      backface-visibility: hidden;
      @apply duration-1000;
    }

    .back {
      @apply rotate-y-180;
    }

    .back-flip {
      @apply rotate-y-0;
    }
  }
</style>
