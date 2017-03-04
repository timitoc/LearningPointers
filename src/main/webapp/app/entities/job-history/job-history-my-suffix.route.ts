import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { JobHistoryMySuffixComponent } from './job-history-my-suffix.component';
import { JobHistoryMySuffixDetailComponent } from './job-history-my-suffix-detail.component';
import { JobHistoryMySuffixPopupComponent } from './job-history-my-suffix-dialog.component';
import { JobHistoryMySuffixDeletePopupComponent } from './job-history-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const jobHistoryRoute: Routes = [
  {
    path: 'job-history-my-suffix',
    component: JobHistoryMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'JobHistories'
    }
  }, {
    path: 'job-history-my-suffix/:id',
    component: JobHistoryMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'JobHistories'
    }
  }
];

export const jobHistoryPopupRoute: Routes = [
  {
    path: 'job-history-my-suffix-new',
    component: JobHistoryMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'JobHistories'
    },
    outlet: 'popup'
  },
  {
    path: 'job-history-my-suffix/:id/edit',
    component: JobHistoryMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'JobHistories'
    },
    outlet: 'popup'
  },
  {
    path: 'job-history-my-suffix/:id/delete',
    component: JobHistoryMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'JobHistories'
    },
    outlet: 'popup'
  }
];
