import 'cypress-real-events/support';
import 'cypress-wait-until';

Cypress.Commands.add('captureCanvasImage', (selector, fileName = null, waitMS = 5000) => {
    cy.waitForCanvasToBeStable(selector);
    cy.get(selector, { log: false }).then(($canvas) => {
        const canvas = $canvas[0];
        const dataURL = canvas.toDataURL('image/png');
        const base64 = dataURL.split(',')[1];

        const payload = {
            base64,
            fileName: fileName || `canvas-${Date.now()}.png`
        };

        cy.task('saveImage', payload, { log: false });

        return cy.wrap(payload.fileName, { log: false });
    });
});

Cypress.Commands.add('compareCanvasImage', (actual, expected, diff, threshold = 0.3) => {
    cy.captureCanvasImage(actual).then((actual) => {
        const payload = {
            actual: `cypress/screenshots/${actual}`,
            expected: `cypress/screenshots/${expected}`,
            diff: `cypress/screenshots/log/${diff}`,
            threshold: threshold
        };


        cy.task('compareImage', payload, { log: false })
            .then(() => {
                cy.eLog('success', `Chart verified`);
            })
    })
});

Cypress.Commands.add('waitForCanvasToBeStable', (selector, cycles = 10, interval = 300) => {
    cy.get(selector).should('be.visible').and(($canvas) => {
        const canvas = $canvas[0];
        const getHash = () => {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            return Array.from(data).slice(0, 1000).join(',');
        };

        return new Cypress.Promise((resolve) => {
            let prev = getHash();
            let stable = 0;

            const timer = setInterval(() => {
                const next = getHash();
                if (next === prev) {
                    stable++;
                } else {
                    stable = 0;
                    prev = next;
                }

                if (stable >= cycles) {
                    clearInterval(timer);
                    resolve();
                }
            }, interval);
        });
    });
});





//////DEBUGGING/////////
Cypress.Commands.add('eLog', (emoji, message) => {

    const lineLength = 25;

    const emojis = {
        'mark': '📌[MARK]',
        'error': '🔴[ERROR]',
        'success': '🟢[SUCCESS]'
    }

    message = (message != null ? message.toString().trim() : "")

    cy.log(
        `**${emojis[emoji.trim().toLowerCase()]}**
        ${'-'.repeat(lineLength)}
        **${message}**
        ${'-'.repeat(lineLength)}\n`
    )

})

Cypress.Commands.add('mark', { prevSubject: true }, (subject) => {

    subject.css({
        'outline': '3px solid red',
        'background-color': 'yellow'
    });

    const firstEl = subject[0];
    const html = firstEl?.outerHTML || '(sin outerHTML)';
    const text = subject.text();

    console.info('Elemento seleccionado:', firstEl);

    cy.eLog('mark', `
        HTML: ${html}
        Texto: ${text}
    `);

    cy.pause();

})




