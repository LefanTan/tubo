/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Image } from './Image';

export type SpotifyUser = {
    display_name?: string | null;
    email: string;
    external_urls?: Record<string, any>;
    id?: string;
    images?: Array<Image>;
};

