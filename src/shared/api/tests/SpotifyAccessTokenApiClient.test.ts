import { SpotifyAccessTokenApiClient } from "../SpotifyAccessTokenApiClient";
import { HTTPResponseError } from "../HTTPResponseError";
import { SpotifyGetAccessTokenResponse } from "../contracts";

describe("SpotifyAccessTokenApiClient", () => {
    let sut: SpotifyAccessTokenApiClient;

    beforeEach(() => {
        sut = new SpotifyAccessTokenApiClient();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("getNewAccessToken", () => {
        it("should get a new access token", async () => {
            // Arrange
            const mockAccessTokenResponseBody: SpotifyGetAccessTokenResponse = {
                access_token: "new_access_token",
                token_type: "Bearer",
                expires_in: 3600,
                scope: "user-read-private user-read-email",
            };

            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockImplementationOnce(() =>
                    Promise.resolve(
                        new Response(
                            JSON.stringify(mockAccessTokenResponseBody),
                            {
                                status: 200,
                                headers: { "Content-type": "application/json" },
                            }
                        )
                    )
                );

            process.env.SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN =
                "mock_refresh_token";
            process.env.SPOTIFY_CLIENT_ID = "mock_client_id";
            process.env.SPOTIFY_CLIENT_SECRET = "mock_client_secret";

            // Act
            const result = await sut.getNewAccessToken();

            // Assert
            expect(result).toEqual(mockAccessTokenResponseBody);
            expect(fetchSpy).toHaveBeenCalledWith(
                "https://accounts.spotify.com/api/token",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "content-type": "application/x-www-form-urlencoded",
                        Authorization:
                            "Basic " +
                            Buffer.from(
                                `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                            ).toString("base64"),
                    },
                    body: expect.any(URLSearchParams),
                })
            );
        });

        it("should throw an HTTPResponseError if the response is not 2XX", async () => {
            // Arrange
            const mockErrorResponse = new Response(null, {
                status: 400,
                statusText: "Bad Request",
            });

            jest.spyOn(global, "fetch").mockImplementationOnce(() =>
                Promise.resolve(mockErrorResponse)
            );

            process.env.SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN =
                "mock_refresh_token";
            process.env.SPOTIFY_CLIENT_ID = "mock_client_id";
            process.env.SPOTIFY_CLIENT_SECRET = "mock_client_secret";

            // Act & Assert
            await expect(sut.getNewAccessToken()).rejects.toThrow(
                HTTPResponseError
            );
        });
    });
});
