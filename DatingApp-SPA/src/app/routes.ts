import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { MemberListComponent } from './members/member-list/member-list.component';
import { MessagesComponent } from './messages/messages.component';
import { ListsComponent } from './lists/lists.component';
import { AuthGuard } from './_guards/auth.guard';
import { MemberDetailComponent } from './members/member-detail/member-detail.component';
import { MemberDetailResolver } from './_resolvers/member-detail.resolver';
import { MemberListResolver } from './_resolvers/member-list.resolver';
import { MemberEditComponent } from './members/member-edit/member-edit/member-edit.component';
import { MemberEditResolver } from './_resolvers/member-edit.resolver';
import { PreventUnsavedChanges } from './_guards/prevent-unsaved-changes.guard';
import { ListsResolver } from './_resolvers/lists.resolver';
import { MessagesResolver } from './_resolvers/messages.resolver';

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
            { path: 'member/edit', component: MemberEditComponent,
                resolve: { user: MemberEditResolver },
                canDeactivate: [PreventUnsavedChanges]},
            { path: 'messages', component: MessagesComponent, resolve: { messages: MessagesResolver }},
            { path: 'lists', component: ListsComponent, resolve: { users: ListsResolver }}
        ]
    },
    { path: '**', redirectTo: '', pathMatch: 'full' }
];

// https://github.com/bmayer4/ClientPanel/blob/master/src/app/app-routing.module.ts
// above shows adding a path of '' in beginning and ** for notfound component
