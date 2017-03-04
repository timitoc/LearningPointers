import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Response } from '@angular/http';

import { NgbActiveModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { EventManager, AlertService } from 'ng-jhipster';

import { LocationMySuffix } from './location-my-suffix.model';
import { LocationMySuffixPopupService } from './location-my-suffix-popup.service';
import { LocationMySuffixService } from './location-my-suffix.service';
import { CountryMySuffix, CountryMySuffixService } from '../country';
@Component({
    selector: 'jhi-location-my-suffix-dialog',
    templateUrl: './location-my-suffix-dialog.component.html'
})
export class LocationMySuffixDialogComponent implements OnInit {

    location: LocationMySuffix;
    authorities: any[];
    isSaving: boolean;

    countries: CountryMySuffix[];
    constructor(
        public activeModal: NgbActiveModal,
        private alertService: AlertService,
        private locationService: LocationMySuffixService,
        private countryService: CountryMySuffixService,
        private eventManager: EventManager
    ) {
    }

    ngOnInit() {
        this.isSaving = false;
        this.authorities = ['ROLE_USER', 'ROLE_ADMIN'];
        this.countryService.query({filter: 'location-is-null'}).subscribe((res: Response) => {
            if (!this.location.countryId) {
                this.countries = res.json();
            } else {
                this.countryService.find(this.location.countryId).subscribe((subRes: CountryMySuffix) => {
                    this.countries = [subRes].concat(res.json());
                }, (subRes: Response) => this.onError(subRes.json()));
            }
        }, (res: Response) => this.onError(res.json()));
    }
    clear () {
        this.activeModal.dismiss('cancel');
    }

    save () {
        this.isSaving = true;
        if (this.location.id !== undefined) {
            this.locationService.update(this.location)
                .subscribe((res: LocationMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        } else {
            this.locationService.create(this.location)
                .subscribe((res: LocationMySuffix) => this.onSaveSuccess(res), (res: Response) => this.onSaveError(res.json()));
        }
    }

    private onSaveSuccess (result: LocationMySuffix) {
        this.eventManager.broadcast({ name: 'locationListModification', content: 'OK'});
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

    trackCountryById(index: number, item: CountryMySuffix) {
        return item.id;
    }
}

@Component({
    selector: 'jhi-location-my-suffix-popup',
    template: ''
})
export class LocationMySuffixPopupComponent implements OnInit, OnDestroy {

    modalRef: NgbModalRef;
    routeSub: any;

    constructor (
        private route: ActivatedRoute,
        private locationPopupService: LocationMySuffixPopupService
    ) {}

    ngOnInit() {
        this.routeSub = this.route.params.subscribe(params => {
            if ( params['id'] ) {
                this.modalRef = this.locationPopupService
                    .open(LocationMySuffixDialogComponent, params['id']);
            } else {
                this.modalRef = this.locationPopupService
                    .open(LocationMySuffixDialogComponent);
            }

        });
    }

    ngOnDestroy() {
        this.routeSub.unsubscribe();
    }
}
