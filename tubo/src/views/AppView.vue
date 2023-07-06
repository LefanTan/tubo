<script setup lang="ts">
import webapi from '@/lib/webapi'
import { CreatePlaylistRequest } from '@/schema/models/CreatePlaylistRequest'
import { Playlist } from '@/schema/models/Playlist'
import useStore from '@/stores'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { computed, nextTick, ref } from 'vue'

const $store = useStore()
let reachedEndOfPlaylists = false

const playlists = ref<Playlist[]>([])
const showPlaylistPopup = ref(false)
const showCreatePlaylistPopup = ref(false)

const selectedPlaylistId = ref<string>()

const syncInfo = ref<{
  syncing: boolean
  /**
   * Total number of actions to be performed to sync the playlist
   */
  total: number
  /**
   * Current total number of actions performed
   */
  progress: number
  /**
   * Current message to be displayed
   */
  message?: string
}>({
  syncing: false,
  total: 0,
  progress: 0
})

const newPlaylistForm = ref<CreatePlaylistRequest>({
  name: '',
  public: true
})

const selectedPlaylist = computed(() => {
  return playlists.value.find((playlist) => playlist.id === selectedPlaylistId.value)
})

const progress = computed(() => {
  if (!syncInfo.value.total) return 0

  return syncInfo.value.progress / syncInfo.value.total
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
  if (syncInfo.value.syncing || !selectedPlaylistId.value) return

  await fetchEventSource(
    `${import.meta.env.VITE_WEBAPI_URL}/rest/sync?playlist_id=${selectedPlaylistId.value}`,
    {
      openWhenHidden: true,
      headers: {
        Authorization: `Bearer ${webapi.request.config.TOKEN}`
      },
      onopen: async () => {
        syncInfo.value = {
          syncing: true,
          total: 0,
          progress: 0
        }

        // Scroll to bottom of page
        nextTick(() => {
          window.scrollTo({
            top: document.body.scrollHeight
          })
        })
      },
      onmessage: (event) => {
        if (event.event === 'total') {
          syncInfo.value.total = event.data as any as number
        } else if (event.event === 'progress') {
          syncInfo.value.progress = event.data as any as number
        } else if (event.event === 'message') {
          syncInfo.value.message = event.data as any as string
        } else if (event.event === 'tracks-pulled') {
          syncInfo.value.message = 'Pulling tracks from your liked songs...'
        } else if (event.event === 'tracks-added') {
          syncInfo.value.message = 'Pushing tracks to your playlist...'
        }
      },
      onclose: () => {
        syncInfo.value.syncing = false
      },
      onerror(err) {
        console.log(err)
      }
    }
  )
}
</script>

<template>
  <q-page>
    <div class="step ready">
      <h2>Step 1. Select or Create a playlist</h2>
      <p>we'll place all your liked songs into this playlist</p>
      <button @click="showPlaylistPopup = true">Select Playlist</button>
    </div>

    <div v-if="selectedPlaylist" class="selected-playlist">
      <h2>Selected Playlist</h2>
      <div class="playlist">
        <q-img
          v-if="(selectedPlaylist.images?.length ?? 0) > 0"
          :src="selectedPlaylist.images![0].url"
          class="img"
        />
        <q-icon v-else name="eva-music-outline" class="img" size="1.5rem" />
        <p>
          {{ selectedPlaylist.name }}
        </p>

        <a :href="selectedPlaylist.spotify_url ?? '/'" class="ml-auto">
          <q-img src="/spotify.png" class="spotify-logo" />
        </a>
      </div>
    </div>

    <div
      class="step"
      :class="{
        ready: selectedPlaylistId
      }"
    >
      <h2>Step 2. Sync!</h2>
      <p>
        if there are already existing songs in the playlist, we'll just append your liked songs to
        the playlist
      </p>
      <button @click="onStartSync">Sync</button>

      <div v-if="syncInfo.syncing" class="w-full mt-8">
        <strong class="font-logo text-base">{{ syncInfo.message }}</strong>
        <q-linear-progress :value="progress" color="primary" class="q-mt-md" />
      </div>
    </div>

    <div v-if="syncInfo.total > 0 && syncInfo.progress === syncInfo.total" class="done">
      <h3>Done!</h3>
      <p>See your playlist here</p>
      <a :href="selectedPlaylist.spotify_url ?? ''" v-if="selectedPlaylist" class="playlist">
        <q-img
          v-if="(selectedPlaylist.images?.length ?? 0) > 0"
          :src="selectedPlaylist.images![0].url"
          class="img"
        />
        <q-icon v-else name="eva-music-outline" class="img" size="1.5rem" />
        <p>
          {{ selectedPlaylist.name }}
        </p>

        <q-img src="/spotify.png" class="spotify-logo" />
      </a>
    </div>
  </q-page>

  <q-dialog class="dialog playlist-dialog" v-model="showPlaylistPopup">
    <div class="content">
      <div class="dialog-header">
        <h2>Select or Create Playlist</h2>
        <button @click="showCreatePlaylistPopup = true">
          <q-icon name="eva-plus-outline" size="1.5rem" />
        </button>
      </div>
      <q-infinite-scroll :initial-index="-1" @load="onLoad" :offset="500">
        <div class="playlist" v-for="playlist in playlists" :key="playlist.id">
          <button
            class="playlist-content"
            :class="{
              selected: playlist.id === selectedPlaylistId
            }"
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

          <a :href="playlist.spotify_url ?? '/'" class="ml-auto">
            <q-img src="/spotify.png" class="spotify-logo" />
          </a>
        </div>
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
      <div class="dialog-header">
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

        <div class="dialog-footer">
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

  > p {
    @apply mb-3 text-center;
  }

  button {
    @apply border-4 border-black rounded-md p-2 w-64 font-semibold bg-primary-400 text-xl;
  }
}

.spotify-logo {
  @apply w-8 h-8;
}

.selected-playlist {
  @apply p-4 rounded-lg bg-gray-100 w-fit max-w-lg;

  .playlist {
    @apply flex flex-nowrap gap-5 items-center mt-4;

    > a {
      @apply w-8 h-8;
    }
  }

  .img {
    @apply w-14 h-14 shrink-0 rounded-sm bg-white;
  }
}

.done {
  @apply border-4 border-black p-4 rounded-md;

  .playlist {
    @apply flex flex-nowrap gap-5 items-center mt-4;
  }

  .img {
    @apply w-14 h-14 shrink-0 rounded-sm bg-gray-50;
  }

  h3 {
    @apply font-logo text-2xl;
  }
}

.dialog .content {
  @apply max-w-5xl p-4 bg-white border-4 border-black rounded-lg flex flex-col;
  height: 35rem;
  width: 30rem;

  .dialog-header {
    @apply flex justify-between items-center mb-4;
  }

  .dialog-footer {
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
    @apply flex items-center gap-4 w-full cursor-pointer;

    &-content {
      @apply flex-1 flex items-center gap-4 p-2 sm:p-3 rounded-md hover:bg-gray-100 duration-200;

      .img {
        @apply w-12 h-12 rounded-sm shrink-0 bg-gray-200;
      }

      > p {
        @apply text-sm sm:text-base text-left;
      }

      &.selected {
        @apply border-4 border-black;
      }
    }

    > a {
      @apply shrink-0;
    }

    .spotify-logo {
      @apply shrink-0 w-5 h-5 sm:w-8 sm:h-8;
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

  .dialog-footer {
    @apply flex justify-between items-center mt-auto;
  }
}
</style>
