import * as supertest from "supertest";
import TestAgent = require("supertest/lib/agent");
import { MadeForAllApiUtils, delayTestSuiteStart } from "./utils";

// Scarlet Fire Radio
const SPOTIFY_PLAYLIST_TO_TRACK = "37i9dQZF1E8RYDNQF3ifT2";

describe("DELETE /playlists/:id", () => {
    let api: TestAgent;
    let madeForAllApi: MadeForAllApiUtils;
    let createdTestPlaylist: string;

    beforeAll(async () => {
        await delayTestSuiteStart();
        api = supertest(process.env.MADE_FOR_ALL_API_BASE_URL);
        madeForAllApi = new MadeForAllApiUtils(api);
        // Create a playlist
        const response = await madeForAllApi.createPlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(201);
        createdTestPlaylist = response.body.madeForAllPlaylistId;
        expect(createdTestPlaylist).toBeDefined();
    });

    it("should delete the playlist", async () => {
        expect(
            (await madeForAllApi.getPlaylist(SPOTIFY_PLAYLIST_TO_TRACK)).status
        ).toBe(200);

        const response = await madeForAllApi.deletePlaylist(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(response.status).toBe(200);

        expect(
            (await madeForAllApi.getPlaylist(SPOTIFY_PLAYLIST_TO_TRACK)).status
        ).toBe(404);
    });

    it("should return a 404 response if the playlist does not exist", async () => {
        const response = await madeForAllApi.deletePlaylist("123");
        expect(response.status).toBe(404);
    });
});
