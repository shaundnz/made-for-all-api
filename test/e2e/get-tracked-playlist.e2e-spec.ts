import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import { MadeForAllApiUtils, delayTestSuiteStart } from "./utils";

// Givin It Up Radio
const SPOTIFY_PLAYLIST_TO_TRACK = "37i9dQZF1E8Owfia6rNxzt";

describe("GET /playlists/:id", () => {
    let api: TestAgent;
    let madeForAllApiUtils: MadeForAllApiUtils;
    let createdTestPlaylist: string;

    beforeAll(async () => {
        await delayTestSuiteStart();
        api = supertest(process.env.MADE_FOR_ALL_API_BASE_URL);
        madeForAllApiUtils = new MadeForAllApiUtils(api);
        // Create a playlist
        const response = await madeForAllApiUtils.createPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(201);
        createdTestPlaylist = response.body.madeForAllPlaylistId;
        expect(createdTestPlaylist).toBeDefined();
    });

    afterAll(async () => {
        // Delete the playlist
        const response = await madeForAllApiUtils.deletePlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(200);
    });

    it("should return a tracked playlist", async () => {
        const response = await madeForAllApiUtils.getPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            spotifyPlaylistId: SPOTIFY_PLAYLIST_TO_TRACK,
            madeForAllPlaylistId: createdTestPlaylist,
        });
    });

    it("should return a 404 response if the playlist does not exist", async () => {
        const response = await madeForAllApiUtils.getPlaylist("1234");
        expect(response.status).toBe(404);
    });
});
