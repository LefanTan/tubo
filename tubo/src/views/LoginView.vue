<script setup lang="ts">
import spotify from '@/assets/icons/spotify.png'

async function onConnect() {
  //
}
</script>

<template>
  <main class="flex items-center justify-center h-screen">
    <button @click="onConnect" class="btn text-2xl p-4 flex gap-2 items-center">
      Connect to Spotify <img :src="spotify" class="w-10 h-10" />
    </button>
  </main>
</template>

<style scoped></style>
