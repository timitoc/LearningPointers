import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { JobMySuffix } from './job-my-suffix.model';
import { JobMySuffixService } from './job-my-suffix.service';

@Component({
    selector: 'jhi-job-my-suffix-detail',
    templateUrl: './job-my-suffix-detail.component.html'
})
export class JobMySuffixDetailComponent implements OnInit, OnDestroy {

    job: JobMySuffix;
    private subscription: any;

    constructor(
        private jobService: JobMySuffixService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['id']);
        });
    }

    load (id) {
        this.jobService.find(id).subscribe(job => {
            this.job = job;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
