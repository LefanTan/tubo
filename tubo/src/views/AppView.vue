<script setup lang="ts">
import webapi from '@/lib/webapi'
import { CreatePlaylistRequest } from '@/schema/models/CreatePlaylistRequest'
import { Playlist } from '@/schema/models/Playlist'
import useStore from '@/stores'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { computed, ref } from 'vue'

const $store = useStore()
let reachedEndOfPlaylists = false

const playlists = ref<Playlist[]>([])
const showPlaylistPopup = ref(false)
const showCreatePlaylistPopup = ref(false)

const selectedPlaylistId = ref<string>()
const syncing = ref(false)

const newPlaylistForm = ref<CreatePlaylistRequest>({
  name: '',
  public: true
})

const selectedPlaylist = computed(() => {
  return playlists.value.find((playlist) => playlist.id === selectedPlaylistId.value)
})

async function onLoad(index: number, done: () => void) {
  const limit = 50

  if (reachedEndOfPlaylists) {
    done()
    return
  }

  const playlist = await webapi.indexController.indexControllerGetPlaylist(
    $store.user.tuboUser?.id ?? '',
    limit,
    index * limit
  )

  if (playlist) {
    playlists.value = playlists.value.concat(...playlist)
  }

  if (playlist.length <= limit) {
    reachedEndOfPlaylists = true
  }

  done()
}

async function onCreatePlaylistSubmit() {
  const newPlaylist = await webapi.indexController.indexControllerCreatePlaylist(
    $store.user.tuboUser?.id ?? '',
    {
      createPlaylistRequest: newPlaylistForm.value
    }
  )

  if (!newPlaylist) return

  playlists.value.unshift(newPlaylist)
  showCreatePlaylistPopup.value = false
  onSelectPlaylist(newPlaylist.id)
}

function onSelectPlaylist(playlistId: string) {
  selectedPlaylistId.value = playlistId
  showPlaylistPopup.value = false
}

