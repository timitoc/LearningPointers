import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { CountryMySuffixComponent } from './country-my-suffix.component';
import { CountryMySuffixDetailComponent } from './country-my-suffix-detail.component';
import { CountryMySuffixPopupComponent } from './country-my-suffix-dialog.component';
import { CountryMySuffixDeletePopupComponent } from './country-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const countryRoute: Routes = [
  {
    path: 'country-my-suffix',
    component: CountryMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Countries'
    }
  }, {
    path: 'country-my-suffix/:id',
    component: CountryMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Countries'
    }
  }
];

export const countryPopupRoute: Routes = [
  {
    path: 'country-my-suffix-new',
    component: CountryMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Countries'
    },
    outlet: 'popup'
  },
  {
    path: 'country-my-suffix/:id/edit',
    component: CountryMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Countries'
    },
    outlet: 'popup'
  },
  {
    path: 'country-my-suffix/:id/delete',
    component: CountryMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Countries'
    },
    outlet: 'popup'
  }
];
