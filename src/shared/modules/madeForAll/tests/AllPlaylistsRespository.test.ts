import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AllPlaylistsRepository } from "../AllPlaylistsRepository";

describe("AllPlaylistsRepository", () => {
    let sut: AllPlaylistsRepository;
    let mockDynamoDBDocumentClient: DynamoDBDocumentClient;

    beforeEach(() => {
        mockDynamoDBDocumentClient = {
            send: jest.fn(),
        } as unknown as DynamoDBDocumentClient;

        sut = new AllPlaylistsRepository(mockDynamoDBDocumentClient);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getAllPlaylists", () => {
        it("should get all playlists", async () => {
            // Arrange
            const allPlaylists = { "123": "abc" };

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: { PartitionKey: "AllPlaylists", Data: allPlaylists },
                })
            );

            // Act
            const res = await sut.getAllPlaylists();

            // Assert
            expect(sendSpy).toHaveBeenCalled();
            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: "AllPlaylists",
            });

            expect(res).toEqual(allPlaylists);
        });

        it("should null if no playlists exist", async () => {
            // Arrange
            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            // Act
            const res = await sut.getAllPlaylists();

            // Assert
            expect(sendSpy).toHaveBeenCalled();
            const sendCommandArg = sendSpy.mock.calls[0][0] as GetCommand;

            expect(sendCommandArg).toBeInstanceOf(GetCommand);
            expect(sendCommandArg.input.Key).toEqual({
                PartitionKey: "AllPlaylists",
            });

            expect(res).toBeNull();
        });
    });

    describe("addPlaylistToDenormalizedAllPlaylistsItem", () => {
        it("should create the new all playlist item if it does not exist, then updates it", async () => {
            // Arrange
            const spotifyPlaylistId = "123";
            const madeForAllPlaylistId = "abc";

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            // Act
            await sut.addPlaylistToDenormalizedAllPlaylistsItem(
                spotifyPlaylistId,
                madeForAllPlaylistId
            );

            // Assert
            expect(sendSpy).toHaveBeenCalledTimes(3);

            const putCommandArg = sendSpy.mock.calls[1][0] as PutCommand;
            expect(putCommandArg).toBeInstanceOf(PutCommand);
            expect(putCommandArg.input.Item).toEqual({
                PartitionKey: "AllPlaylists",
                Data: {},
            });

            const updateCommandArg = sendSpy.mock.calls[2][0] as UpdateCommand;
            expect(updateCommandArg).toBeInstanceOf(UpdateCommand);
            expect(updateCommandArg.input.Key).toEqual({
                PartitionKey: "AllPlaylists",
            });
            expect(updateCommandArg.input.UpdateExpression).toBe(
                "SET #data.#spotifyPlaylistId = :madeForAllPlaylistId"
            );
        });

        it("should update item is the all playlists item already exists", async () => {
            // Arrange
            const spotifyPlaylistId = "123";
            const madeForAllPlaylistId = "abc";

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");
            sendSpy.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {},
                })
            );

            // Act
            await sut.addPlaylistToDenormalizedAllPlaylistsItem(
                spotifyPlaylistId,
                madeForAllPlaylistId
            );

            // Assert
            expect(sendSpy).toHaveBeenCalledTimes(2);

            const updateCommandArg = sendSpy.mock.calls[1][0] as UpdateCommand;
            expect(updateCommandArg).toBeInstanceOf(UpdateCommand);
            expect(updateCommandArg.input.Key).toEqual({
                PartitionKey: "AllPlaylists",
            });
            expect(updateCommandArg.input.UpdateExpression).toBe(
                "SET #data.#spotifyPlaylistId = :madeForAllPlaylistId"
            );
        });
    });

    describe("removePlaylistFromDenormalizedAllPlaylistsItem", () => {
        it("should remove the playlist from the all playlists object", async () => {
            // Arrange
            const spotifyPlaylistId = "123";

            const sendSpy = jest.spyOn(mockDynamoDBDocumentClient, "send");

            // Act
            await sut.removePlaylistFromDenormalizedAllPlaylistsItem(
                spotifyPlaylistId
            );

            // Assert
            expect(sendSpy).toHaveBeenCalled();

            const updateCommandArg = sendSpy.mock.calls[0][0] as UpdateCommand;
            expect(updateCommandArg).toBeInstanceOf(UpdateCommand);
            expect(updateCommandArg.input.Key).toEqual({
                PartitionKey: "AllPlaylists",
            });
            expect(updateCommandArg.input.UpdateExpression).toBe(
                "REMOVE #data.#spotifyPlaylistId"
            );
        });
    });
});
