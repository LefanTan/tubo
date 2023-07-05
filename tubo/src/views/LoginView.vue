<script setup lang="ts">
const loginLink = `${import.meta.env.VITE_WEBAPI_URL}/rest/auth/login`
</script>

<template>
  <q-page class="flex items-center justify-center">
    <a :href="loginLink" class="btn text-2xl p-4 flex gap-2 items-center">
      Connect to Spotify <img src="/spotify.png" class="w-10 h-10" />
    </a>
  </q-page>
</template>

<style scoped></style>
