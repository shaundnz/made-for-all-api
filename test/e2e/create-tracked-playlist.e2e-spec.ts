import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import {
    MadeForAllApiUtils,
    SpotifyApiUtils,
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
        api = supertest(process.env.MADE_FOR_ALL_API_BASE_URL);
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
        const response = await madeForAllApiUtils.createPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(201);
        expect(response.body.spotifyPlaylist).toBeDefined();
        expect(response.body.spotifyPlaylist.id).toBe(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.body.spotifyPlaylist.name).toBe("Ice & Fire Radio");
        expect(response.body.madeForAllPlaylist.id).toBeDefined();
        expect(response.body.madeForAllPlaylist.name).toBe(
            "MadeForAll - Ice & Fire Radio"
        );

        // Required to get most up to date playlist items
        // See note in update-tracked-playlist.e2e-spec.ts for more info
        await new Promise((r) => setTimeout(r, 2000));

        await spotifyApiUtils.validateMadeForAllPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK,
            response.body.madeForAllPlaylist.id
        );
    });

    it.todo(
        "should return a 404 response if the spotify playlist does not exist"
    );

    it("should return a 409 response if the playlist is already tracked", async () => {
        const response = await madeForAllApiUtils.createPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
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
