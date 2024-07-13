import { Playlist } from "@spotify/web-api-ts-sdk";

export type PlaylistData = Omit<Playlist, "tracks">;

export interface TrackedPlaylist {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: PlaylistData;
}
