import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { JobMySuffixDetailComponent } from '../../../../../../main/webapp/app/entities/job/job-my-suffix-detail.component';
import { JobMySuffixService } from '../../../../../../main/webapp/app/entities/job/job-my-suffix.service';
import { JobMySuffix } from '../../../../../../main/webapp/app/entities/job/job-my-suffix.model';

describe('Component Tests', () => {

    describe('JobMySuffix Management Detail Component', () => {
        let comp: JobMySuffixDetailComponent;
        let fixture: ComponentFixture<JobMySuffixDetailComponent>;
        let service: JobMySuffixService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [JobMySuffixDetailComponent],
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
                    JobMySuffixService
                ]
            }).overrideComponent(JobMySuffixDetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(JobMySuffixDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(JobMySuffixService);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new JobMySuffix(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.job).toEqual(jasmine.objectContaining({id:10}));
            });
        });
    });

});
