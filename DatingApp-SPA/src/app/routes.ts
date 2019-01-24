import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { ListsComponent } from './lists/lists.component';
import { AuthGuard } from './_guards/auth.guard';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';

// angular routes matches on a first match wins sytem
export const appRoutes: Routes = [
    { path: '', component: HomeComponent },
    {
        path: '',  // would match children. if path was 'dummy' then dummymembers' would match members
        runGuardsAndResolvers: 'always',
        canActivate: [AuthGuard],
        children: [
            { path: 'members', component: MemberListComponent, resolve: { users: MemberListResolver} },
            { path: 'members/:id', component: MemberDetailComponent, resolve: { user: MemberDetailResolver }},
            { path: 'messages', component: MessagesComponent },
            { path: 'lists', component: ListsComponent }
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

// https://github.com/bmayer4/ClientPanel/blob/master/src/app/app-routing.module.ts
// above shows adding a path of '' in beginning and ** for notfound component
