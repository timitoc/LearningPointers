import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeMySuffix } from './employee-my-suffix.model';
import { EmployeeMySuffixService } from './employee-my-suffix.service';

@Component({
    selector: 'jhi-employee-my-suffix-detail',
    templateUrl: './employee-my-suffix-detail.component.html'
})
export class EmployeeMySuffixDetailComponent implements OnInit, OnDestroy {

    employee: EmployeeMySuffix;
    private subscription: any;

    constructor(
        private employeeService: EmployeeMySuffixService,
        private route: ActivatedRoute
    ) {
    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            this.load(params['id']);
        });
    }

    load (id) {
        this.employeeService.find(id).subscribe(employee => {
            this.employee = employee;
        });
    }
    previousState() {
        window.history.back();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

}