async function onStartSync() {
  if (syncing.value || !selectedPlaylistId.value) return

  syncing.value = true

  fetchEventSource(
    `${import.meta.env.VITE_WEBAPI_URL}/rest/sync?playlist_id=${selectedPlaylistId.value}`,
    {
      headers: {
        Authorization: `Bearer ${webapi.request.config.TOKEN}`
      },
      onmessage: (event) => {
        console.log(event.event)
        console.log(event.data)
      },
      onclose: () => {
        syncing.value = false
      }
    }
  )
}
</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="border-b-4 border-black bg-transparent text-black">
      <div class="max-width py-4 flex justify-between items-center">
        <router-link to="/" class="logo"> tubo </router-link>

        <q-img
          :src="$store.user.spotifyUser?.images?.[0].url"
          class="w-14 h-14 rounded-full"
          alt="profile image"
        />
      </div>
    </q-header>

    <q-page-container>
      <q-page>
        <div class="step ready">
          <h2>Step 1. Select or Create a playlist</h2>
          <p>we'll place all your liked songs into this playlist</p>
          <button @click="showPlaylistPopup = true">Select Playlist</button>
        </div>

        <div v-if="selectedPlaylist" class="p-4 rounded-lg bg-gray-50 w-fit max-w-lg">
          <h2>Selected Playlist</h2>
          <div class="flex flex-nowrap gap-5 items-center mt-4">
            <q-img
              v-if="(selectedPlaylist.images?.length ?? 0) > 0"
              :src="selectedPlaylist.images![0].url"
              class="rounded-full w-14 h-14 shrink-0"
            />
            <p>
              {{ selectedPlaylist.name }}
            </p>
          </div>
        </div>

        <div
          class="step ready"
          :class="{
            ready: selectedPlaylistId
          }"
        >
          <h2>Step 2. Sync!</h2>
          <p>
            if there are already existing songs in the playlist, we'll just append your liked songs
            to the playlist
          </p>
          <button @click="onStartSync">Sync</button>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>

  <q-dialog class="dialog playlist-dialog" v-model="showPlaylistPopup">
    <div class="content">
      <div class="header">
        <h2>Select or Create Playlist</h2>
        <button @click="showCreatePlaylistPopup = true">
          <q-icon name="eva-plus-outline" size="1.5rem" />
        </button>
      </div>
      <q-infinite-scroll :initial-index="-1" @load="onLoad" :offset="500">
        <button
          class="playlist"
          :class="{
            selected: playlist.id === selectedPlaylistId
          }"
          v-for="playlist in playlists"
          :key="playlist.id"
          @click="onSelectPlaylist(playlist.id)"
        >
          <q-img
            v-if="(playlist.images?.length ?? 0) > 0"
            :src="playlist.images![0].url"
            class="img"
          />
          <q-icon v-else name="eva-music-outline" class="img" size="1.5rem" />

          <p>{{ playlist.name }}</p>
        </button>
        <template v-slot:loading>
          <div class="flex justify-center">
            <q-spinner-dots color="primary" size="40px" />
          </div>
        </template>
      </q-infinite-scroll>
    </div>
  </q-dialog>

  <q-dialog class="dialog create-playlist-dialog" v-model="showCreatePlaylistPopup">
    <div class="content">
      <div class="header">
        <h2>Create New Playlist</h2>
      </div>
      <q-form class="form" @submit.stop="onCreatePlaylistSubmit">
        <q-input
          outlined
          :rules="[(val) => !!val || '* Required']"
          v-model="newPlaylistForm.name"
          label="Playlist Name"
        />
        <q-input
          outlined
          type="textarea"
          v-model="newPlaylistForm.description"
          label="Description"
          class="mb-4"
        />
        <q-checkbox v-model="newPlaylistForm.public" label="Public" />

        <div class="footer">
          <q-btn
            unelevated
            no-caps
            type="reset"
            @click="
              () => {
                showCreatePlaylistPopup = false
              }
            "
            >Cancel</q-btn
          >
          <q-btn unelevated no-caps type="submit">Submit</q-btn>
        </div>
      </q-form>
    </div>
  </q-dialog>
</template>

<style lang="scss">
.q-page {
  @apply max-width mx-auto py-10 flex flex-col items-center gap-12;
}

.step {
  @apply opacity-50 flex flex-col gap-2 items-center pointer-events-none;

  &.ready {
    @apply opacity-100 pointer-events-auto;
  }

  h2 {
    @apply font-logo text-2xl text-center;
  }

  p {
    @apply mb-3;
  }

  button {
    @apply border-4 border-black rounded-md p-2 w-64 font-semibold bg-primary-400 text-xl;
  }
}

.dialog .content {
  @apply max-w-5xl p-4 bg-white border-4 border-black rounded-lg flex flex-col;
  height: 35rem;
  width: 30rem;

  .header {
    @apply flex justify-between items-center mb-4;
  }

  .footer {
    button[type='submit'] {
      @apply border-4 border-black border-solid rounded-md px-4 py-2 bg-primary-400;
    }
  }

  .q-input,
  .q-textarea {
    .q-field--outlined .q-field__control:before {
      @apply border-2;
    }
    &.q-field--focused .q-field__label {
      @apply text-primary-600;
    }
  }
}

.playlist-dialog {
  .playlist {
    @apply flex items-center gap-4 w-full duration-200 hover:bg-gray-100 cursor-pointer p-3 rounded-md;

    .img {
      @apply w-12 h-12 rounded-full bg-gray-200;
    }

    &.selected {
      @apply border-4 border-black;
    }
  }

  .playlist + .playlist {
    @apply mt-2;
  }

  .q-infinite-scroll {
    @apply min-h-0 overflow-auto;
  }
}

.create-playlist-dialog {
  .form {
    @apply flex flex-col gap-2 flex-1;
  }

  .footer {
    @apply flex justify-between items-center mt-auto;
  }
}
</style>
