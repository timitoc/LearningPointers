import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { JobHistoryMySuffixDetailComponent } from '../../../../../../main/webapp/app/entities/job-history/job-history-my-suffix-detail.component';
import { JobHistoryMySuffixService } from '../../../../../../main/webapp/app/entities/job-history/job-history-my-suffix.service';
import { JobHistoryMySuffix } from '../../../../../../main/webapp/app/entities/job-history/job-history-my-suffix.model';

describe('Component Tests', () => {

    describe('JobHistoryMySuffix Management Detail Component', () => {
        let comp: JobHistoryMySuffixDetailComponent;
        let fixture: ComponentFixture<JobHistoryMySuffixDetailComponent>;
        let service: JobHistoryMySuffixService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [JobHistoryMySuffixDetailComponent],
                providers: [
                    MockBackend,
                    BaseRequestOptions,
                    DateUtils,
                    DataUtils,
                    DatePipe,
                    {
                        provide: ActivatedRoute,
                        useValue: new MockActivatedRoute({id: 123})
                    },
                    {
                        provide: Http,
                        useFactory: (backendInstance: MockBackend, defaultOptions: BaseRequestOptions) => {
                            return new Http(backendInstance, defaultOptions);
                        },
                        deps: [MockBackend, BaseRequestOptions]
                    },
                    JobHistoryMySuffixService
                ]
            }).overrideComponent(JobHistoryMySuffixDetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(JobHistoryMySuffixDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(JobHistoryMySuffixService);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new JobHistoryMySuffix(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.jobHistory).toEqual(jasmine.objectContaining({id:10}));
            });
        });
    });

});
