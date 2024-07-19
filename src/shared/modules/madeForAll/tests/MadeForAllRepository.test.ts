import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { MadeForAllRepository } from "../MadeForAllRepository";
import {
    MadeForAllPlaylistData,
    PlaylistData,
    TrackedPlaylist,
} from "../../../entities";

describe("MadeForAllRepository", () => {
    let sut: MadeForAllRepository;
    let mockDynamoDBDocumentClient: DynamoDBDocumentClient;
    let now = new Date(2024, 6, 19).toISOString();

    beforeEach(() => {
        mockDynamoDBDocumentClient = {
            send: jest.fn(),
        } as unknown as DynamoDBDocumentClient;

        sut = new MadeForAllRepository(mockDynamoDBDocumentClient);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getAllTrackedPlaylists", () => {
        it("should get all tracked playlists", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";

            const trackedPlaylist = {
                madeForAllPlaylist: {
                    id: "made-for-all-playlist-id",
                    createdAt: now,
                },
                spotifyPlaylist: {
                    id: spotifyPlaylistId,
                },
            } as TrackedPlaylist;

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Items: [
                        {
                            PartitionKey: "TrackedPlaylist",
                            SortKey: spotifyPlaylistId,
                            Data: {
                                ...trackedPlaylist,
                                madeForAllPlaylist: {
                                    ...trackedPlaylist.madeForAllPlaylist,
                                    createdAt: now,
                                },
                            },
                        },
                    ],
                })
            );

            // Act
            const res = await sut.getAllTrackedPlaylists();

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as QueryCommand;
            expect(sendCommandArg.input.KeyConditionExpression).toBe(
                "#PartitionKey = :trackedPlaylistPartitionKey"
            );
            expect(sendCommandArg.input.ExpressionAttributeNames).toEqual({
                "#PartitionKey": "PartitionKey",
            });
            expect(sendCommandArg.input.ExpressionAttributeValues).toEqual({
                ":trackedPlaylistPartitionKey": `TrackedPlaylist`,
            });

            expect(res.length).toBe(1);
            expect(res[0]).toEqual(trackedPlaylist);
        });

        it("should return a empty list if no tracked playlists exist", async () => {
            // Arrange
            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            // Act
            const res = await sut.getAllTrackedPlaylists();

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as QueryCommand;
            expect(sendCommandArg.input.KeyConditionExpression).toBe(
                "#PartitionKey = :trackedPlaylistPartitionKey"
            );
            expect(sendCommandArg.input.ExpressionAttributeNames).toEqual({
                "#PartitionKey": "PartitionKey",
            });
            expect(sendCommandArg.input.ExpressionAttributeValues).toEqual({
                ":trackedPlaylistPartitionKey": `TrackedPlaylist`,
            });

            expect(res.length).toBe(0);
        });
    });

    describe("getTrackedPlaylist", () => {
        it("should return the tracked playlist if the playlist exists", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";

            const trackedPlaylist = {
                madeForAllPlaylist: {
                    id: "made-for-all-playlist-id",
                    createdAt: now,
                },
                spotifyPlaylist: {
                    id: spotifyPlaylistId,
                },
            } as TrackedPlaylist;

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {
                        PartitionKey: "TrackedPlaylist",
                        SortKey: spotifyPlaylistId,
                        Data: {
                            ...trackedPlaylist,
                            madeForAllPlaylist: {
                                ...trackedPlaylist.madeForAllPlaylist,
                                createdAt: now,
                            },
                        },
                    },
                })
            );

            // Act
            const res = await sut.getTrackedPlaylist(spotifyPlaylistId);

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: "TrackedPlaylist",
                SortKey: spotifyPlaylistId,
            });

            expect(res).toEqual(trackedPlaylist);
        });

        it("should return null if the playlist does not exist", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";
            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            // Act
            const res = await sut.getTrackedPlaylist(spotifyPlaylistId);

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: "TrackedPlaylist",
                SortKey: spotifyPlaylistId,
            });
            expect(res).toBeNull();
        });
    });

    describe("upsertTrackedPlaylist", () => {
        it("should upsert the existing tracked playlist", async () => {
            // Arrange
            const spotifyPlaylist = {
                id: "spotify-playlist-id",
            } as PlaylistData;

            const madeForAllPlaylist = {
                id: "made-for-all-playlist-id",
                createdAt: now,
            } as MadeForAllPlaylistData;

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");

            // Act
            await sut.upsertTrackedPlaylist({
                spotifyPlaylist,
                madeForAllPlaylist,
            });

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const mockSendFunctionCallArgs = sendSpy.mock
                .calls[0][0] as PutCommand;

            expect(mockSendFunctionCallArgs).toBeInstanceOf(PutCommand);

            expect(mockSendFunctionCallArgs.input.Item).toEqual({
                PartitionKey: "TrackedPlaylist",
                SortKey: spotifyPlaylist.id,
                Data: {
                    spotifyPlaylist: spotifyPlaylist,
                    madeForAllPlaylist: {
                        id: "made-for-all-playlist-id",
                        createdAt: now,
                    },
                },
            });
        });
    });

    describe("deleteMadeForAllPlaylist", () => {
        it("should delete the madeForAll playlist", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";
            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");

            // Act
            await sut.deleteMadeForAllPlaylist(spotifyPlaylistId);

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const mockSendFunctionCallArgs = sendSpy.mock
                .calls[0][0] as DeleteCommand;
            expect(mockSendFunctionCallArgs).toBeInstanceOf(DeleteCommand);
            expect(mockSendFunctionCallArgs.input.Key).toEqual({
                PartitionKey: "TrackedPlaylist",
                SortKey: spotifyPlaylistId,
            });
        });
    });
});
