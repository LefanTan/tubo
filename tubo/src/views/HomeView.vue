<template>
  <q-page>
    <div class="max-width flex items-center justify-center gap-y-10 py-8">
      <!-- left side ads -->
      <ins
        class="adsbygoogle"
        style="display: block"
        data-ad-client="ca-pub-9640914157903339"
        data-ad-slot="3927960815"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>

      <div class="flex-1 min-w-[20rem] mr-20">
        <h1
          class="font-logo text-4xl sm:text-6xl [&>strong]:text-primary-400 [&>strong]:font-normal sm:leading-tight"
        >
          Convert your Spotify <strong>Liked Songs</strong> to a
          <strong>Shareable Playlist</strong>
        </h1>
        <p class="text-gray-500 sm:text-xl mt-4">
          yup, you can finally share all your liked songs to your friends with just a couple
          <strong>clicks</strong> of a button.
        </p>
      </div>

      <div class="max-w-[20rem]">
        <router-link to="/login"><img src="/hero.png" /></router-link>
      </div>

      <!-- right -->
      <ins
        class="adsbygoogle"
        style="display: block"
        data-ad-client="ca-pub-9640914157903339"
        data-ad-slot="9169459451"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  </q-page>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
strong {
  @apply text-primary-400;
}
</style>
