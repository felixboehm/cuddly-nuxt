// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@hebilicious/authjs-nuxt'
  ],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    authJs: {
      secret: process.env.NUXT_AUTH_SECRET
    },
    public: {
      authJs: {
        baseUrl: process.env.NUXT_AUTH_URL || 'http://localhost:3000',
        verifyClientOnEveryRequest: true
      }
    }
  }
})