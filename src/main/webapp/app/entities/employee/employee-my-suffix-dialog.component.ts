import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { EmployeeMySuffix } from './employee-my-suffix.model';
import { EmployeeMySuffixPopupService } from './employee-my-suffix-popup.service';
import { EmployeeMySuffixService } from './employee-my-suffix.service';
import { DepartmentMySuffix, DepartmentMySuffixService } from '../department';
import { JobMySuffix, JobMySuffixService } from '../job';
@Component({
    selector: 'jhi-employee-my-suffix-dialog',
    templateUrl: './employee-my-suffix-dialog.component.html'
})
export class EmployeeMySuffixDialogComponent implements OnInit {

    employee: EmployeeMySuffix;
    authorities: any[];
    isSaving: boolean;

    departments: DepartmentMySuffix[];

    jobs: JobMySuffix[];

    employees: EmployeeMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private employeeService: EmployeeMySuffixService,
        private departmentService: DepartmentMySuffixService,
        private jobService: JobMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.departmentService.query().subscribe(
            (res: Response) => { this.departments = res.json(); }, (res: Response) => this.onError(res.json()));
        this.jobService.query().subscribe(
            (res: Response) => { this.jobs = res.json(); }, (res: Response) => this.onError(res.json()));
        this.employeeService.query().subscribe(
            (res: Response) => { this.employees = res.json(); }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.employee.id !== undefined) {
            this.employeeService.update(this.employee)
                .subscribe((res: EmployeeMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.employeeService.create(this.employee)
                .subscribe((res: EmployeeMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: EmployeeMySuffix) {
        this.eventManager.broadcast({ name: 'employeeListModification', content: 'OK'});
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

    trackDepartmentById(index: number, item: DepartmentMySuffix) {
        return item.id;
    }

    trackJobById(index: number, item: JobMySuffix) {
        return item.id;
    }

    trackEmployeeById(index: number, item: EmployeeMySuffix) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-employee-my-suffix-popup',
    template: ''
})
export class EmployeeMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private employeePopupService: EmployeeMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.employeePopupService
                    .open(EmployeeMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.employeePopupService
                    .open(EmployeeMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
