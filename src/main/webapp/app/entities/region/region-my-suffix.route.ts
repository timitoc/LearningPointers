import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { RegionMySuffixComponent } from './region-my-suffix.component';
import { RegionMySuffixDetailComponent } from './region-my-suffix-detail.component';
import { RegionMySuffixPopupComponent } from './region-my-suffix-dialog.component';
import { RegionMySuffixDeletePopupComponent } from './region-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const regionRoute: Routes = [
  {
    path: 'region-my-suffix',
    component: RegionMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Regions'
    }
  }, {
    path: 'region-my-suffix/:id',
    component: RegionMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Regions'
    }
  }
];

export const regionPopupRoute: Routes = [
  {
    path: 'region-my-suffix-new',
    component: RegionMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Regions'
    },
    outlet: 'popup'
  },
  {
    path: 'region-my-suffix/:id/edit',
    component: RegionMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Regions'
    },
    outlet: 'popup'
  },
  {
    path: 'region-my-suffix/:id/delete',
    component: RegionMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Regions'
    },
    outlet: 'popup'
  }
];
