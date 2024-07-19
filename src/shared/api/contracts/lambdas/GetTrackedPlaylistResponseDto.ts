import { MadeForAllPlaylistData, PlaylistData } from "../../../entities";

export interface GetTrackedPlaylistResponseDto {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: MadeForAllPlaylistData;
}
