import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { MadeForAllRepository } from "../MadeForAllRepository";
import { MadeForAllPlaylist } from "../../../entities";

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

            const madeForAllPlaylist: MadeForAllPlaylist = {
                madeForAllPlaylistId: "made-for-all-playlist-id",
            };

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {
                        PartitionKey: spotifyPlaylistId,
                        Data: madeForAllPlaylist,
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

            expect(res).toBe(madeForAllPlaylist.madeForAllPlaylistId);
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

    describe("upsertMadeForAllPlaylist", () => {
        it("should upsert the existing madeForAll playlist", async () => {
            // Arrange
            const spotifyPlaylistId = "spotify-playlist-id";

            const madeForAllPlaylist: MadeForAllPlaylist = {
                madeForAllPlaylistId: "made-for-all-playlist-id",
            };

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() => Promise.resolve());

            // Act
            await sut.upsertMadeForAllPlaylist(
                spotifyPlaylistId,
                madeForAllPlaylist
            );

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const mockSendFunctionCallArgs = sendSpy.mock
                .calls[0][0] as PutCommand;

            expect(mockSendFunctionCallArgs).toBeInstanceOf(PutCommand);

            expect(mockSendFunctionCallArgs.input.Item).toEqual({
                PartitionKey: spotifyPlaylistId,
                Data: madeForAllPlaylist,
            });
        });
    });
});
