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
        api = supertest(`https://${process.env.MADE_FOR_ALL_API_BASE_URL}`);
        madeForAllApiUtils = new MadeForAllApiUtils(api);
        // Create a playlist
        const response = await madeForAllApiUtils.createPlaylist({
            spotifyPlaylistId: SPOTIFY_PLAYLIST_TO_TRACK,
        });
        expect(response.status).toBe(201);
        createdTestPlaylist = response.body.madeForAllPlaylist.id;
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

        const addedPlaylist = response.body.find(
            (trackedPlaylist) =>
                trackedPlaylist.spotifyPlaylist.id === SPOTIFY_PLAYLIST_TO_TRACK
        );

        expect(addedPlaylist).toBeDefined();

        expect(addedPlaylist?.spotifyPlaylist.id).toBe(
            SPOTIFY_PLAYLIST_TO_TRACK
        );
        expect(addedPlaylist?.spotifyPlaylist.name).toBe("Otis McMusic Radio");
        expect(addedPlaylist?.madeForAllPlaylist.name).toBe(
            "MadeForAll - Otis McMusic Radio"
        );
        expect(addedPlaylist?.madeForAllPlaylist.createdAt).toBeDefined();
    });
});
