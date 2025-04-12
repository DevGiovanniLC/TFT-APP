import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./pages/tabsPage/tabs/tabs.routes').then((m) => m.routes),
    },
    {
        path: 'initial',
        loadComponent: () => import('./pages/initialPage/initial.page').then((m) => m.InitialPage),
    },
];
