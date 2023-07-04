/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreatePlaylistRequest } from '../models/CreatePlaylistRequest';
import type { Playlist } from '../models/Playlist';

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

    /**
     * @param authorization
     * @returns any Success
     * @throws ApiError
     */
    public indexControllerGetSavedTracks(
        authorization?: string,
    ): CancelablePromise<any> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/saved-tracks',
            headers: {
                'Authorization': authorization,
            },
        });
    }

    /**
     * @param userId
     * @param limit
     * @param offset
     * @returns Playlist Success
     * @throws ApiError
     */
    public indexControllerGetPlaylist(
        userId: string,
        limit: number = 50,
        offset?: number,
    ): CancelablePromise<Array<Playlist>> {
        return this.httpRequest.request({
            method: 'GET',
            url: '/rest/{user_id}/playlist',
            path: {
                'user_id': userId,
            },
            query: {
                'limit': limit,
                'offset': offset,
            },
        });
    }

    /**
     * @param userId
     * @param requestBody
     * @returns Playlist Success
     * @throws ApiError
     */
    public indexControllerCreatePlaylist(
        userId: string,
        requestBody?: {
            createPlaylistRequest?: CreatePlaylistRequest;
        },
    ): CancelablePromise<Playlist> {
        return this.httpRequest.request({
            method: 'POST',
            url: '/rest/{user_id}/playlist/create',
            path: {
                'user_id': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
