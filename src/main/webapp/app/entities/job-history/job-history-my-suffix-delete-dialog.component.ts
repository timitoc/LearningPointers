import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager } from 'ng-jhipster';

import { JobHistoryMySuffix } from './job-history-my-suffix.model';
import { JobHistoryMySuffixPopupService } from './job-history-my-suffix-popup.service';
import { JobHistoryMySuffixService } from './job-history-my-suffix.service';

@Component({
    selector: 'jhi-job-history-my-suffix-delete-dialog',
    templateUrl: './job-history-my-suffix-delete-dialog.component.html'
})
export class JobHistoryMySuffixDeleteDialogComponent {

    jobHistory: JobHistoryMySuffix;

    constructor(
        private jobHistoryService: JobHistoryMySuffixService,
        public activeModal: NgbActiveModal,
        private eventManager: EventManager
    ) {
    }

    clear () {
        this.activeModal.dismiss('cancel');
    }

    confirmDelete (id: number) {
        this.jobHistoryService.delete(id).subscribe(response => {
            this.eventManager.broadcast({
                name: 'jobHistoryListModification',
                content: 'Deleted an jobHistory'
            });
            this.activeModal.dismiss(true);
        });
    }
}

@Component({
    selector: 'jhi-job-history-my-suffix-delete-popup',
    template: ''
})
export class JobHistoryMySuffixDeletePopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private jobHistoryPopupService: JobHistoryMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            this.modalRef = this.jobHistoryPopupService
                .open(JobHistoryMySuffixDeleteDialogComponent, params['id']);
        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
