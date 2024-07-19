import { MadeForAllPlaylistData, PlaylistData } from "../../../entities";

export interface CreateTrackedPlaylistResponseDto {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: MadeForAllPlaylistData;
}
