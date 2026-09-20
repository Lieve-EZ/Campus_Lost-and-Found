/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF7',
        ink: '#1E2A3A',
        muted: '#68727D',
        line: '#DCDDD7',
        lost: '#C1524B',
        'lost-soft': '#FBEDEC',
        found: '#B8862E',
        'found-soft': '#FBF3E3',
        sage: '#6B8F71',
        'sage-soft': '#EEF3EC',
        cork: '#E9E3D7'
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif']
      },
      boxShadow: {
        paper: '3px 4px 0 rgba(30, 42, 58, 0.05), 0 10px 24px rgba(30, 42, 58, 0.08)'
      }
    }
  },
  plugins: []
}
