import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import {
    MadeForAllApiUtils,
    SpotifyApiUtils,
    assertCreatedRecently,
    delayTestSuiteStart,
} from "./utils";

// Ice & Fire Radio
const SPOTIFY_PLAYLIST_TO_TRACK = "37i9dQZF1E8PMTDvqxh7Gh";

describe("POST /playlists", () => {
    let api: TestAgent;
    let madeForAllApiUtils: MadeForAllApiUtils;
    let spotifyApiUtils: SpotifyApiUtils;

    beforeAll(async () => {
        await delayTestSuiteStart();
        api = supertest(`https://${process.env.MADE_FOR_ALL_API_BASE_URL}`);
        madeForAllApiUtils = new MadeForAllApiUtils(api);
        spotifyApiUtils = new SpotifyApiUtils();
    });

    afterAll(async () => {
        // Delete the playlist
        const response = await madeForAllApiUtils.deletePlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(200);
    });

    it("should create the tracked playlist", async () => {
        const { status, body } = await madeForAllApiUtils.createPlaylist({
            spotifyPlaylistId: SPOTIFY_PLAYLIST_TO_TRACK,
        });
        expect(status).toBe(201);
        expect(body.spotifyPlaylist).toBeDefined();
        expect(body.spotifyPlaylist.id).toBe(SPOTIFY_PLAYLIST_TO_TRACK);
        expect(body.spotifyPlaylist.name).toBe("Ice & Fire Radio");
        expect(body.madeForAllPlaylist.id).toBeDefined();
        expect(body.madeForAllPlaylist.name).toBe(
            "MadeForAll - Ice & Fire Radio"
        );
        expect(body.madeForAllPlaylist.createdAt).toBeDefined();
        assertCreatedRecently(body.madeForAllPlaylist.createdAt);

        // Required to get most up to date playlist items
        // See note in update-tracked-playlist.e2e-spec.ts for more info
        await new Promise((r) => setTimeout(r, 2000));

        await spotifyApiUtils.validateMadeForAllPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK,
            body.madeForAllPlaylist.id
        );
    });

    it.todo(
        "should return a 404 response if the spotify playlist does not exist"
    );

    it("should return a 409 response if the playlist is already tracked", async () => {
        const response = await madeForAllApiUtils.createPlaylist({
            spotifyPlaylistId: SPOTIFY_PLAYLIST_TO_TRACK,
        });
        expect(response.status).toBe(409);
    });

    it.each([
        {},
        SPOTIFY_PLAYLIST_TO_TRACK,
        { spotifyId: SPOTIFY_PLAYLIST_TO_TRACK },
    ])(
        "should return a 400 response if the request body is malformed",
        async (body) => {
            const response = await api.post("/playlists").send(body);
            expect(response.status).toBe(400);
        }
    );
});
