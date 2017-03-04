import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { JobMySuffix } from './job-my-suffix.model';
import { JobMySuffixPopupService } from './job-my-suffix-popup.service';
import { JobMySuffixService } from './job-my-suffix.service';
import { EmployeeMySuffix, EmployeeMySuffixService } from '../employee';
import { TaskMySuffix, TaskMySuffixService } from '../task';
@Component({
    selector: 'jhi-job-my-suffix-dialog',
    templateUrl: './job-my-suffix-dialog.component.html'
})
export class JobMySuffixDialogComponent implements OnInit {

    job: JobMySuffix;
    authorities: any[];
    isSaving: boolean;

    employees: EmployeeMySuffix[];

    tasks: TaskMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private jobService: JobMySuffixService,
        private employeeService: EmployeeMySuffixService,
        private taskService: TaskMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.employeeService.query().subscribe(
            (res: Response) => { this.employees = res.json(); }, (res: Response) => this.onError(res.json()));
        this.taskService.query().subscribe(
            (res: Response) => { this.tasks = res.json(); }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.job.id !== undefined) {
            this.jobService.update(this.job)
                .subscribe((res: JobMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.jobService.create(this.job)
                .subscribe((res: JobMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: JobMySuffix) {
        this.eventManager.broadcast({ name: 'jobListModification', content: 'OK'});
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

    trackEmployeeById(index: number, item: EmployeeMySuffix) {
        return item.id;
    }

    trackTaskById(index: number, item: TaskMySuffix) {
        return item.id;
    }

    getSelected(selectedVals: Array<any>, option: any) {
        if (selectedVals) {
            for (let i = 0; i < selectedVals.length; i++) {
                if (option.id === selectedVals[i].id) {
                    return selectedVals[i];
                }
            }
        }
        return option;
    }
}

@Component({
    selector: 'jhi-job-my-suffix-popup',
    template: ''
})
export class JobMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private jobPopupService: JobMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.jobPopupService
                    .open(JobMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.jobPopupService
                    .open(JobMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
