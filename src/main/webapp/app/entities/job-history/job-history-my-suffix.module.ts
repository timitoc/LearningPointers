import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';

import { App1SharedModule } from '../../shared';

import {
    JobHistoryMySuffixService,
    JobHistoryMySuffixPopupService,
    JobHistoryMySuffixComponent,
    JobHistoryMySuffixDetailComponent,
    JobHistoryMySuffixDialogComponent,
    JobHistoryMySuffixPopupComponent,
    JobHistoryMySuffixDeletePopupComponent,
    JobHistoryMySuffixDeleteDialogComponent,
    jobHistoryRoute,
    jobHistoryPopupRoute,
} from './';

let ENTITY_STATES = [
    ...jobHistoryRoute,
    ...jobHistoryPopupRoute,
];

@NgModule({
    imports: [
        App1SharedModule,
        RouterModule.forRoot(ENTITY_STATES, { useHash: true })
    ],
    declarations: [
        JobHistoryMySuffixComponent,
        JobHistoryMySuffixDetailComponent,
        JobHistoryMySuffixDialogComponent,
        JobHistoryMySuffixDeleteDialogComponent,
        JobHistoryMySuffixPopupComponent,
        JobHistoryMySuffixDeletePopupComponent,
    ],
    entryComponents: [
        JobHistoryMySuffixComponent,
        JobHistoryMySuffixDialogComponent,
        JobHistoryMySuffixPopupComponent,
        JobHistoryMySuffixDeleteDialogComponent,
        JobHistoryMySuffixDeletePopupComponent,
    ],
    providers: [
        JobHistoryMySuffixService,
        JobHistoryMySuffixPopupService,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class App1JobHistoryMySuffixModule {}
