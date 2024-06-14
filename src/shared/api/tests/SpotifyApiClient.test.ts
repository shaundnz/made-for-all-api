import {
    Page,
    Playlist,
    PlaylistedTrack,
    SpotifyApi,
    Track,
} from "@spotify/web-api-ts-sdk";
import { SpotifyApiClient } from "../SpotifyApiClient";

describe("SpotifyApiClient", () => {
    const validAccessToken = "valid_access_token";
    let sut: SpotifyApiClient;
    let mockSpotifyClient: SpotifyApi;
    let mockAuthenticatedMadeForAllClient: SpotifyApi;

    beforeEach(() => {
        mockSpotifyClient = {
            playlists: {
                getPlaylist: jest.fn(),
                getPlaylistItems: jest.fn(),
            },
        } as unknown as SpotifyApi;

        mockAuthenticatedMadeForAllClient = {
            playlists: {
                createPlaylist: jest.fn(),
                removeItemsFromPlaylist: jest.fn(),
                addItemsToPlaylist: jest.fn(),
                addCustomPlaylistCoverImageFromBase64String: jest.fn(),
            },
            currentUser: {
                playlists: {
                    unfollow: jest.fn(),
                },
            },
        } as unknown as SpotifyApi;

        jest.spyOn(SpotifyApi, "withClientCredentials")
            .mockImplementationOnce(() => mockSpotifyClient)
            .mockImplementationOnce(() => mockAuthenticatedMadeForAllClient);
        sut = new SpotifyApiClient(validAccessToken);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getPlaylistWithAllTracks", () => {
        it("should get the playlist", async () => {
            // Arrange
            const playlistId = "mock_playlist_id";

            const playlist = {
                id: "mock_playlist_id",
                name: "Mock Spotify Playlist",
                tracks: {
                    items: [] as PlaylistedTrack<Track>[],
                    limit: 50,
                    next: null,
                },
            } as Playlist<Track>;

            jest.spyOn(
                mockSpotifyClient.playlists,
                "getPlaylist"
            ).mockImplementationOnce(() => Promise.resolve(playlist));

            // Act
            const res = await sut.getPlaylistWithAllTracks(playlistId);

            // Assert
            expect(res).toBe(playlist);
        });

        it("should get all playlist tracks if the original request did not contain all tracks", async () => {
            // Arrange
            const playlistId = "mock_playlist_id";
            const initialTracks = Array.from({ length: 50 }, (_, index) => ({
                track: { uri: `spotify:track:${index}` },
            })) as PlaylistedTrack<Track>[];
            const additionalTracks = Array.from({ length: 50 }, (_, index) => ({
                track: { uri: `spotify:track:${index + 50}` },
            })) as PlaylistedTrack<Track>[];

            const playlist = {
                id: playlistId,
                name: "Mock Spotify Playlist",
                tracks: {
                    items: initialTracks,
                    limit: 50,
                    next: `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=50&limit=50`,
                },
            } as Playlist<Track>;

            const nextPlaylistItems = {
                items: additionalTracks,
                limit: 50,
                next: null,
            } as Page<PlaylistedTrack<Track>>;

            jest.spyOn(
                mockSpotifyClient.playlists,
                "getPlaylist"
            ).mockImplementationOnce(() => Promise.resolve(playlist));

            jest.spyOn(
                mockSpotifyClient.playlists,
                "getPlaylistItems"
            ).mockImplementationOnce(() => Promise.resolve(nextPlaylistItems));

            // Act
            const result = await sut.getPlaylistWithAllTracks(playlistId);

            // Assert
            expect(result.id).toBe(playlist.id);
            expect(result.name).toBe(playlist.name);
            expect(result.tracks.items).toHaveLength(100);

            expect(result.tracks.items).toEqual([
                ...initialTracks,
                ...additionalTracks,
            ]);
            expect(
                mockSpotifyClient.playlists.getPlaylist
            ).toHaveBeenCalledWith(playlistId);

            expect(
                mockSpotifyClient.playlists.getPlaylistItems
            ).toHaveBeenCalledWith(playlistId, undefined, undefined, 50, 50);
        });
    });

    describe("createMadeForAllPlaylist", () => {
        it("should create the playlist", async () => {
            // Arrange
            const originalPlaylist = {
                id: "original_playlist_id",
                name: "Original Playlist",
                description: "Original Playlist Description",
                images: [{ url: "https://example.com/original_image.jpg" }],
                tracks: {
                    items: [] as PlaylistedTrack<Track>[],
                    limit: 50,
                    next: null,
                },
            } as Playlist<Track>;

            const createdPlaylist = {
                id: "created_playlist_id",
                name: `MadeForAll - ${originalPlaylist.name}`,
                description: originalPlaylist.description,
                tracks: {
                    items: [] as PlaylistedTrack<Track>[],
                },
            } as Playlist<Track>;

            jest.spyOn(
                mockAuthenticatedMadeForAllClient.playlists,
                "createPlaylist"
            ).mockImplementationOnce(() => Promise.resolve(createdPlaylist));

            const imageBuffer = Buffer.from("mock image data");
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockImplementationOnce(() =>
                    Promise.resolve(new Response(imageBuffer))
                );

            // Act
            const result = await sut.createMadeForAllPlaylist(originalPlaylist);

            // Assert
            expect(
                mockAuthenticatedMadeForAllClient.playlists.createPlaylist
            ).toHaveBeenCalledWith("31bowcqwxwyhoxvonqpfuhj3azjm", {
                name: `MadeForAll - ${originalPlaylist.name}`,
                description: originalPlaylist.description,
            });

            expect(fetchSpy).toHaveBeenCalledWith(
                originalPlaylist.images[0].url
            );

            expect(
                mockAuthenticatedMadeForAllClient.playlists
                    .addCustomPlaylistCoverImageFromBase64String
            ).toHaveBeenCalledWith(
                createdPlaylist.id,
                imageBuffer.toString("base64")
            );

            expect(result).toBe(createdPlaylist);
        });
    });

    describe("updateMadeForAllPlaylistTracks", () => {
        it("should update the made for all playlist", async () => {
            // Arrange
            const originalPlaylistWithAllTracks = {
                id: "original_playlist_id",
                tracks: {
                    items: [
                        { track: { uri: "spotify:track:1" } },
                        { track: { uri: "spotify:track:2" } },
                    ],
                },
            } as Playlist<Track>;

            const targetPlaylistWithAllTracks = {
                id: "target_playlist_id",
                tracks: {
                    items: [
                        { track: { uri: "spotify:track:3" } },
                        { track: { uri: "spotify:track:4" } },
                    ],
                },
            } as Playlist<Track>;

            jest.spyOn(
                mockAuthenticatedMadeForAllClient.playlists,
                "removeItemsFromPlaylist"
            ).mockImplementationOnce(() => Promise.resolve());

            jest.spyOn(
                mockAuthenticatedMadeForAllClient.playlists,
                "addItemsToPlaylist"
            ).mockImplementationOnce(() => Promise.resolve());

            // Act
            await sut.updateMadeForAllPlaylistTracks(
                originalPlaylistWithAllTracks,
                targetPlaylistWithAllTracks
            );

            // Assert
            expect(
                mockAuthenticatedMadeForAllClient.playlists
                    .removeItemsFromPlaylist
            ).toHaveBeenCalledWith(
                targetPlaylistWithAllTracks.id,
                expect.objectContaining({
                    tracks: expect.arrayContaining(
                        targetPlaylistWithAllTracks.tracks.items.map(
                            (item) => item.track
                        )
                    ),
                })
            );

            expect(
                mockAuthenticatedMadeForAllClient.playlists.addItemsToPlaylist
            ).toHaveBeenCalledWith(
                targetPlaylistWithAllTracks.id,
                expect.arrayContaining(
                    originalPlaylistWithAllTracks.tracks.items.map(
                        (item) => item.track.uri
                    )
                )
            );
        });
    });

    describe("deleteMadeForAllPlaylist", () => {
        it("should unfollow the playlist", async () => {
            // Arrange
            const madeForAllPlaylistId = "mock_made_for_all_playlist_id";

            jest.spyOn(
                mockAuthenticatedMadeForAllClient.currentUser.playlists,
                "unfollow"
            ).mockImplementationOnce(() => Promise.resolve());

            // Act
            await sut.deleteMadeForAllPlaylist(madeForAllPlaylistId);

            // Assert
            expect(
                mockAuthenticatedMadeForAllClient.currentUser.playlists.unfollow
            ).toHaveBeenCalledWith(madeForAllPlaylistId);
        });
    });
});
