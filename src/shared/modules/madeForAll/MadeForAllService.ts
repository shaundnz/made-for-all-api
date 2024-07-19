import { SpotifyApiClient } from "../../api";
import { MadeForAllRepository } from "./MadeForAllRepository";
import {
    CreateTrackedPlaylistResponseDto,
    GetAllTrackedPlaylistResponseDto,
} from "../../api/contracts";
import { TrackedPlaylist } from "../../entities";

export class MadeForAllService {
    private madeForAllRepository: MadeForAllRepository;
    private spotifyApiClient: SpotifyApiClient;

    constructor(
        madeForAllRepository: MadeForAllRepository,
        spotifyApiClient: SpotifyApiClient
    ) {
        this.madeForAllRepository = madeForAllRepository;
        this.spotifyApiClient = spotifyApiClient;
    }

    public async getTrackedPlaylist(
        spotifyPlaylistId: string
    ): Promise<TrackedPlaylist | null> {
        const trackedPlaylist =
            await this.madeForAllRepository.getTrackedPlaylist(
                spotifyPlaylistId
            );

        if (!trackedPlaylist) {
            return null;
        }

        return trackedPlaylist;
    }

    public async getAllTrackedPlaylists(): Promise<GetAllTrackedPlaylistResponseDto> {
        const allPlaylists =
            await this.madeForAllRepository.getAllTrackedPlaylists();

        return allPlaylists;
    }

    public async createMadeForAllPlaylist(
        spotifyPlaylistId: string
    ): Promise<CreateTrackedPlaylistResponseDto> {
        const originalPlaylist =
            await this.spotifyApiClient.getPlaylistWithAllTracks(
                spotifyPlaylistId
            );

        const newPlaylist =
            await this.spotifyApiClient.createMadeForAllPlaylist(
                originalPlaylist
            );

        await this.spotifyApiClient.updateMadeForAllPlaylistTracks(
            originalPlaylist,
            newPlaylist
        );

        const {
            tracks: originalPlaylistTracks,
            ...originalPlaylistWithoutTracks
        } = originalPlaylist;
        const { tracks: newPlaylistTracks, ...newPlaylistWithoutTracks } =
            newPlaylist;

        const newPlaylistWithoutTracksAndCreatedAtDate = {
            ...newPlaylistWithoutTracks,
            createdAt: new Date().toISOString(),
        };

        await this.madeForAllRepository.upsertTrackedPlaylist({
            spotifyPlaylist: originalPlaylistWithoutTracks,
            madeForAllPlaylist: newPlaylistWithoutTracksAndCreatedAtDate,
        });

        return {
            spotifyPlaylist: originalPlaylistWithoutTracks,
            madeForAllPlaylist: newPlaylistWithoutTracksAndCreatedAtDate,
        };
    }

    public async updateMadeForAllPlaylist(
        spotifyPlaylistId: string,
        madeForAllPlaylistId: string
    ) {
        const originalPlaylist =
            await this.spotifyApiClient.getPlaylistWithAllTracks(
                spotifyPlaylistId
            );

        const madeForAllPlaylist =
            await this.spotifyApiClient.getPlaylistWithAllTracks(
                madeForAllPlaylistId
            );

        await this.spotifyApiClient.updateMadeForAllPlaylistTracks(
            originalPlaylist,
            madeForAllPlaylist
        );

        return;
    }

    public async deleteMadeForAllPlaylist(
        spotifyPlaylistId: string,
        madeForAllPlaylistId: string
    ) {
        await this.spotifyApiClient.deleteMadeForAllPlaylist(
            madeForAllPlaylistId
        );

        await this.madeForAllRepository.deleteMadeForAllPlaylist(
            spotifyPlaylistId
        );

        // await this.allPlaylistsRepository.removePlaylistFromDenormalizedAllPlaylistsItem(
        //     spotifyPlaylistId
        // );

        return;
    }
}
