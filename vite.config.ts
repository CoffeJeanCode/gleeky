import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {vite} from "million/compiler"
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vite({auto: true}), react()],
})
