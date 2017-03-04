import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Routes, CanActivate } from '@angular/router';

import { UserRouteAccessService } from '../../shared';
import { PaginationUtil } from 'ng-jhipster';

import { JobMySuffixComponent } from './job-my-suffix.component';
import { JobMySuffixDetailComponent } from './job-my-suffix-detail.component';
import { JobMySuffixPopupComponent } from './job-my-suffix-dialog.component';
import { JobMySuffixDeletePopupComponent } from './job-my-suffix-delete-dialog.component';

import { Principal } from '../../shared';

@Injectable()
export class JobMySuffixResolvePagingParams implements Resolve<any> {

  constructor(private paginationUtil: PaginationUtil) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
      let page = route.queryParams['page'] ? route.queryParams['page'] : '1';
      let sort = route.queryParams['sort'] ? route.queryParams['sort'] : 'id,asc';
      return {
          page: this.paginationUtil.parsePage(page),
          predicate: this.paginationUtil.parsePredicate(sort),
          ascending: this.paginationUtil.parseAscending(sort)
    };
  }
}

export const jobRoute: Routes = [
  {
    path: 'job-my-suffix',
    component: JobMySuffixComponent,
    resolve: {
      'pagingParams': JobMySuffixResolvePagingParams
    },
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Jobs'
    }
  }, {
    path: 'job-my-suffix/:id',
    component: JobMySuffixDetailComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Jobs'
    }
  }
];

export const jobPopupRoute: Routes = [
  {
    path: 'job-my-suffix-new',
    component: JobMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Jobs'
    },
    outlet: 'popup'
  },
  {
    path: 'job-my-suffix/:id/edit',
    component: JobMySuffixPopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Jobs'
    },
    outlet: 'popup'
  },
  {
    path: 'job-my-suffix/:id/delete',
    component: JobMySuffixDeletePopupComponent,
    data: {
        authorities: ['ROLE_USER'],
        pageTitle: 'Jobs'
    },
    outlet: 'popup'
  }
];
