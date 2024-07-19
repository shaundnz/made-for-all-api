import { MadeForAllPlaylistData, PlaylistData } from "../../../entities";

export type GetAllTrackedPlaylistResponseDto = {
    spotifyPlaylist: PlaylistData;
    madeForAllPlaylist: MadeForAllPlaylistData;
}[];
