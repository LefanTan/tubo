import type { SpotifyUser, User } from '@/schema'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const spotifyUser = ref<SpotifyUser | null>(null)
  const tuboUser = ref<User | null>(null)

  return {
    spotifyUser,
    tuboUser
  }
})
