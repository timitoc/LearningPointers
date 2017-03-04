import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CountryMySuffix } from './country-my-suffix.model';
import { CountryMySuffixService } from './country-my-suffix.service';

@Component({
    selector: 'jhi-country-my-suffix-detail',
    templateUrl: './country-my-suffix-detail.component.html'
})
export class CountryMySuffixDetailComponent implements OnInit, OnDestroy {

    country: CountryMySuffix;
    private subscription: any;

    constructor(
        private countryService: CountryMySuffixService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['id']);
        });
    }

    load (id) {
        this.countryService.find(id).subscribe(country => {
            this.country = country;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
