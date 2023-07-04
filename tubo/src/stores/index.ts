import { useUserStore } from './user'

export default function useStore() {
  const userStore = useUserStore()

  return {
    user: userStore
  }
}
