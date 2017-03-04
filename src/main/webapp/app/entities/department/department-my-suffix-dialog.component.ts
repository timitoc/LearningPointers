import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { DepartmentMySuffix } from './department-my-suffix.model';
import { DepartmentMySuffixPopupService } from './department-my-suffix-popup.service';
import { DepartmentMySuffixService } from './department-my-suffix.service';
import { LocationMySuffix, LocationMySuffixService } from '../location';
import { EmployeeMySuffix, EmployeeMySuffixService } from '../employee';
@Component({
    selector: 'jhi-department-my-suffix-dialog',
    templateUrl: './department-my-suffix-dialog.component.html'
})
export class DepartmentMySuffixDialogComponent implements OnInit {

    department: DepartmentMySuffix;
    authorities: any[];
    isSaving: boolean;

    locations: LocationMySuffix[];

    employees: EmployeeMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private departmentService: DepartmentMySuffixService,
        private locationService: LocationMySuffixService,
        private employeeService: EmployeeMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.locationService.query({filter: 'department-is-null'}).subscribe((res: Response) => {
            if (!this.department.locationId) {
                this.locations = res.json();
            } else {
                this.locationService.find(this.department.locationId).subscribe((subRes: LocationMySuffix) => {
                    this.locations = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
        this.employeeService.query().subscribe(
            (res: Response) => { this.employees = res.json(); }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.department.id !== undefined) {
            this.departmentService.update(this.department)
                .subscribe((res: DepartmentMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.departmentService.create(this.department)
                .subscribe((res: DepartmentMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: DepartmentMySuffix) {
        this.eventManager.broadcast({ name: 'departmentListModification', content: 'OK'});
        this.isSaving = false;
        this.activeModal.dismiss(result);
    }

    private onSaveError (error) {
        this.isSaving = false;
        this.onError(error);
    }

    private onError (error) {
        this.alertService.error(error.message, null, null);
    }

    trackLocationById(index: number, item: LocationMySuffix) {
        return item.id;
    }

    trackEmployeeById(index: number, item: EmployeeMySuffix) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-department-my-suffix-popup',
    template: ''
})
export class DepartmentMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private departmentPopupService: DepartmentMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.departmentPopupService
                    .open(DepartmentMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.departmentPopupService
                    .open(DepartmentMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
