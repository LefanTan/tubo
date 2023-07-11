import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Tubo - Share your Liked Songs on Spotify',
  description:
    'Tubo is a simple tool to help Spotify Users convert their liked songs into a shareable playlist. With this, easily share your liked songs so your friends/family knows about your impeccable music taste!',
  cleanUrls: true,
  mpa: true,
  titleTemplate: false,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/favicon.ico'
      }
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com'
      }
    ],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: ''
      }
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Jua&family=Outfit:wght@200;300;400;500;600;700&display=swap'
      }
    ],
    // facebook meta tags
    [
      'meta',
      {
        property: 'og:url',
        content: 'https://tubo.live'
      }
    ],
    [
      'meta',
      {
        property: 'og:type',
        content: 'website'
      }
    ],
    [
      'meta',
      {
        property: 'og:title',
        content: 'Tubo - Share your Spotify Liked Songs'
      }
    ],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Tubo is a simple tool to help Spotify Users convert their liked songs into a shareable playlist. With this, easily share your liked songs so your friends/family knows about your impeccable music taste!'
      }
    ],
    [
      'meta',
      {
        property: 'og:image',
        content: 'https://tubo.live/preview.png'
      }
    ],
    // Twitter meta tags
    [
      'meta',
      {
        property: 'twitter:card',
        content: 'summary_large_image'
      }
    ],
    [
      'meta',
      {
        property: 'twitter:domain',
        content: 'tubo.live'
      }
    ],
    [
      'meta',
      {
        property: 'twitter:url',
        content: 'https://tubo.live'
      }
    ],
    [
      'meta',
      {
        property: 'twitter:title',
        content: 'Tubo - Share your Spotify Liked Songs'
      }
    ],
    [
      'meta',
      {
        property: 'twitter:description',
        content:
          'Tubo is a simple tool to help Spotify Users convert their liked songs into a shareable playlist. With this, easily share your liked songs so your friends/family knows about your impeccable music taste!'
      }
    ],
    [
      'meta',
      {
        property: 'twitter:image',
        content: 'https://tubo.live/preview.png'
      }
    ],
    // GTags
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtag/js?id=G-2WSKX58JYZ'
      }
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || []
        function gtag() {
          dataLayer.push(arguments)
        }
        gtag('js', new Date())
        gtag('config', 'G-2WSKX58JYZ')`
    ],
    // Ad sense
    [
      'script',
      {
        async: '',
        src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9640914157903339',
        crossorigin: 'anonymous'
      }
    ],
    ['script', {}, ` (adsbygoogle = window.adsbygoogle || []).push({});`]
  ]
})
