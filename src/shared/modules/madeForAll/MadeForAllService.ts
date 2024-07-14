import { SpotifyApiClient } from "../../api";
import { MadeForAllRepository } from "./MadeForAllRepository";
import {
    CreateTrackedPlaylistResponseDto,
    GetAllTrackedPlaylistResponseDto,
} from "../../api/contracts";
import { AllPlaylistsRepository } from "./AllPlaylistsRepository";

export class MadeForAllService {
    private madeForAllRepository: MadeForAllRepository;
    private spotifyApiClient: SpotifyApiClient;
    private allPlaylistsRepository: AllPlaylistsRepository;

    constructor(
        madeForAllRepository: MadeForAllRepository,
        allPlaylistsRepository: AllPlaylistsRepository,
        spotifyApiClient: SpotifyApiClient
    ) {
        this.madeForAllRepository = madeForAllRepository;
        this.allPlaylistsRepository = allPlaylistsRepository;
        this.spotifyApiClient = spotifyApiClient;
    }

    public async getMadeForAllPlaylistId(
        spotifyPlaylistId: string
    ): Promise<string | null> {
        return await this.madeForAllRepository.getMadeForAllPlaylistId(
            spotifyPlaylistId
        );
    }

    public async getAllPlaylists(): Promise<
        GetAllTrackedPlaylistResponseDto[]
    > {
        const allPlaylists =
            await this.allPlaylistsRepository.getAllPlaylists();

        if (allPlaylists === null) {
            return [];
        }

        return Object.keys(allPlaylists).map((spotifyPlaylistId) => ({
            spotifyPlaylistId: spotifyPlaylistId,
            madeForAllPlaylistId: allPlaylists[spotifyPlaylistId],
        }));
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

        await this.madeForAllRepository.upsertTrackedPlaylist(
            originalPlaylistWithoutTracks,
            newPlaylistWithoutTracks
        );

        await this.allPlaylistsRepository.addPlaylistToDenormalizedAllPlaylistsItem(
            spotifyPlaylistId,
            newPlaylist.id
        );

        return {
            spotifyPlaylist: originalPlaylistWithoutTracks,
            madeForAllPlaylist: newPlaylistWithoutTracks,
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

        await this.allPlaylistsRepository.removePlaylistFromDenormalizedAllPlaylistsItem(
            spotifyPlaylistId
        );

        return;
    }
}
