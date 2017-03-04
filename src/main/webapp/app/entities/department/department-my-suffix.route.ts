import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { DepartmentMySuffixComponent } from './department-my-suffix.component';
import { DepartmentMySuffixDetailComponent } from './department-my-suffix-detail.component';
import { DepartmentMySuffixPopupComponent } from './department-my-suffix-dialog.component';
import { DepartmentMySuffixDeletePopupComponent } from './department-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';


export const departmentRoute: Routes = [
  {
    path: 'department-my-suffix',
    component: DepartmentMySuffixComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Departments'
    }
  }, {
    path: 'department-my-suffix/:id',
    component: DepartmentMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Departments'
    }
  }
];

export const departmentPopupRoute: Routes = [
  {
    path: 'department-my-suffix-new',
    component: DepartmentMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Departments'
    },
    outlet: 'popup'
  },
  {
    path: 'department-my-suffix/:id/edit',
    component: DepartmentMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Departments'
    },
    outlet: 'popup'
  },
  {
    path: 'department-my-suffix/:id/delete',
    component: DepartmentMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Departments'
    },
    outlet: 'popup'
  }
];
