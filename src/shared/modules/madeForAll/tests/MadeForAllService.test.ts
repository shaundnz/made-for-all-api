import { Playlist, Track } from "@spotify/web-api-ts-sdk";
import { SpotifyApiClient } from "../../../api";
import { AllPlaylistsRepository } from "../AllPlaylistsRepository";
import { MadeForAllRepository } from "../MadeForAllRepository";
import { MadeForAllService } from "../MadeForAllService";

describe("MadeForAllService", () => {
    let sut: MadeForAllService;
    let mockMadeForAllRepository: MadeForAllRepository;
    let mockAllPlaylistsRepository: AllPlaylistsRepository;
    let mockSpotifyApiClient: SpotifyApiClient;

    beforeEach(() => {
        mockMadeForAllRepository = {
            getMadeForAllPlaylistId: jest.fn(),
            upsertMadeForAllPlaylist: jest.fn(),
            deleteMadeForAllPlaylist: jest.fn(),
        } as unknown as MadeForAllRepository;

        mockAllPlaylistsRepository = {
            getAllPlaylists: jest.fn(),
            addPlaylistToDenormalizedAllPlaylistsItem: jest.fn(),
            removePlaylistFromDenormalizedAllPlaylistsItem: jest.fn(),
        } as unknown as AllPlaylistsRepository;

        mockSpotifyApiClient = {
            getPlaylistWithAllTracks: jest.fn(),
            createMadeForAllPlaylist: jest.fn(),
            updateMadeForAllPlaylistTracks: jest.fn(),
            deleteMadeForAllPlaylist: jest.fn(),
        } as unknown as SpotifyApiClient;

        sut = new MadeForAllService(
            mockMadeForAllRepository,
            mockAllPlaylistsRepository,
            mockSpotifyApiClient
        );
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getMadeForAllPlaylistId", () => {
        it("should return the madeForAll playlist id if the playlist is tracked", async () => {
            // Arrange
            const madeForAllId = "made-for-all-playlist-id";
            jest.spyOn(
                mockMadeForAllRepository,
                "getMadeForAllPlaylistId"
            ).mockImplementationOnce(() => Promise.resolve(madeForAllId));

            // Act
            const res = await sut.getMadeForAllPlaylistId("id");

            // Assert
            expect(res).toBe(madeForAllId);
        });

        it("should return null if the playlist is not tracked", async () => {
            // Arrange
            jest.spyOn(
                mockMadeForAllRepository,
                "getMadeForAllPlaylistId"
            ).mockImplementationOnce(() => Promise.resolve(null));

            // Act
            const res = await sut.getMadeForAllPlaylistId("id");

            // Assert
            expect(res).toBeNull();
        });
    });

    describe("getAllPlaylists", () => {
        it("should return a list of all playlists", async () => {
            // Arrange
            jest.spyOn(
                mockAllPlaylistsRepository,
                "getAllPlaylists"
            ).mockImplementationOnce(() =>
                Promise.resolve({
                    a: "1",
                    b: "2",
                })
            );

            // Act
            const allPlaylists = await sut.getAllPlaylists();

            // Assert
            expect(allPlaylists.length).toBe(2);
            expect(allPlaylists[0]).toEqual({
                spotifyPlaylistId: "a",
                madeForAllPlaylistId: "1",
            });
            expect(allPlaylists[1]).toEqual({
                spotifyPlaylistId: "b",
                madeForAllPlaylistId: "2",
            });
        });

        it("should return a empty list if no playlists exist", async () => {
            // Arrange
            jest.spyOn(
                mockAllPlaylistsRepository,
                "getAllPlaylists"
            ).mockImplementationOnce(() => Promise.resolve(null));

            // Act
            const allPlaylists = await sut.getAllPlaylists();

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
            const upsertMadeForAllPlaylistSpy = jest.spyOn(
                mockMadeForAllRepository,
                "upsertMadeForAllPlaylist"
            );

            const addPlaylistToDenormalizedAllPlaylistsItemSpy = jest.spyOn(
                mockAllPlaylistsRepository,
                "addPlaylistToDenormalizedAllPlaylistsItem"
            );

            // Act
            const newPlaylist = await sut.createMadeForAllPlaylist(
                spotifyPlaylistId
            );

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
            expect(upsertMadeForAllPlaylistSpy).toHaveBeenCalledWith(
                spotifyPlaylistId,
                newMadeForAllPlaylist.id
            );
            expect(
                addPlaylistToDenormalizedAllPlaylistsItemSpy
            ).toHaveBeenCalledWith(spotifyPlaylistId, newMadeForAllPlaylist.id);
            expect(newPlaylist).toBe(newMadeForAllPlaylist);
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

            const removePlaylistFromDenormalizedAllPlaylistsItemSpy =
                jest.spyOn(
                    mockAllPlaylistsRepository,
                    "removePlaylistFromDenormalizedAllPlaylistsItem"
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
            expect(
                removePlaylistFromDenormalizedAllPlaylistsItemSpy
            ).toHaveBeenCalledWith(spotifyPlaylistId);
        });
    });
});
