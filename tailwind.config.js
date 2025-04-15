/* eslint-disable no-undef */

/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            colors: {
                primary: '#00BD7E',
            },
            fontFamily: {
                system: ['system-ui', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif']
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                }
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out forwards',
                'lazy-fade-in': 'fadeIn 3s ease-in-out forwards'
            }
        },
    },

    plugins: [require('@tailwindcss/aspect-ratio')

        , require('@tailwindcss/forms')

        , require('@tailwindcss/typography')
    ],
};
