import { PlaylistData } from "../../../entities";

export type GetAllTrackedPlaylistResponseDto = {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: PlaylistData;
}[];
