import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
    {
        path: 'tabs',
        component: TabsPage,
        children: [
            {
                path: 'tab1',
                loadComponent: () => import('../homePage/home.page').then((m) => m.HomePage),
            },
            {
                path: 'tab2',
                loadComponent: () => import('../registerPage/register.page').then((m) => m.RegisterPage),
            },
            {
                path: 'tab3',
                loadComponent: () => import('../bmiPage/bmi.page').then((m) => m.BMIPage),
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
