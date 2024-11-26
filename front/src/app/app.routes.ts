import { Routes } from '@angular/router';


import { HomePageComponent } from './features/home-page/home-page.component';

import { NotFoundComponent } from './features/not-found/not-found.component';
import { LoginPageComponent } from './features/login-page/login-page.component';
import { RegisterPageComponent } from './features/register-page/register-page.component';
import { SearchPageComponent } from './features/search-page/search-page.component';
import { ReviewPageComponent } from './features/review-page/review-page.component';


import { AuthGuard } from './core/guards/auth.guard';
import { NoAuthGuard } from './core/guards/no-auth.guard';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TripsComponent } from './features/trips/trips.component';
import { TripDetailComponent } from './features/trip-detail/trip-detail.component';
import { ProfilePageComponent } from './features/profile-page/profile-page.component';
import { FeedComponent } from './features/feed/feed.component';





export const routes: Routes = [

    { path: '', component: HomePageComponent,},

    { path: 'login', component: LoginPageComponent, canActivate: [NoAuthGuard]},
    { path: 'register', component: RegisterPageComponent, canActivate: [NoAuthGuard]},
    { path: 'search', component: SearchPageComponent, canActivate: [AuthGuard] },
    { path: 'review', component: ReviewPageComponent, canActivate: [AuthGuard] },
    { path: 'dashboard', component:DashboardComponent, canActivate: [AuthGuard]},
    { path: 'trips', component:TripsComponent, canActivate: [AuthGuard]},
    { path: 'itinerary/:id', component:TripDetailComponent, canActivate: [AuthGuard] }, // Route pour les détails
    { path: 'profile', component: ProfilePageComponent, canActivate: [AuthGuard]},
    { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] },
    { path: '**', component: NotFoundComponent},

];
