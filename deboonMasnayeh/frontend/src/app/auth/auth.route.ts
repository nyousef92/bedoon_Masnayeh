import { Routes } from "@angular/router";
import { UnauthenticatedGuard } from "../core/guards/unauthenticated.guard";
import { LoginComponent } from "./login/login";
import { ProfileComponent } from "./auth-base/profile/profile";
import { AuthenticatedGuard } from "../core/guards/authenticated.guard";

export const authRoutes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'login', component: LoginComponent,
        canActivate: [UnauthenticatedGuard],
    },
    {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthenticatedGuard],
    },

];