// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2024-04-03',

    devtools: {enabled: true},

    modules: ["@nuxt/ui", '@nuxtjs/google-fonts', '@vueuse/nuxt'],

    css: ['~/assets/css/main.css'],

    ui: {
        fonts: false
    },

    runtimeConfig: {
        public: {
            apiUrl     : process.env.NUXT_API_URL,
            storageUrl : process.env.NUXT_STORAGE_URL,
            externalUrl: process.env.NUXT_EXTERNAL_URL
        }
    },

    devServer: {
        host: '0.0.0.0',
        port: 3000
    },

    googleFonts: {
        families: {
            Roboto: {
                wght: [100, 200, 300, 400, 500, 600, 700, 800, 900],
                ital: [300]
            }
        }
    },

    app: {
        head: {
            meta: [
                {name: 'viewport', content: 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no'}
            ]
        }
    },

    vite: {
        optimizeDeps: {
            include: [
                '@vue/devtools-core',
                '@vue/devtools-kit',
            ]
        }
    }
})