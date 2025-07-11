/* eslint-disable no-undef */

/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            colors: {
                primary: '#f8f9fa;',
                secondary: '#1e8260;',
                tertiary: '#00bd7e',
                accent: '#343a40',
            },
            fontFamily: {
                system: ['system-ui', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif']
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                fadeOut: {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' }
                },
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out forwards',
                'lazy-fade-in': 'fadeIn 3s ease-in-out forwards',
                'fade-out': 'fadeOut 0.5s ease-in-out forwards',
            }
        },
    },

    plugins: [require('@tailwindcss/aspect-ratio')

        , require('@tailwindcss/forms')

        , require('@tailwindcss/typography')
    ],
};
