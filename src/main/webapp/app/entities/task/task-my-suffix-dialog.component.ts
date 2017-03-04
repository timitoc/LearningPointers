import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { TaskMySuffix } from './task-my-suffix.model';
import { TaskMySuffixPopupService } from './task-my-suffix-popup.service';
import { TaskMySuffixService } from './task-my-suffix.service';
import { JobMySuffix, JobMySuffixService } from '../job';
@Component({
    selector: 'jhi-task-my-suffix-dialog',
    templateUrl: './task-my-suffix-dialog.component.html'
})
export class TaskMySuffixDialogComponent implements OnInit {

    task: TaskMySuffix;
    authorities: any[];
    isSaving: boolean;

    jobs: JobMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private taskService: TaskMySuffixService,
        private jobService: JobMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.jobService.query().subscribe(
            (res: Response) => { this.jobs = res.json(); }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.task.id !== undefined) {
            this.taskService.update(this.task)
                .subscribe((res: TaskMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.taskService.create(this.task)
                .subscribe((res: TaskMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: TaskMySuffix) {
        this.eventManager.broadcast({ name: 'taskListModification', content: 'OK'});
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
    selector: 'jhi-task-my-suffix-popup',
    template: ''
})
export class TaskMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private taskPopupService: TaskMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.taskPopupService
                    .open(TaskMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.taskPopupService
                    .open(TaskMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
