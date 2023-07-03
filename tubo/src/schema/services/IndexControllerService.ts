/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class IndexControllerService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Success
     * @throws ApiError
     */
    public indexControllerGet(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest',
        });
    }

}
