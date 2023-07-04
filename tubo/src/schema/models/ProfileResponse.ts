/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SpotifyUser } from './SpotifyUser';
import type { User } from './User';

export type ProfileResponse = {
    tuboUser?: User;
    spotifyUser?: SpotifyUser;
    newAccessToken?: string | null;
};

