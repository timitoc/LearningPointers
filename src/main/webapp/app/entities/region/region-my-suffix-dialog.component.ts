import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { RegionMySuffix } from './region-my-suffix.model';
import { RegionMySuffixPopupService } from './region-my-suffix-popup.service';
import { RegionMySuffixService } from './region-my-suffix.service';
@Component({
    selector: 'jhi-region-my-suffix-dialog',
    templateUrl: './region-my-suffix-dialog.component.html'
})
export class RegionMySuffixDialogComponent implements OnInit {

    region: RegionMySuffix;
    authorities: any[];
    isSaving: boolean;
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private regionService: RegionMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.region.id !== undefined) {
            this.regionService.update(this.region)
                .subscribe((res: RegionMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.regionService.create(this.region)
                .subscribe((res: RegionMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: RegionMySuffix) {
        this.eventManager.broadcast({ name: 'regionListModification', content: 'OK'});
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
}

@Component({
    selector: 'jhi-region-my-suffix-popup',
    template: ''
})
export class RegionMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private regionPopupService: RegionMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.regionPopupService
                    .open(RegionMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.regionPopupService
                    .open(RegionMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
