import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { DepartmentMySuffixDetailComponent } from '../../../../../../main/webapp/app/entities/department/department-my-suffix-detail.component';
import { DepartmentMySuffixService } from '../../../../../../main/webapp/app/entities/department/department-my-suffix.service';
import { DepartmentMySuffix } from '../../../../../../main/webapp/app/entities/department/department-my-suffix.model';

describe('Component Tests', () => {

    describe('DepartmentMySuffix Management Detail Component', () => {
        let comp: DepartmentMySuffixDetailComponent;
        let fixture: ComponentFixture<DepartmentMySuffixDetailComponent>;
        let service: DepartmentMySuffixService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [DepartmentMySuffixDetailComponent],
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
                    DepartmentMySuffixService
                ]
            }).overrideComponent(DepartmentMySuffixDetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(DepartmentMySuffixDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(DepartmentMySuffixService);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new DepartmentMySuffix(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.department).toEqual(jasmine.objectContaining({id:10}));
            });
        });
    });

});
