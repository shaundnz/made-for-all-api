import { PlaylistData } from "../../../entities";

export interface GetTrackedPlaylistResponseDto {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: PlaylistData;
}
