/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ProfileResponse } from '../models/ProfileResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';

export class AuthControllerService {

    constructor(public readonly httpRequest: BaseHttpRequest) {}

    /**
     * @returns any Success
     * @throws ApiError
     */
    public authControllerLogin(): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/auth/login',
        });
    }

    /**
     * @param code
     * @param state
     * @param error
     * @returns any Success
     * @throws ApiError
     */
    public authControllerRedirect(
        code?: string,
        state?: string,
        error?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/auth/redirect',
            query: {
                'code': code,
                'state': state,
                'error': error,
            },
        });
    }

    /**
     * Grab the user's Spotify and Tubo profile. Refreshes access token if needed.
     * @param requestBody
     * @returns ProfileResponse Success
     * @throws ApiError
     */
    public authControllerProfile(
        requestBody?: {
            userId?: string;
        },
    ): CancelablePromise<ProfileResponse> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/auth/profile',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
