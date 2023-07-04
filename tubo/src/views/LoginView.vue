<script setup lang="ts">
import spotify from '@/assets/icons/spotify.png'

const loginLink = `${import.meta.env.VITE_WEBAPI_URL}/rest/auth/login`
</script>

<template>
  <main class="flex items-center justify-center h-screen">
    <a :href="loginLink" class="btn text-2xl p-4 flex gap-2 items-center">
      Connect to Spotify <img :src="spotify" class="w-10 h-10" />
    </a>
  </main>
</template>

<style scoped></style>
