import { Routes } from "@angular/router";
import { OffersList } from "./offers-list/offers-list";
import { AddOffer } from "./add-offer/add-offer";
import { MyOffers } from "./my-offers/my-offers";
import { Agreement } from "./agreement/agreement";

export const offersRoutes: Routes = [
    { path: '', component: OffersList },
    { path: 'agreement', component: Agreement },
    { path: 'add', component: AddOffer },
    { path: 'my-offers', component: MyOffers },
    { path: 'edit/:id', component: AddOffer },
];