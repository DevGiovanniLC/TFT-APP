let LOCAL_STORAGE_SNAPSHOT = {};

describe('Start application without a goal (E2E)', () => {
    before(() => {
        cy.visit('tabs/tab1');
        cy.get('#nextBtn').click();
        cy.wait(100);
        cy.get('ion-picker-column-option[ng-reflect-value="100"]').realClick(); // Peso inicial

        cy.get('#nextBtn').click();
        cy.get('#nextBtn').click();
        cy.get('#confirmBtn').click();
    });

    beforeEach(() => {
        cy.visit('tabs/tab1');
        Object.keys(LOCAL_STORAGE_SNAPSHOT).forEach((key) => {
            localStorage.setItem(key, LOCAL_STORAGE_SNAPSHOT[key]);
        });
    });

    it('should not show "View Goal" as chart display mode when no goal is set', () => {
        LOCAL_STORAGE_SNAPSHOT = { ...localStorage };
        cy.get('#chartMode').click();
        cy.get('.sc-ion-select-popover-md').contains('View Goal').should('not.exist');
        cy.get('.sc-ion-select-popover-md').contains('Total').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Week').should('be.visible');
        cy.get('.sc-ion-select-popover-md').contains('Last Month').should('be.visible');
    });

    it('should show current weight pre-filled in weight registration form', () => {
        cy.get('#registerBtn').click();
        cy.get('app-weight-form')
            .should('be.visible')
            .should('have.attr', 'ng-reflect-input-weight-value', '100');
    });

    it('should keep localStorage values consistent without goal', () => {
        expect(localStorage.getItem('weight_data_weights')).to.exist;
        expect(localStorage.getItem('user_data')).to.exist;
    });

    it('should show starting weight no goal selected', () => {
        cy.get('#startingWeight').should('have.text', ' 100 kg ');
        cy.get('#startingDate').should('have.text', ' 30/05/2025 ');
    })

    it('should show goal weight no goal selected', () => {
        cy.get('#goalWeight').should('not.exist');
        cy.get('#goalDate').should('not.exist');
        cy.pause();
    })

    context('Chart Tests', () => {
        it('should render current weight chart without progress indicator', () => {
            // cy.captureCanvasImage('#doughnutChart canvas', 'doughnut-chart.png');
            cy.compareCanvasImage('#doughnutChart canvas', 'doughnut-chart.png', 'diff-doughnutChart.png');
        });

        it('should display "Total" weight log chart without a defined goal', () => {
            cy.get('#chartMode').click();
            cy.get('.sc-ion-select-popover-md').contains('Total').click();

            // cy.captureCanvasImage('#lineChart canvas', 'line-chart-total.png');
            cy.compareCanvasImage('#lineChart canvas', 'line-chart-total.png', 'diff-line-chart-total.png');
        });

        it('should show "Last Week" weight log chart correctly when no goal is set', () => {
            cy.get('#chartMode').click();
            cy.get('.sc-ion-select-popover-md').contains('Last Week').click();

            // cy.captureCanvasImage('#lineChart canvas', 'line-chart-week.png');
            cy.compareCanvasImage('#lineChart canvas', 'line-chart-week.png', 'diff-line-chart-last-week.png');
        });

        it('should show "Last Month" weight log chart correctly when no goal is set', () => {
            cy.get('#chartMode').click();
            cy.get('.sc-ion-select-popover-md').contains('Last Month').click();

            // cy.captureCanvasImage('#lineChart canvas', 'line-chart-month.png');
            cy.compareCanvasImage('#lineChart canvas', 'line-chart-month.png', 'diff-line-chart-last-month.png');
        });
    });

});
