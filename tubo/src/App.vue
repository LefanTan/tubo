<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import useStore from './stores'

const $store = useStore()
const routes = useRoute()

function onLogout() {
  $store.user.logout()
}
</script>

<template>
  <q-layout view="hhh lpR fFf">
    <q-header class="border-b-4 border-black bg-white text-black">
      <div class="max-width py-4 flex justify-between items-center">
        <router-link to="/" class="logo"> tubo </router-link>

        <router-link v-if="routes.meta.startNowBtn" to="/login" class="btn px-8 py-3 text-2xl"
          >start now</router-link
        >
        <button v-if="routes.meta.requiresAuth">
          <q-img
            :src="$store.user.spotifyUser?.images?.[0].url"
            class="w-14 h-14 rounded-full"
            alt="profile image"
          >
            <q-menu
              class="shadow-sm whitespace-nowrap"
              anchor="bottom middle"
              self="top middle"
              :offset="[5, 5]"
              ><q-item clickable @click="onLogout">Sign out</q-item></q-menu
            >
          </q-img>
        </button>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
