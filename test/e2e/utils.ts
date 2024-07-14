import "dotenv/config";
import TestAgent = require("supertest/lib/agent");
import Response = require("superagent/lib/node/response");
import { Playlist, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";
import {
    CreateTrackedPlaylistRequestDto,
    CreateTrackedPlaylistResponseDto,
    DeleteTrackedPlaylistsResponseDto,
    GetAllTrackedPlaylistResponseDto,
    GetTrackedPlaylistResponseDto,
    UpdateTrackedPlaylistRequestDto,
    UpdateTrackedPlaylistResponseDto,
} from "../../src/shared/api/contracts";

type SuperTestResponse<T> = Omit<Response, "body"> & { body: T };

export class MadeForAllApiUtils {
    private api: TestAgent;

    constructor(api: TestAgent) {
        this.api = api;
    }

    public async getPlaylist(
        spotifyPlaylistId: string
    ): Promise<SuperTestResponse<GetTrackedPlaylistResponseDto>> {
        const response = await this.api.get(`/playlists/${spotifyPlaylistId}`);
        return response;
    }

    public async getAllPlaylists(): Promise<
        SuperTestResponse<GetAllTrackedPlaylistResponseDto>
    > {
        const response = await this.api.get(`/playlists`);
        return response;
    }

    public async createPlaylist(
        data: CreateTrackedPlaylistRequestDto
    ): Promise<SuperTestResponse<CreateTrackedPlaylistResponseDto>> {
        const response = await this.api.post("/playlists").send(data);
        return response;
    }

    public async updatePlaylist(
        data: UpdateTrackedPlaylistRequestDto
    ): Promise<SuperTestResponse<UpdateTrackedPlaylistResponseDto>> {
        const response = await this.api.put("/playlists").send(data);
        return response;
    }

    public async deletePlaylist(
        spotifyPlaylistId: string
    ): Promise<SuperTestResponse<DeleteTrackedPlaylistsResponseDto>> {
        const response = await this.api.delete(
            `/playlists/${spotifyPlaylistId}`
        );
        return response;
    }
}

export class SpotifyApiUtils {
    private spotifyClient: SpotifyApi;

    constructor() {
        this.spotifyClient = SpotifyApi.withClientCredentials(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET
        );
    }

    public async getPlaylist(playlistId: string): Promise<Playlist<Track>> {
        return await this.spotifyClient.playlists.getPlaylist(playlistId);
    }

    public async validateMadeForAllPlaylist(
        spotifyPlaylistId: string,
        madeForAllPlaylistId: string
    ) {
        const originalPlaylist = await this.getPlaylist(spotifyPlaylistId);
        const madeForAllPlaylist = await this.getPlaylist(madeForAllPlaylistId);

        expect(madeForAllPlaylist.name).toBe(
            `MadeForAll - ${originalPlaylist.name}`
        );
        expect(madeForAllPlaylist.description).toBe(
            originalPlaylist.description
        );
        expect(madeForAllPlaylist.tracks.total).toBe(
            originalPlaylist.tracks.total
        );
        expect(
            madeForAllPlaylist.tracks.items.map((item) => item.track.id)
        ).toEqual(originalPlaylist.tracks.items.map((item) => item.track.id));
    }
}

export class MadeForAllSpotifyUserUtils {
    private authenticatedMadeForAllClient: SpotifyApi;

    constructor(accessToken: string) {
        this.authenticatedMadeForAllClient = SpotifyApi.withClientCredentials(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
            undefined,
            {
                fetch: (req, init) => {
                    if (init) {
                        const withAccessToken = new Headers(init.headers);
                        withAccessToken.delete("Authorization");
                        withAccessToken.append(
                            "Authorization",
                            `Bearer ${accessToken}`
                        );
                        init.headers = withAccessToken;
                    }
                    return fetch(req, init);
                },
            }
        );
    }

    public async addSongToPlaylist(playlistId: string, songId: string) {
        await this.authenticatedMadeForAllClient.playlists.addItemsToPlaylist(
            playlistId,
            [songId]
        );
    }

    public async removeSongFromPlaylist(playlistId: string, songId: string) {
        await this.authenticatedMadeForAllClient.playlists.removeItemsFromPlaylist(
            playlistId,
            { tracks: [{ uri: songId }] }
        );
    }
}

export const getApiBaseUrl = () => {};

// Spotify API does not seem to handle requests sent in quick succession, regularly returns 502, API is not being
// rate limited so unsure why :/
export const delayTestSuiteStart = async () => {
    await new Promise((r) => setTimeout(r, 2000));
};
