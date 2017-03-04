import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { TaskMySuffixComponent } from './task-my-suffix.component';
import { TaskMySuffixDetailComponent } from './task-my-suffix-detail.component';
import { TaskMySuffixPopupComponent } from './task-my-suffix-dialog.component';
import { TaskMySuffixDeletePopupComponent } from './task-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const taskRoute: Routes = [
  {
    path: 'task-my-suffix',
    component: TaskMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Tasks'
    }
  }, {
    path: 'task-my-suffix/:id',
    component: TaskMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Tasks'
    }
  }
];

export const taskPopupRoute: Routes = [
  {
    path: 'task-my-suffix-new',
    component: TaskMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Tasks'
    },
    outlet: 'popup'
  },
  {
    path: 'task-my-suffix/:id/edit',
    component: TaskMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Tasks'
    },
    outlet: 'popup'
  },
  {
    path: 'task-my-suffix/:id/delete',
    component: TaskMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Tasks'
    },
    outlet: 'popup'
  }
];
