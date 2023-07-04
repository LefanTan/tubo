<template>
  <header class="border-b-4 border-black">
    <div class="max-width py-4 flex justify-between items-center">
      <RouterLink to="/" class="logo">tubo</RouterLink>

      <RouterLink to="/login" class="btn px-8 py-3 flex items-center text-2xl"
        >start now</RouterLink
      >
    </div>
  </header>

  <main class="mt-8 sm:mt-16">
    <div class="max-width flex gap-4">
      <div>
        <h1
          class="font-logo text-4xl sm:text-6xl [&>strong]:text-primary-400 [&>strong]:font-normal sm:leading-tight"
        >
          Convert your Spotify <strong>Liked Songs</strong> to a <strong>Shareable Playlist</strong>
        </h1>
        <p class="text-gray-500 sm:text-xl mt-4">
          yup, you can finally share all your liked songs to your friends with just a
          <strong>click</strong> of a button.
        </p>
      </div>

      <div class="basis-1/2">lol</div>
    </div>
  </main>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
strong {
  @apply text-primary-400;
}
</style>
