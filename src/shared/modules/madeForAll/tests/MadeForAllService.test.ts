import { Playlist, Track } from "@spotify/web-api-ts-sdk";
import { SpotifyApiClient } from "../../../api";
import { MadeForAllRepository } from "../MadeForAllRepository";
import { MadeForAllService } from "../MadeForAllService";
import { TrackedPlaylist } from "../../../entities";

describe("MadeForAllService", () => {
    let sut: MadeForAllService;
    let mockMadeForAllRepository: MadeForAllRepository;
    let mockSpotifyApiClient: SpotifyApiClient;

    beforeEach(() => {
        mockMadeForAllRepository = {
            getTrackedPlaylist: jest.fn(),
            getAllTrackedPlaylists: jest.fn(),
            upsertTrackedPlaylist: jest.fn(),
            deleteMadeForAllPlaylist: jest.fn(),
        } as unknown as MadeForAllRepository;

        mockSpotifyApiClient = {
            getPlaylistWithAllTracks: jest.fn(),
            createMadeForAllPlaylist: jest.fn(),
            updateMadeForAllPlaylistTracks: jest.fn(),
            deleteMadeForAllPlaylist: jest.fn(),
        } as unknown as SpotifyApiClient;

        sut = new MadeForAllService(
            mockMadeForAllRepository,
            mockSpotifyApiClient
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getTrackedPlaylist", () => {
        it("should return the tracked playlist if the playlist exists", async () => {
            // Arrange
            const madeForAllId = "made-for-all-playlist-id";

            const trackedPlaylist = {
                madeForAllPlaylist: {
                    id: madeForAllId,
                },
                spotifyPlaylist: {
                    id: "spotify-playlist-id",
                },
            } as TrackedPlaylist;

            jest.spyOn(
                mockMadeForAllRepository,
                "getTrackedPlaylist"
            ).mockImplementationOnce(() => Promise.resolve(trackedPlaylist));

            // Act
            const res = await sut.getTrackedPlaylist("id");

            // Assert
            expect(res).toBe(trackedPlaylist);
        });

        it("should return null if the playlist is not tracked", async () => {
            // Arrange
            jest.spyOn(
                mockMadeForAllRepository,
                "getTrackedPlaylist"
            ).mockImplementationOnce(() => Promise.resolve(null));

            // Act
            const res = await sut.getTrackedPlaylist("id");

            // Assert
            expect(res).toBeNull();
        });
    });

    describe("getAllTrackedPlaylists", () => {
        it("should return a list of all playlists", async () => {
            // Arrange
            const trackedPlaylistOne = {
                madeForAllPlaylist: {
                    id: "made-for-all-playlist-id-1",
                },
                spotifyPlaylist: {
                    id: "spotify-playlist-id-1",
                },
            } as TrackedPlaylist;

            const trackedPlaylistTwo = {
                madeForAllPlaylist: {
                    id: "made-for-all-playlist-id-2",
                },
                spotifyPlaylist: {
                    id: "spotify-playlist-id-2",
                },
            } as TrackedPlaylist;

            jest.spyOn(
                mockMadeForAllRepository,
                "getAllTrackedPlaylists"
            ).mockImplementationOnce(() =>
                Promise.resolve([trackedPlaylistOne, trackedPlaylistTwo])
            );

            // Act
            const allPlaylists = await sut.getAllTrackedPlaylists();

            // Assert
            expect(allPlaylists.length).toBe(2);
            expect(allPlaylists).toContain(trackedPlaylistOne);
            expect(allPlaylists).toContain(trackedPlaylistTwo);
        });

        it("should return a empty list if no playlists exist", async () => {
            // Arrange
            jest.spyOn(
                mockMadeForAllRepository,
                "getAllTrackedPlaylists"
            ).mockImplementationOnce(() => Promise.resolve([]));

            // Act
            const allPlaylists = await sut.getAllTrackedPlaylists();

            // Assert
            expect(allPlaylists.length).toBe(0);
        });
    });

    describe("createMadeForAllPlaylist", () => {
        it("should create the playlist", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id-123";
            const existingSpotifyPlaylist = {
                id: spotifyPlaylistId,
            } as Playlist<Track>;
            const newMadeForAllPlaylist = {
                id: "made-for-all-playlist-id-123",
            } as Playlist<Track>;

            const getPlaylistWithAllTracksSpy = jest
                .spyOn(mockSpotifyApiClient, "getPlaylistWithAllTracks")
                .mockImplementationOnce(() =>
                    Promise.resolve(existingSpotifyPlaylist)
                );

            const createMadeForAllPlaylistSpy = jest
                .spyOn(mockSpotifyApiClient, "createMadeForAllPlaylist")
                .mockImplementationOnce(() =>
                    Promise.resolve(newMadeForAllPlaylist)
                );

            const updateMadeForAllPlaylistTracksSpy = jest.spyOn(
                mockSpotifyApiClient,
                "updateMadeForAllPlaylistTracks"
            );
            const upsertTrackedPlaylistSpy = jest.spyOn(
                mockMadeForAllRepository,
                "upsertTrackedPlaylist"
            );

            // Act
            const createMadeForAllPlaylistResponse =
                await sut.createMadeForAllPlaylist(spotifyPlaylistId);

            // Assert
            expect(getPlaylistWithAllTracksSpy).toHaveBeenCalledWith(
                spotifyPlaylistId
            );
            expect(createMadeForAllPlaylistSpy).toHaveBeenCalledWith(
                existingSpotifyPlaylist
            );
            expect(updateMadeForAllPlaylistTracksSpy).toHaveBeenCalledWith(
                existingSpotifyPlaylist,
                newMadeForAllPlaylist
            );
            expect(upsertTrackedPlaylistSpy).toHaveBeenCalledWith(
                existingSpotifyPlaylist,
                newMadeForAllPlaylist
            );

            expect(createMadeForAllPlaylistResponse).toStrictEqual({
                spotifyPlaylist: existingSpotifyPlaylist,
                madeForAllPlaylist: newMadeForAllPlaylist,
            });
        });
    });

    describe("updateMadeForAllPlaylist", () => {
        it("should update the playlist", async () => {
            const spotifyPlaylistId = "spotify-playlist-id-123";
            const existingSpotifyPlaylist = {
                id: spotifyPlaylistId,
            } as Playlist<Track>;
            const madeForAllPlaylistId = "made-for-all-playlist-id-123";
            const madeForAllPlaylist = {
                id: madeForAllPlaylistId,
            } as Playlist<Track>;

            const getPlaylistWithAllTracksSpy = jest
                .spyOn(mockSpotifyApiClient, "getPlaylistWithAllTracks")
                .mockImplementationOnce(() =>
                    Promise.resolve(existingSpotifyPlaylist)
                )
                .mockImplementationOnce(() =>
                    Promise.resolve(madeForAllPlaylist)
                );

            const updateMadeForAllPlaylistTracksSpy = jest.spyOn(
                mockSpotifyApiClient,
                "updateMadeForAllPlaylistTracks"
            );

            // Act
            await sut.updateMadeForAllPlaylist(
                spotifyPlaylistId,
                madeForAllPlaylistId
            );

            // Assert
            expect(getPlaylistWithAllTracksSpy).toHaveBeenCalledTimes(2);
            expect(getPlaylistWithAllTracksSpy.mock.calls[0][0]).toBe(
                spotifyPlaylistId
            );
            expect(getPlaylistWithAllTracksSpy.mock.calls[1][0]).toBe(
                madeForAllPlaylistId
            );
            expect(updateMadeForAllPlaylistTracksSpy).toHaveBeenCalledWith(
                existingSpotifyPlaylist,
                madeForAllPlaylist
            );
        });
    });

    describe("deleteMadeForAllPlaylist", () => {
        it("should delete the playlist", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id-123";
            const madeForAllPlaylistId = "made-for-all-playlist-id-123";

            const spotifyDeleteMadeForAllPlaylistSpy = jest.spyOn(
                mockSpotifyApiClient,
                "deleteMadeForAllPlaylist"
            );

            const deleteMadeForAllPlaylistSpy = jest.spyOn(
                mockMadeForAllRepository,
                "deleteMadeForAllPlaylist"
            );

            // Act
            await sut.deleteMadeForAllPlaylist(
                spotifyPlaylistId,
                madeForAllPlaylistId
            );

            // Assert
            expect(spotifyDeleteMadeForAllPlaylistSpy).toHaveBeenCalledWith(
                madeForAllPlaylistId
            );
            expect(deleteMadeForAllPlaylistSpy).toHaveBeenCalledWith(
                spotifyPlaylistId
            );
        });
    });
});
