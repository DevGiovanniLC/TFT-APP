/* eslint-disable no-undef */

/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,ts}'],
    theme: {
        extend: {
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                }
            },
            animation: {
                'fade-in': 'fadeIn 1.5s ease-in-out forwards'
            }
        },
    },

    plugins: [require('@tailwindcss/aspect-ratio')

        , require('@tailwindcss/forms')

        , require('@tailwindcss/typography')
    ],
};
