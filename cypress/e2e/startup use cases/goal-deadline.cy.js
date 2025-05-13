let LOCAL_STORAGE_SNAPSHOT = {};

describe('Start application with a goal with deadline (E2E)', () => {
    before(() => {
        cy.visit('tabs/tab1');

        cy.get('#nextBtn').click();
        cy.wait(300);
        cy.get('ion-picker-column-option[ng-reflect-value="90"]').realClick(); // Peso inicial

        cy.get('#nextBtn').click();
        cy.get('#goalBtn').click();
        cy.wait(300);
        cy.get('ion-picker-column-option[ng-reflect-value="80"]').realClick(); // Meta

        cy.wait(300);
        cy.get('#dateToggle').click(); // Activar fecha
        cy.get('#confirmBtn').click();
        cy.wait(300);
        cy.get('#nextBtn').click({ force: true });
        cy.get('#confirmBtn').click({ force: true });
    });

    beforeEach(() => {
        cy.visit('tabs/tab1');

        Object.keys(LOCAL_STORAGE_SNAPSHOT).forEach((key) => {
            localStorage.setItem(key, LOCAL_STORAGE_SNAPSHOT[key]);
        });
    });


    it('should render main weight chart correctly with progress', () => {
        LOCAL_STORAGE_SNAPSHOT = { ...localStorage };
        // cy.captureCanvasImage('#doughnutChart canvas', 'deadline-doughnut-chart.png');
        cy.compareCanvasImage('#doughnutChart canvas', 'deadline-doughnut-chart.png', 'diff-doughnutChart.png');
    });

    it('should display all chart modes with "View Goal"', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('View Goal').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Total').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Week').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Month').should('be.visible');
    });

    it('should render total progress line chart correctly', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Total').click();

        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-total.png');
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-total.png', 'diff-line-chart-total.png');
    });

    it('should render last week line chart correctly', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Last Week').click();

        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-week.png');
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-week.png', 'diff-line-chart-last-week.png');
    });

    it('should render last month line chart correctly', () => {
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('Last Month').click();

        // cy.captureCanvasImage('#lineChart canvas', 'deadline-line-chart-month.png');
        cy.compareCanvasImage('#lineChart canvas', 'deadline-line-chart-month.png', 'diff-line-chart-last-month.png');
    });

    it('should open weight registration form with current weight pre-filled', () => {
        cy.get('#registerBtn').click();
        cy.get('app-weight-form')
            .should('be.visible')
            .should('have.attr', 'ng-reflect-input-weight-value', '90');
    });

    it('should persist the goal and weight data in localStorage', () => {
        expect(localStorage.getItem('user_data')).to.exist;
        expect(localStorage.getItem('weight_data_weights')).to.exist;
    });
});
