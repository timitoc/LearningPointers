import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { LocationMySuffixComponent } from './location-my-suffix.component';
import { LocationMySuffixDetailComponent } from './location-my-suffix-detail.component';
import { LocationMySuffixPopupComponent } from './location-my-suffix-dialog.component';
import { LocationMySuffixDeletePopupComponent } from './location-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const locationRoute: Routes = [
  {
    path: 'location-my-suffix',
    component: LocationMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Locations'
    }
  }, {
    path: 'location-my-suffix/:id',
    component: LocationMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Locations'
    }
  }
];

export const locationPopupRoute: Routes = [
  {
    path: 'location-my-suffix-new',
    component: LocationMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Locations'
    },
    outlet: 'popup'
  },
  {
    path: 'location-my-suffix/:id/edit',
    component: LocationMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Locations'
    },
    outlet: 'popup'
  },
  {
    path: 'location-my-suffix/:id/delete',
    component: LocationMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Locations'
    },
    outlet: 'popup'
  }
];
