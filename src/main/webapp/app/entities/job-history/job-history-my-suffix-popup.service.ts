import { Injectable, Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DatePipe } from '@angular/common';
import { JobHistoryMySuffix } from './job-history-my-suffix.model';
import { JobHistoryMySuffixService } from './job-history-my-suffix.service';
@Injectable()
export class JobHistoryMySuffixPopupService {
    private isOpen = false;
    constructor (
        private datePipe: DatePipe,
        private modalService: NgbModal,
        private router: Router,
        private jobHistoryService: JobHistoryMySuffixService

    ) {}

    open (component: Component, id?: number | any): NgbModalRef {
        if (this.isOpen) {
            return;
        }
        this.isOpen = true;

        if (id) {
            this.jobHistoryService.find(id).subscribe(jobHistory => {
                jobHistory.startDate = this.datePipe.transform(jobHistory.startDate, 'yyyy-MM-ddThh:mm');
                jobHistory.endDate = this.datePipe.transform(jobHistory.endDate, 'yyyy-MM-ddThh:mm');
                this.jobHistoryModalRef(component, jobHistory);
            });
        } else {
            return this.jobHistoryModalRef(component, new JobHistoryMySuffix());
        }
    }

    jobHistoryModalRef(component: Component, jobHistory: JobHistoryMySuffix): NgbModalRef {
        let modalRef = this.modalService.open(component, { size: 'lg', backdrop: 'static'});
        modalRef.componentInstance.jobHistory = jobHistory;
        modalRef.result.then(result => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
            this.isOpen = false;
        }, (reason) => {
            this.router.navigate([{ outlets: { popup: null }}], { replaceUrl: true });
            this.isOpen = false;
        });
        return modalRef;
    }
}
