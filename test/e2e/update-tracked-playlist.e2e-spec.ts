import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import {
    MadeForAllApiUtils,
    MadeForAllSpotifyUserUtils,
    SpotifyApiUtils,
} from "./utils";
import { SpotifyAccessTokenApiClient } from "../../src/shared/api";

// Test playlist owned by MFA account
const TEST_BASE_PLAYLIST_ID = "4rKqSltiaUSsZhAz8PIA32";
// Goodbye looks good on you
const SONG_TO_ADD_URI = "spotify:track:2otAb5kIGdZzJCqcUHNztT";

describe("PUT /playlists", () => {
    let api: TestAgent;
    let spotifyApiUtils: SpotifyApiUtils;
    let madeForAllSpotifyUserUtils: MadeForAllSpotifyUserUtils;
    let madeForAllApiUtils: MadeForAllApiUtils;
    let createdTestPlaylist: string;

    beforeAll(async () => {
        api = supertest(process.env.MADE_FOR_ALL_API_BASE_URL);
        madeForAllApiUtils = new MadeForAllApiUtils(api);
        spotifyApiUtils = new SpotifyApiUtils();

        const spotifyAccessTokenApiClient = new SpotifyAccessTokenApiClient();
        const accessTokenResponse =
            await spotifyAccessTokenApiClient.getNewAccessToken();
        madeForAllSpotifyUserUtils = new MadeForAllSpotifyUserUtils(
            accessTokenResponse.access_token
        );

        // Note: Will need to be updated if only allow copy of spotify playlists
        const response = await madeForAllApiUtils.createPlaylist(
            TEST_BASE_PLAYLIST_ID
        );
        expect(response.status).toBe(201);
        createdTestPlaylist = response.body.madeForAllPlaylistId;
        expect(createdTestPlaylist).toBeDefined();
    });

    afterAll(async () => {
        // Remove added song if it failed to be removed during test
        await madeForAllSpotifyUserUtils.removeSongFromPlaylist(
            TEST_BASE_PLAYLIST_ID,
            SONG_TO_ADD_URI
        );

        // Delete the playlist
        const response = await madeForAllApiUtils.deletePlaylist(
            TEST_BASE_PLAYLIST_ID
        );
        expect(response.status).toBe(200);
    });

    it("should update the tracked playlist", async () => {
        // Add a new song
        await madeForAllSpotifyUserUtils.addSongToPlaylist(
            TEST_BASE_PLAYLIST_ID,
            SONG_TO_ADD_URI
        );
        await new Promise((r) => setTimeout(r, 2000));

        await madeForAllApiUtils.updatePlaylist(TEST_BASE_PLAYLIST_ID);
        await new Promise((r) => setTimeout(r, 2000));

        const playlistAfterUpdateOne = await spotifyApiUtils.getPlaylist(
            createdTestPlaylist
        );
        expect(playlistAfterUpdateOne.tracks.total).toBe(6);
        expect(
            playlistAfterUpdateOne.tracks.items.map((item) => item.track.uri)
        ).toContain(SONG_TO_ADD_URI);

        // Remove the song
        await madeForAllSpotifyUserUtils.removeSongFromPlaylist(
            TEST_BASE_PLAYLIST_ID,
            SONG_TO_ADD_URI
        );
        await new Promise((r) => setTimeout(r, 2000));

        await madeForAllApiUtils.updatePlaylist(TEST_BASE_PLAYLIST_ID);
        await new Promise((r) => setTimeout(r, 2000));

        const playlistAfterUpdateTwo = await spotifyApiUtils.getPlaylist(
            createdTestPlaylist
        );
        expect(playlistAfterUpdateTwo.tracks.total).toBe(5);
        expect(
            playlistAfterUpdateTwo.tracks.items.map((item) => item.track.uri)
        ).not.toContain(SONG_TO_ADD_URI);
    });

    it("should return a 404 response if the playlist does not exist", async () => {
        const response = await madeForAllApiUtils.updatePlaylist("123");
        expect(response.status).toBe(404);
    });

    it.each([{}, TEST_BASE_PLAYLIST_ID, { spotifyId: TEST_BASE_PLAYLIST_ID }])(
        "should return a 400 response if the request body is malformed",
        async (body) => {
            const response = await api.put("/playlists").send(body);
            expect(response.status).toBe(400);
        }
    );
});
