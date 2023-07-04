import { WebAPI } from '@/schema'

const webapi = new WebAPI({
  BASE: import.meta.env.VITE_WEBAPI_URL
})

export default webapi
