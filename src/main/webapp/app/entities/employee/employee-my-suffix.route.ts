import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { EmployeeMySuffixComponent } from './employee-my-suffix.component';
import { EmployeeMySuffixDetailComponent } from './employee-my-suffix-detail.component';
import { EmployeeMySuffixPopupComponent } from './employee-my-suffix-dialog.component';
import { EmployeeMySuffixDeletePopupComponent } from './employee-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const employeeRoute: Routes = [
  {
    path: 'employee-my-suffix',
    component: EmployeeMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Employees'
    }
  }, {
    path: 'employee-my-suffix/:id',
    component: EmployeeMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Employees'
    }
  }
];

export const employeePopupRoute: Routes = [
  {
    path: 'employee-my-suffix-new',
    component: EmployeeMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Employees'
    },
    outlet: 'popup'
  },
  {
    path: 'employee-my-suffix/:id/edit',
    component: EmployeeMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Employees'
    },
    outlet: 'popup'
  },
  {
    path: 'employee-my-suffix/:id/delete',
    component: EmployeeMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Employees'
    },
    outlet: 'popup'
  }
];
