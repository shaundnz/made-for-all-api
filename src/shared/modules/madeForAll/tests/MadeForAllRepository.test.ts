import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { MadeForAllRepository } from "../MadeForAllRepository";
import { PlaylistData, TrackedPlaylist } from "../../../entities";

describe("MadeForAllRepository", () => {
    let sut: MadeForAllRepository;
    let mockDynamoDBDocumentClient: DynamoDBDocumentClient;

    beforeEach(() => {
        mockDynamoDBDocumentClient = {
            send: jest.fn(),
        } as unknown as DynamoDBDocumentClient;

        sut = new MadeForAllRepository(mockDynamoDBDocumentClient);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getMadeForAllPlaylistId", () => {
        it("should return the madeForAll playlist id if the playlist exists", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";

            const trackedPlaylist = {
                madeForAllPlaylist: {
                    id: "made-for-all-playlist-id",
                },
                spotifyPlaylist: {
                    id: spotifyPlaylistId,
                },
            } as TrackedPlaylist;

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {
                        PartitionKey: spotifyPlaylistId,
                        Data: trackedPlaylist,
                    },
                })
            );

            // Act
            const res = await sut.getMadeForAllPlaylistId(spotifyPlaylistId);

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: spotifyPlaylistId,
            });

            expect(res).toBe(trackedPlaylist.madeForAllPlaylist.id);
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
            const res = await sut.getMadeForAllPlaylistId(spotifyPlaylistId);

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: spotifyPlaylistId,
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
            } as PlaylistData;

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");

            // Act
            await sut.upsertTrackedPlaylist(
                spotifyPlaylist,
                madeForAllPlaylist
            );

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const mockSendFunctionCallArgs = sendSpy.mock
                .calls[0][0] as PutCommand;

            expect(mockSendFunctionCallArgs).toBeInstanceOf(PutCommand);

            expect(mockSendFunctionCallArgs.input.Item).toEqual({
                PartitionKey: spotifyPlaylist.id,
                Data: {
                    spotifyPlaylist: spotifyPlaylist,
                    madeForAllPlaylist: madeForAllPlaylist,
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
                PartitionKey: spotifyPlaylistId,
            });
        });
    });
});
