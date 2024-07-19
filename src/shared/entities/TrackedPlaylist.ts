import { Playlist } from "@spotify/web-api-ts-sdk";

export type PlaylistData = Omit<Playlist, "tracks">;

export type MadeForAllPlaylistData = PlaylistData & {
    createdAt: string;
};

export interface TrackedPlaylist {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: MadeForAllPlaylistData;
}
