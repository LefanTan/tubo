import type { Router } from 'vue-router'
import webapi from './webapi'
import useStore from '@/stores'
import { Cookies } from 'quasar'

/**
 * Ensures that the current access token is valid. If exists but expired, refresh. If doesn't exist, redirect to login.
 * @param router
 */
export default function userNavGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const $store = useStore()

    // Get the URL search params
    const searchParams = new URLSearchParams(window.location.search)

    if (searchParams.has('access_token') && searchParams.has('user_id')) {
      Cookies.set('access_token', searchParams.get('access_token') ?? '', {
        // 1 year expiration
        expires: 365
      })
      Cookies.set('user_id', searchParams.get('user_id') ?? '', {
        // 1 year expiration
        expires: 365
      })

      next('/')
      return
    }

    const accessToken = Cookies.get('access_token')
    const userId = Cookies.get('user_id')

    const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
    const nonAuthOnly = to.matched.some((record) => record.meta.nonAuthOnly)

    // No required cookies found, redirect to login if auth is necessary.
    if (!accessToken || !userId) {
      if (requiresAuth && to.fullPath !== '/login') {
        next('/login')
        return
      } else {
        next()
        return
      }
    }

    webapi.request.config.TOKEN = accessToken

    const profileRes = await webapi.authController
      .authControllerProfile({
        userId: userId ?? ''
      })
      .catch(() => null)

    if (profileRes) {
      if (profileRes.spotifyUser) $store.user.spotifyUser = profileRes.spotifyUser
      if (profileRes.tuboUser) $store.user.tuboUser = profileRes.tuboUser

      if (profileRes.newAccessToken) {
        Cookies.set('access_token', profileRes.newAccessToken)
        webapi.request.config.TOKEN = profileRes.newAccessToken
      }
    }

    if (requiresAuth && !profileRes) {
      next('/login')
      return
    }

    if (nonAuthOnly && profileRes) {
      next('/')
      return
    }

    next()
  })
}
