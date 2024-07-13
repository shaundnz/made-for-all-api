import { PlaylistData } from "../../../entities";

export interface CreateTrackedPlaylistResponseDto {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: PlaylistData;
}
