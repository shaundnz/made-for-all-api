import { SpotifyApiClient } from "../../../api/SpotifyApiClient";
import { AccessToken } from "../../../entities";
import { AccessTokenRepository } from "../AccessTokenRepository";
import { AccessTokenService } from "../AccessTokenService";

describe("AccessTokenService", () => {
    const now = new Date(2024, 5, 7, 10);
    let sut: AccessTokenService;
    let mockAccessTokenRepository: AccessTokenRepository;
    let mockSpotifyApiClient: SpotifyApiClient;

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(now);
        mockAccessTokenRepository = {
            getAccessToken: jest.fn(),
            upsertAccessToken: jest.fn(),
        } as unknown as AccessTokenRepository;

        mockSpotifyApiClient = {
            getNewAccessToken: jest.fn(),
        } as SpotifyApiClient;

        sut = new AccessTokenService(
            mockAccessTokenRepository,
            mockSpotifyApiClient
        );
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    describe("getValidAccessToken", () => {
        it("should get the access token", async () => {
            // Arrange
            const futureDate = new Date(now);
            futureDate.setMinutes(futureDate.getMinutes() + 30);
            const accessToken = {
                token: "validToken",
                expiry: futureDate,
            };

            const getAccessTokenSpy = jest.spyOn(
                mockAccessTokenRepository,
                "getAccessToken"
            );
            getAccessTokenSpy.mockImplementationOnce(() =>
                Promise.resolve(accessToken)
            );

            // Act
            const res = await sut.getValidAccessToken();

            // Assert
            expect(res).toBe(accessToken.token);
        });

        it.each([-5, 1, 3, 5])(
            "should get a new access token if the existing one is expired, is going to expire in equal or less than 5 minutes, and save the new access token",
            async (minutesToExpiry) => {
                // Arrange
                const expiryTime = new Date(now);
                expiryTime.setMinutes(
                    expiryTime.getMinutes() + minutesToExpiry
                );
                const accessToken = {
                    token: "validToken",
                    expiry: expiryTime,
                };

                const getAccessTokenSpy = jest
                    .spyOn(mockAccessTokenRepository, "getAccessToken")
                    .mockImplementationOnce(() => Promise.resolve(accessToken));

                const spotifyApiAccessTokenResponse = {
                    access_token: "newAccessToken",
                    expires_in: 3600,
                    scope: "some-scope",
                    token_type: "Bearer",
                };

                const spotifyClientGetNewAccessTokenSpy = jest
                    .spyOn(mockSpotifyApiClient, "getNewAccessToken")
                    .mockImplementationOnce(() =>
                        Promise.resolve(spotifyApiAccessTokenResponse)
                    );

                const upsertAccessTokenSpy = jest.spyOn(
                    mockAccessTokenRepository,
                    "upsertAccessToken"
                );

                // Act
                const res = await sut.getValidAccessToken();

                // Assert
                expect(getAccessTokenSpy).toHaveBeenCalled();

                expect(spotifyClientGetNewAccessTokenSpy).toHaveBeenCalled();
                expect(upsertAccessTokenSpy).toHaveBeenCalled();

                const upsertAccessTokenCallArgs = upsertAccessTokenSpy.mock
                    .lastCall?.[0] as AccessToken;

                expect(upsertAccessTokenCallArgs.token).toBe(
                    spotifyApiAccessTokenResponse.access_token
                );
                expect(upsertAccessTokenCallArgs.expiry.getTime()).toBe(
                    Date.now() + 1000 * spotifyApiAccessTokenResponse.expires_in
                );

                expect(res).toBe(spotifyApiAccessTokenResponse.access_token);
            }
        );
    });
});
