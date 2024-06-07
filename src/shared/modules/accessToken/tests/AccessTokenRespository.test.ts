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
            const accessToken: AccessToken = {
                token: "secretToken",
                expiry: new Date(),
            };

            mockSendFunction.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: {
                        PartitionKey: "AccessKey",
                        Data: accessToken,
                    },
                })
            );

            const res = await sut.getAccessToken();

            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: GetCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(GetCommand);
            expect(mockSendFunctionCallArgs.input.Key).toEqual({
                PartitionKey: "AccessToken",
            });

            expect(res).not.toBeNull();
            expect(res?.token).toBe(accessToken.token);
            expect(res?.expiry).toBe(accessToken.expiry);
        });

        it("should return null if the access token is not found", async () => {
            mockSendFunction.mockImplementationOnce(() =>
                Promise.resolve({
                    Item: null,
                })
            );

            const res = await sut.getAccessToken();

            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: GetCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(GetCommand);
            expect(mockSendFunctionCallArgs.input.Key).toEqual({
                PartitionKey: "AccessToken",
            });

            expect(res).toBeNull();
        });
    });

    describe("upsertAccessToken", () => {
        it("should upsert the existing access token", async () => {
            mockSendFunction.mockImplementationOnce(() => Promise.resolve());

            const accessToken: AccessToken = {
                token: "secretToken",
                expiry: new Date(),
            };

            await sut.upsertAccessToken(accessToken);

            expect(mockSendFunction).toHaveBeenCalled();

            const mockSendFunctionCallArgs: PutCommand =
                mockSendFunction.mock.lastCall[0];

            expect(mockSendFunctionCallArgs).toBeInstanceOf(PutCommand);
            expect(mockSendFunctionCallArgs.input.Item).toEqual({
                PartitionKey: "AccessToken",
                Data: accessToken,
            });
        });
    });
});
