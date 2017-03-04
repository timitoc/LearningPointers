import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { TaskMySuffixDetailComponent } from '../../../../../../main/webapp/app/entities/task/task-my-suffix-detail.component';
import { TaskMySuffixService } from '../../../../../../main/webapp/app/entities/task/task-my-suffix.service';
import { TaskMySuffix } from '../../../../../../main/webapp/app/entities/task/task-my-suffix.model';

describe('Component Tests', () => {

    describe('TaskMySuffix Management Detail Component', () => {
        let comp: TaskMySuffixDetailComponent;
        let fixture: ComponentFixture<TaskMySuffixDetailComponent>;
        let service: TaskMySuffixService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [TaskMySuffixDetailComponent],
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
                    TaskMySuffixService
                ]
            }).overrideComponent(TaskMySuffixDetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(TaskMySuffixDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(TaskMySuffixService);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new TaskMySuffix(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.task).toEqual(jasmine.objectContaining({id:10}));
            });
        });
    });

});
