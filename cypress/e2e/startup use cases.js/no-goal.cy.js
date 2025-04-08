/// <reference types="cypress" />

let LOCAL_STORAGE_SNAPSHOT = {}

describe('Startup without a goal', () => {

    before(() => {
        cy.visit('tabs/tab1')

        cy.get('#nextBtn').click()

        cy.get('ion-picker-column-option[ng-reflect-value="100"]')
            .realClick()

        cy.get('#nextBtn').click()
        cy.get('#nextBtn').click()
        cy.get('#nextBtn').click()


    })

    beforeEach(() => {
        cy.visit('tabs/tab1')

        Object.keys(LOCAL_STORAGE_SNAPSHOT).forEach((key) => {
            localStorage.setItem(key, LOCAL_STORAGE_SNAPSHOT[key]);
        });
    })

    it('Comprobar gráfica principal de peso actual', () => {
        LOCAL_STORAGE_SNAPSHOT = { ...localStorage }

        cy.compareCanvasImage('#doughnutChart canvas', 'doughnut-chart.png', 'diff-doughnutChart.png')
    })

    it('Comprobar modos de visualización disponibles', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('View Goal').should('not.exist')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Total').should('be.visible')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Week').should('be.visible')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Month').should('be.visible')
    })

    it('Comprobar gráfica de registro de peso (Mode Total)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Total').should('be.visible')
        cy.get('button.alert-button').contains('OK').click()
        // cy.captureCanvasImage('#lineChart canvas', 'line-chart-total.png')
        cy.compareCanvasImage('#lineChart canvas', 'line-chart-total.png', 'diff-line-chart-total.png')
    })

    it('Comprobar gráfica de registro de peso (Mode Last Week)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Week').should('be.visible').click()
        cy.get('button.alert-button').contains('OK').click()

        // cy.captureCanvasImage('#lineChart canvas', 'line-chart-week.png')
        cy.compareCanvasImage('#lineChart canvas', 'line-chart-week.png', 'diff-line-chart-last-week.png')
    })

    it('Comprobar gráfica de registro de peso (Mode Last Month)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Month').should('be.visible').click()
        cy.get('button.alert-button').contains('OK').click()
        // cy.captureCanvasImage('#lineChart canvas', 'line-chart-month.png')
        cy.compareCanvasImage('#lineChart canvas', 'line-chart-month.png', 'diff-line-chart-last-month.png')
    })

    it ('Comprobar que el peso recomendado al registrar peso es el actual', () => {
        cy.get('#registerBtn').click()
        cy.get('app-weight-form').should('be.visible').should('have.attr','ng-reflect-input-weight-value', '100')
    })







})
