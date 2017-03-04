import { Injectable } from '@angular/core';
import { Http, Response, URLSearchParams, BaseRequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import { JobHistoryMySuffix } from './job-history-my-suffix.model';
import { DateUtils } from 'ng-jhipster';
@Injectable()
export class JobHistoryMySuffixService {

    private resourceUrl = 'api/job-histories';

    constructor(private http: Http, private dateUtils: DateUtils) { }

    create(jobHistory: JobHistoryMySuffix): Observable<JobHistoryMySuffix> {
        let copy: JobHistoryMySuffix = Object.assign({}, jobHistory);
        copy.startDate = this.dateUtils.toDate(jobHistory.startDate);
        copy.endDate = this.dateUtils.toDate(jobHistory.endDate);
        return this.http.post(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    update(jobHistory: JobHistoryMySuffix): Observable<JobHistoryMySuffix> {
        let copy: JobHistoryMySuffix = Object.assign({}, jobHistory);

        copy.startDate = this.dateUtils.toDate(jobHistory.startDate);

        copy.endDate = this.dateUtils.toDate(jobHistory.endDate);
        return this.http.put(this.resourceUrl, copy).map((res: Response) => {
            return res.json();
        });
    }

    find(id: number): Observable<JobHistoryMySuffix> {
        return this.http.get(`${this.resourceUrl}/${id}`).map((res: Response) => {
            let jsonResponse = res.json();
            jsonResponse.startDate = this.dateUtils
                .convertDateTimeFromServer(jsonResponse.startDate);
            jsonResponse.endDate = this.dateUtils
                .convertDateTimeFromServer(jsonResponse.endDate);
            return jsonResponse;
        });
    }

    query(req?: any): Observable<Response> {
        let options = this.createRequestOption(req);
        return this.http.get(this.resourceUrl, options)
            .map((res: any) => this.convertResponse(res))
        ;
    }

    delete(id: number): Observable<Response> {
        return this.http.delete(`${this.resourceUrl}/${id}`);
    }


    private convertResponse(res: any): any {
        let jsonResponse = res.json();
        for (let i = 0; i < jsonResponse.length; i++) {
            jsonResponse[i].startDate = this.dateUtils
                .convertDateTimeFromServer(jsonResponse[i].startDate);
            jsonResponse[i].endDate = this.dateUtils
                .convertDateTimeFromServer(jsonResponse[i].endDate);
        }
        res._body = jsonResponse;
        return res;
    }

    private createRequestOption(req?: any): BaseRequestOptions {
        let options: BaseRequestOptions = new BaseRequestOptions();
        if (req) {
            let params: URLSearchParams = new URLSearchParams();
            params.set('page', req.page);
            params.set('size', req.size);
            if (req.sort) {
                params.paramsMap.set('sort', req.sort);
            }
            params.set('query', req.query);

            options.search = params;
        }
        return options;
    }
}
