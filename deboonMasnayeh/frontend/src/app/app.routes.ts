import { Routes } from '@angular/router';
import { AuthBaseComponent } from './auth/auth-base/auth-base.component';
import { OffersBase } from './offers/offers-base/offers-base';

export const routes: Routes = [
    {
        path: 'offers',
        component: OffersBase,
        loadChildren: () => import('./offers/offers.route').then(m => m.offersRoutes),

    },
    {
        path: '',
        component: OffersBase,
        loadChildren: () => import('./offers/offers.route').then(m => m.offersRoutes),
    },

    {
        path: 'auth',
        component: AuthBaseComponent,
        loadChildren: () => import('./auth/auth.route').then(m => m.authRoutes),
    },


];
