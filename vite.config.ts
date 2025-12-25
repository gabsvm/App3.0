import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
      react(),
          VitePWA({
                registerType: 'autoUpdate',
                      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
                            manifest: {
                                    name: 'RP Hypertrophy',
                                            short_name: 'RP Gym',
                                                    description: 'Tracker de Hipertrofia Científica',
                                                            theme_color: '#0f172a',
                                                                    background_color: '#0f172a',
                                                                            display: 'standalone',
                                                                                    orientation: 'portrait',
                                                                                            start_url: '/',
                                                                                                    icons: [
                                                                                                              {
                                                                                                                          src: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                                                                                                                                      sizes: '192x192',
                                                                                                                                                  type: 'image/png'
                                                                                                                                                            },
                                                                                                                                                                      {
                                                                                                                                                                                  src: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                                                                                                                                                                                              sizes: '512x512',
                                                                                                                                                                                                          type: 'image/png'
                                                                                                                                                                                                                    },
                                                                                                                                                                                                                              {
                                                                                                                                                                                                                                          src: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
                                                                                                                                                                                                                                                      sizes: '512x512',
                                                                                                                                                                                                                                                                  type: 'image/png',
                                                                                                                                                                                                                                                                              purpose: 'any maskable'
                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                ]
                                                                                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                                                                                          })
                                                                                                                                                                                                                                                                                                            ],
                                                                                                                                                                                                                                                                                                            })