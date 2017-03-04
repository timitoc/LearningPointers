import { ComponentFixture, TestBed, async, inject } from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { Http, BaseRequestOptions } from '@angular/http';
import { OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Rx';
import { DateUtils, DataUtils } from 'ng-jhipster';
import { MockActivatedRoute } from '../../../helpers/mock-route.service';
import { CountryMySuffixDetailComponent } from '../../../../../../main/webapp/app/entities/country/country-my-suffix-detail.component';
import { CountryMySuffixService } from '../../../../../../main/webapp/app/entities/country/country-my-suffix.service';
import { CountryMySuffix } from '../../../../../../main/webapp/app/entities/country/country-my-suffix.model';

describe('Component Tests', () => {

    describe('CountryMySuffix Management Detail Component', () => {
        let comp: CountryMySuffixDetailComponent;
        let fixture: ComponentFixture<CountryMySuffixDetailComponent>;
        let service: CountryMySuffixService;

        beforeEach(async(() => {
            TestBed.configureTestingModule({
                declarations: [CountryMySuffixDetailComponent],
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
                    CountryMySuffixService
                ]
            }).overrideComponent(CountryMySuffixDetailComponent, {
                set: {
                    template: ''
                }
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(CountryMySuffixDetailComponent);
            comp = fixture.componentInstance;
            service = fixture.debugElement.injector.get(CountryMySuffixService);
        });


        describe('OnInit', () => {
            it('Should call load all on init', () => {
            // GIVEN

            spyOn(service, 'find').and.returnValue(Observable.of(new CountryMySuffix(10)));

            // WHEN
            comp.ngOnInit();

            // THEN
            expect(service.find).toHaveBeenCalledWith(123);
            expect(comp.country).toEqual(jasmine.objectContaining({id:10}));
            });
        });
    });

});
