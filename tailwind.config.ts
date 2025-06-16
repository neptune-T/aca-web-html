import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'peking-red': '#8A0000',
        'klein-blue': '#002FA7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // ...
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
export default config 