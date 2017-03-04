import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { App1CountryMySuffixModule } from './country/country-my-suffix.module';
import { App1DepartmentMySuffixModule } from './department/department-my-suffix.module';
import { App1EmployeeMySuffixModule } from './employee/employee-my-suffix.module';
import { App1JobMySuffixModule } from './job/job-my-suffix.module';
import { App1JobHistoryMySuffixModule } from './job-history/job-history-my-suffix.module';
import { App1LocationMySuffixModule } from './location/location-my-suffix.module';
import { App1RegionMySuffixModule } from './region/region-my-suffix.module';
import { App1TaskMySuffixModule } from './task/task-my-suffix.module';
/* jhipster-needle-add-entity-module-import - JHipster will add entity modules imports here */

@NgModule({
    imports: [
        App1CountryMySuffixModule,
        App1DepartmentMySuffixModule,
        App1EmployeeMySuffixModule,
        App1JobMySuffixModule,
        App1JobHistoryMySuffixModule,
        App1LocationMySuffixModule,
        App1RegionMySuffixModule,
        App1TaskMySuffixModule,
        /* jhipster-needle-add-entity-module - JHipster will add entity modules here */
    ],
    declarations: [],
    entryComponents: [],
    providers: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App1EntityModule {}
