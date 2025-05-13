let LOCAL_STORAGE_SNAPSHOT = {};

describe('Start application with a goal (no deadline) (E2E)', () => {
    before(() => {
        cy.visit('tabs/tab1');

        cy.get('#nextBtn').click();
        cy.wait(300);
        cy.get('ion-picker-column-option[ng-reflect-value="120"]').realClick(); // Peso inicial

        cy.get('#nextBtn').click();
        cy.get('#goalBtn').click();
        cy.wait(300);
        cy.get('ion-picker-column-option[ng-reflect-value="80"]').realClick(); // Meta

        cy.wait(300);

        cy.get('#confirmBtn').click(); // Sin activar fecha
        cy.wait(300);
        cy.get('#nextBtn').click();
        cy.get('#confirmBtn').click();
    });

    beforeEach(() => {
        cy.visit('tabs/tab1');
        Object.keys(LOCAL_STORAGE_SNAPSHOT).forEach((key) => {
            localStorage.setItem(key, LOCAL_STORAGE_SNAPSHOT[key]);
        });
    });

    it('should render doughnut chart with progress but no deadline', () => {
        LOCAL_STORAGE_SNAPSHOT = { ...localStorage };

        cy.captureCanvasImage('#doughnutChart canvas', 'goal-doughnut-chart.png');
        // cy.compareCanvasImage('#doughnutChart canvas', 'goal-doughnut-chart.png', 'diff-doughnutChart.png');
    });

    it('should not include "View Goal" mode if no deadline is defined', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('View Goal').should('not.exist');
        cy.get('.sc-ion-select-popover-md').contains('Total').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Week').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Month').should('be.visible');
    });

    it('should show "Total" line chart with goal but no deadline', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Total').click();

        // cy.captureCanvasImage('#lineChart canvas', 'goal-line-chart-total.png');
        cy.compareCanvasImage('#lineChart canvas', 'goal-line-chart-total.png', 'diff-line-chart-total.png');
    });

    it('should show "Last Week" line chart with goal and no deadline', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Last Week').click();

        // cy.captureCanvasImage('#lineChart canvas', 'goal-line-chart-week.png');
        cy.compareCanvasImage('#lineChart canvas', 'goal-line-chart-week.png', 'diff-line-chart-last-week.png');
    });

    it('should show "Last Month" line chart with goal and no deadline', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Last Month').click();

        // cy.captureCanvasImage('#lineChart canvas', 'goal-line-chart-month.png');
        cy.compareCanvasImage('#lineChart canvas', 'goal-line-chart-month.png', 'diff-line-chart-last-month.png');
    });

    it('should open weight form pre-filled with current weight (120)', () => {
        cy.get('#registerBtn').click();
        cy.get('app-weight-form')
            .should('be.visible')
            .should('have.attr', 'ng-reflect-input-weight-value', '120');
    });

    it('should save weight and goal to localStorage without deadline data', () => {
        expect(localStorage.getItem('weight_data_weights')).to.exist;
        expect(localStorage.getItem('user_data')).to.exist;
    });
});
