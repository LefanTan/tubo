<script setup lang="ts">
import { useData } from 'vitepress'

const { site, frontmatter } = useData()
</script>

<template>
  <div class="border-b-4 border-black bg-white text-black">
    <div class="max-width py-4 flex justify-between items-center">
      <a href="/" class="logo"> tubo </a>
      <a href="/app/login" class="btn px-8 py-3 text-2xl">start now</a>
    </div>
  </div>

  <main class="landing" v-if="frontmatter.home">
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
      <a href="/app/login"><img src="/hero.png" /></a>
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
  </main>
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

  <div class="banner-bottom">
    <!-- banner-bottom -->
    <ins
      class="adsbygoogle"
      style="display: inline-block; width: 728px; height: 90px"
      data-ad-client="ca-pub-9640914157903339"
      data-ad-slot="4354502074"
    ></ins>
  </div>
</template>

<style lang="scss">
strong {
  @apply text-primary-400;
}

.landing {
  @apply flex-1 max-width flex flex-wrap items-center justify-center gap-y-10 py-8 pb-20;
}
</style>
