import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { CountryMySuffix } from './country-my-suffix.model';
import { CountryMySuffixPopupService } from './country-my-suffix-popup.service';
import { CountryMySuffixService } from './country-my-suffix.service';
import { RegionMySuffix, RegionMySuffixService } from '../region';
@Component({
    selector: 'jhi-country-my-suffix-dialog',
    templateUrl: './country-my-suffix-dialog.component.html'
})
export class CountryMySuffixDialogComponent implements OnInit {

    country: CountryMySuffix;
    authorities: any[];
    isSaving: boolean;

    regions: RegionMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private countryService: CountryMySuffixService,
        private regionService: RegionMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.regionService.query({filter: 'country-is-null'}).subscribe((res: Response) => {
            if (!this.country.regionId) {
                this.regions = res.json();
            } else {
                this.regionService.find(this.country.regionId).subscribe((subRes: RegionMySuffix) => {
                    this.regions = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.country.id !== undefined) {
            this.countryService.update(this.country)
                .subscribe((res: CountryMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.countryService.create(this.country)
                .subscribe((res: CountryMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: CountryMySuffix) {
        this.eventManager.broadcast({ name: 'countryListModification', content: 'OK'});
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

    trackRegionById(index: number, item: RegionMySuffix) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-country-my-suffix-popup',
    template: ''
})
export class CountryMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private countryPopupService: CountryMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.countryPopupService
                    .open(CountryMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.countryPopupService
                    .open(CountryMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
