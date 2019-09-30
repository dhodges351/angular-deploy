import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from '../home/home.component';
import { BlogPostListComponent } from '../blogPost-list/blogPost-list.component';
import { PageNotFoundComponent } from '../page-not-found/page-not-found.component';
import { ContactUsComponent } from '../contact-us/contact-us.component';
import { AboutComponent } from '../about/about.component';
import { BlogContentComponent } from '../blog-content/blog-content.component';
import { BlogContentListComponent } from '../blog-content-list/blog-content-list.component';
import { BlogContentEditComponent } from '../blog-content-edit/blog-content-edit.component';
import { CallbackComponent } from '../pages/callback/callback.component';
import { AuthGuard } from '../auth/auth.guard';
import { ProfileComponent } from '../pages/profile/profile.component';

const routes: Routes = [
  { path: 'home', component: HomeComponent},  
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'blogPosts', component: BlogPostListComponent, data: { title: 'Blog Posts' } },
  { path: 'contact', component: ContactUsComponent, data: { title: 'Contact Us' } }, 
  { path: 'content/:id', component: BlogContentComponent, data: { title: 'Blog Content' }, },
  { path: 'allBlogContent', component: BlogContentListComponent, data: { title: 'All Blog Content' }, }, 
  { path: 'contentEdit/:id', component: BlogContentEditComponent, data: { title: 'Edit Blog Content' } },  
  { path: 'about', component: AboutComponent, data: { title: 'About' } }, 
  {
    path: 'callback',
    component: CallbackComponent
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },  
  { path: '**', component: PageNotFoundComponent},];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forRoot(routes)
  ],
  exports: [
    RouterModule
  ],
  declarations: []
})
export class RoutingModule { }
