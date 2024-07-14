import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { AccessToken } from "../../../entities";
import { AccessTokenRepository } from "../AccessTokenRepository";

describe("AccessTokenRepository", () => {
    let sut: AccessTokenRepository;
    let mockDynamoDBDocumentClient: any;
    let mockSendFunction: jest.Mock;

    beforeEach(() => {
        mockSendFunction = jest.fn();
        mockDynamoDBDocumentClient = {
            send: mockSendFunction,
        };
        sut = new AccessTokenRepository(mockDynamoDBDocumentClient);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getAccessToken", () => {
        it("should get the access token", async () => {
            // Arrange
            const accessToken: AccessToken = {
                token: "secretToken",
                expiry: new Date(),
            };

            mockSendFunction.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {
                        PartitionKey: "AccessToken",
                        SortKey: "AccessToken",
                        Data: accessToken,
                    },
                })
            );

            // Act
            const res = await sut.getAccessToken();

            // Assert
            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: GetCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(GetCommand);
            expect(mockSendFunctionCallArgs.input.Key).toEqual({
                PartitionKey: "AccessToken",
                SortKey: "AccessToken",
            });

            expect(res).not.toBeNull();
            expect(res?.token).toBe(accessToken.token);
            expect(res?.expiry).toEqual(accessToken.expiry);
        });

        it("should return null if the access token is not found", async () => {
            // Arrange
            mockSendFunction.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            // Act
            const res = await sut.getAccessToken();

            // Assert
            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: GetCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(GetCommand);
            expect(mockSendFunctionCallArgs.input.Key).toEqual({
                PartitionKey: "AccessToken",
                SortKey: "AccessToken",
            });

            expect(res).toBeNull();
        });
    });

    describe("upsertAccessToken", () => {
        it("should upsert the existing access token", async () => {
            // Arrange
            mockSendFunction.mockImplementationOnce(() => Promise.resolve());

            const accessToken: AccessToken = {
                token: "secretToken",
                expiry: new Date(),
            };

            // Act
            await sut.upsertAccessToken(accessToken);

            // Assert
            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: PutCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(PutCommand);
            expect(mockSendFunctionCallArgs.input.Item).toEqual({
                PartitionKey: "AccessToken",
                SortKey: "AccessToken",
                Data: {
                    token: accessToken.token,
                    expiry: accessToken.expiry.toISOString(),
                },
            });
        });
    });
});
