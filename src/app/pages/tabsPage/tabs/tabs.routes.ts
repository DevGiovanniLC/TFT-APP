import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'tab1',
                loadComponent: () => import('../home/home.page').then((m) => m.HomePage),
            },
            {
                path: 'tab2',
                loadComponent: () => import('../register/register.page').then((m) => m.RegisterPage),
            },
            {
                path: 'tab3',
                loadComponent: () => import('../bmi/bmi.page').then((m) => m.BMIPage),
            },
            {
                path: 'tab4',
                loadComponent: () => import('../analytics/analytics.page').then((m) => m.AnaliticsPage),
            },
            {
                path: '',
                redirectTo: '/tabs/tab1',
                pathMatch: 'full',
            },
        ],
    },
    {
        path: '',
        redirectTo: '/tabs/tab1',
        pathMatch: 'full',
    },
];
