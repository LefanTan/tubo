import type { SpotifyUser, User } from '@/schema'
import { defineStore } from 'pinia'
import { Cookies } from 'quasar'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()

  const spotifyUser = ref<SpotifyUser | null>(null)
  const tuboUser = ref<User | null>(null)

  async function logout() {
    Cookies.remove('access_token')
    Cookies.remove('user_id')

    await router.push({ name: 'login' })
  }

  return {
    spotifyUser,
    tuboUser,
    logout
  }
})
