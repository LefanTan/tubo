/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Image } from './Image';

export type Playlist = {
    id: string;
    name: string;
    description?: string | null;
    spotify_url?: string | null;
    images?: Array<Image>;
};

