<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import useStore from './stores'

const $store = useStore()
const routes = useRoute()
</script>

<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="border-b-4 border-black bg-white text-black">
      <div class="max-width py-4 flex justify-between items-center">
        <router-link to="/" class="logo"> tubo </router-link>

        <router-link v-if="routes.meta.startNowBtn" to="/login" class="btn px-8 py-3 text-2xl"
          >start now</router-link
        >
        <q-img
          v-if="routes.meta.requiresAuth"
          :src="$store.user.spotifyUser?.images?.[0].url"
          class="w-14 h-14 rounded-full"
          alt="profile image"
        />
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
