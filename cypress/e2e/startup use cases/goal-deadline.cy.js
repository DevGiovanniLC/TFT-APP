/// <reference types="cypress" />

let LOCAL_STORAGE_SNAPSHOT = {}

describe('Startup a goal with deadline', () => {

    before(() => {
        cy.visit('tabs/tab1')

        cy.get('#nextBtn').click()

        cy.get('ion-picker-column-option[ng-reflect-value="90"]')
            .realClick()

        cy.get('#nextBtn').click()
        cy.get('#goalBtn').click()
        cy.wait(1000)
        cy.get('ion-picker-column-option[ng-reflect-value="80"]')
        .realClick()
        cy.wait(1000)
        cy.get('#dateToggle').click()
        cy.get('#confirmBtn').click()
        cy.get('#nextBtn').click()
        cy.get('#nextBtn').click()
    })

    beforeEach(() => {
        cy.visit('tabs/tab1')

        Object.keys(LOCAL_STORAGE_SNAPSHOT).forEach((key) => {
            localStorage.setItem(key, LOCAL_STORAGE_SNAPSHOT[key]);
        });
    })

    it('Verify main current weight chart', () => {
        LOCAL_STORAGE_SNAPSHOT = { ...localStorage }
        // cy.captureCanvasImage('#doughnutChart canvas', 'deadline-doughnut-chart.png')
        cy.compareCanvasImage('#doughnutChart canvas', 'deadline-doughnut-chart.png', 'diff-doughnutChart.png')
    })

    it('Verify available display modes', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('View Goal').should('be.visible')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Total').should('be.visible')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Week').should('be.visible')
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Month').should('be.visible')
    })

    it('Verify weight log chart (Total Mode)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Total').should('be.visible')
        cy.get('button.alert-button').contains('OK').click()
        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-total.png')
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-total.png', 'diff-line-chart-total.png')
    })

    it('Verify weight log chart (Last Week Mode)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Week').should('be.visible').click()
        cy.get('button.alert-button').contains('OK').click()

        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-week.png')
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-week.png', 'diff-line-chart-last-week.png')
    })

    it('Verify weight log chart (Last Month Mode)', () => {
        cy.get('#chartMode').click()
        cy.get('div.alert-radio-label.sc-ion-alert-md').contains('Last Month').should('be.visible').click()
        cy.get('button.alert-button').contains('OK').click()
        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-month.png')
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-month.png', 'diff-line-chart-last-month.png')
    })

    it('Verify recommended weight for registration matches current weight', () => {
        cy.get('#registerBtn').click()
        cy.get('app-weight-form').should('be.visible').should('have.attr','ng-reflect-input-weight-value', '90')
    })

})
