<script setup lang="ts">
import { useData } from 'vitepress'

// https://vitepress.dev/reference/runtime-api#usedata
const { site, frontmatter } = useData()
</script>

<template>
  <div class="border-b-4 border-black bg-white text-black">
    <div class="max-width py-4 flex justify-between items-center">
      <a href="/" class="logo"> tubo </a>
      <a href="/app/login" class="btn px-8 py-3 text-2xl">start now</a>
    </div>
  </div>

  <div v-if="frontmatter.home">
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

      <div class="flex-1 min-w-[20rem] sm:mr-20">
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
        <router-link to="/login"><img src="/app/hero.png" /></router-link>
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
  </div>
  <div v-else>
    <a href="/">Home</a>
    <Content />
  </div>

  <div class="footer">
    <div class="wrapper">
      <h5 class="logo">Tubo</h5>

      <div class="links">
        <a href="mailto:lefantan@hotmail.com">Contact Me</a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.footer {
  @apply border-t-4 border-black text-black font-medium;

  .wrapper {
    @apply max-width py-8;
    margin-bottom: 100px;
  }

  .logo {
    @apply font-logo text-3xl;
  }

  .links {
    @apply mt-4;
  }
}
</style>
