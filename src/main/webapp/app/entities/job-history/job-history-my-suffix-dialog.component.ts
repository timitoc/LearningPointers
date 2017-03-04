import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { JobHistoryMySuffix } from './job-history-my-suffix.model';
import { JobHistoryMySuffixPopupService } from './job-history-my-suffix-popup.service';
import { JobHistoryMySuffixService } from './job-history-my-suffix.service';
import { JobMySuffix, JobMySuffixService } from '../job';
import { DepartmentMySuffix, DepartmentMySuffixService } from '../department';
import { EmployeeMySuffix, EmployeeMySuffixService } from '../employee';
@Component({
    selector: 'jhi-job-history-my-suffix-dialog',
    templateUrl: './job-history-my-suffix-dialog.component.html'
})
export class JobHistoryMySuffixDialogComponent implements OnInit {

    jobHistory: JobHistoryMySuffix;
    authorities: any[];
    isSaving: boolean;

    jobs: JobMySuffix[];

    departments: DepartmentMySuffix[];

    employees: EmployeeMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private jobHistoryService: JobHistoryMySuffixService,
        private jobService: JobMySuffixService,
        private departmentService: DepartmentMySuffixService,
        private employeeService: EmployeeMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.jobService.query({filter: 'jobhistory-is-null'}).subscribe((res: Response) => {
            if (!this.jobHistory.jobId) {
                this.jobs = res.json();
            } else {
                this.jobService.find(this.jobHistory.jobId).subscribe((subRes: JobMySuffix) => {
                    this.jobs = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
        this.departmentService.query({filter: 'jobhistory-is-null'}).subscribe((res: Response) => {
            if (!this.jobHistory.departmentId) {
                this.departments = res.json();
            } else {
                this.departmentService.find(this.jobHistory.departmentId).subscribe((subRes: DepartmentMySuffix) => {
                    this.departments = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
        this.employeeService.query({filter: 'jobhistory-is-null'}).subscribe((res: Response) => {
            if (!this.jobHistory.employeeId) {
                this.employees = res.json();
            } else {
                this.employeeService.find(this.jobHistory.employeeId).subscribe((subRes: EmployeeMySuffix) => {
                    this.employees = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.jobHistory.id !== undefined) {
            this.jobHistoryService.update(this.jobHistory)
                .subscribe((res: JobHistoryMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.jobHistoryService.create(this.jobHistory)
                .subscribe((res: JobHistoryMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: JobHistoryMySuffix) {
        this.eventManager.broadcast({ name: 'jobHistoryListModification', content: 'OK'});
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

    trackJobById(index: number, item: JobMySuffix) {
        return item.id;
    }

    trackDepartmentById(index: number, item: DepartmentMySuffix) {
        return item.id;
    }

    trackEmployeeById(index: number, item: EmployeeMySuffix) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-job-history-my-suffix-popup',
    template: ''
})
export class JobHistoryMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private jobHistoryPopupService: JobHistoryMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.jobHistoryPopupService
                    .open(JobHistoryMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.jobHistoryPopupService
                    .open(JobHistoryMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
