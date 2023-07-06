<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import useStore from './stores'
import { onMounted } from 'vue'

const $store = useStore()
const routes = useRoute()

function onLogout() {
  $store.user.logout()
}

onMounted(() => {
  const push = document.createElement('script')
  push.innerHTML = `(adsbygoogle = window.adsbygoogle || []).push({});`

  document.head.appendChild(push)
})
</script>

<template>
  <q-layout view="hhh lpR fff">
    <q-header class="border-b-4 border-black bg-white text-black">
      <div class="max-width py-4 flex justify-between items-center">
        <a href="/" class="logo"> tubo </a>

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

    <q-footer class="footer">
      <div class="wrapper">
        <h5 class="logo">Tubo</h5>

        <div class="links">
          <a href="mailto:lefantan@hotmail.com">Contact Me</a>
        </div>
      </div>
    </q-footer>

    <div class="banner-bottom">
      <!-- banner-bottom -->
      <ins
        class="adsbygoogle"
        style="display: inline-block; width: 728px; height: 90px"
        data-ad-client="ca-pub-9640914157903339"
        data-ad-slot="4354502074"
      ></ins>
    </div>
  </q-layout>
</template>

<style lang="scss">
.banner-bottom {
  @apply fixed bottom-0 left-0 right-0 bg-gray-600/40;
  max-height: 100px;
  z-index: 9999;
}
</style>
