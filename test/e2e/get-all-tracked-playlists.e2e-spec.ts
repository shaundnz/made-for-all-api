import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import { MadeForAllApiUtils, delayTestSuiteStart } from "./utils";

// Otis McMusic Radio
const SPOTIFY_PLAYLIST_TO_TRACK = "37i9dQZF1E8HiEo0MQKMdB";

describe("GET /playlists", () => {
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

    it("should get all tracked playlists", async () => {
        const response = await madeForAllApiUtils.getAllPlaylists();
        expect(response.status).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
        expect(response.body.length).toBeGreaterThanOrEqual(1);
        expect(response.body).toContainEqual({
            spotifyPlaylistId: SPOTIFY_PLAYLIST_TO_TRACK,
            madeForAllPlaylistId: expect.any(String),
        });
    });
});
