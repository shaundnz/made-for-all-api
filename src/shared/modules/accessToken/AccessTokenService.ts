import { AccessTokenRepository } from "./AccessTokenRepository";
import { SpotifyAccessTokenApiClient } from "../../api";

export class AccessTokenService {
    private accessTokenRepository: AccessTokenRepository;
    private spotifyApiClient: SpotifyAccessTokenApiClient;

    constructor(
        accessTokenRepository: AccessTokenRepository,
        spotifyApiAccessTokenClient: SpotifyAccessTokenApiClient
    ) {
        this.accessTokenRepository = accessTokenRepository;
        this.spotifyApiClient = spotifyApiAccessTokenClient;
    }

    private async getNewAccessToken(): Promise<string> {
        const accessTokenResponse =
            await this.spotifyApiClient.getNewAccessToken();

        await this.accessTokenRepository.upsertAccessToken({
            token: accessTokenResponse.access_token,
            expiry: new Date(
                Date.now() + accessTokenResponse.expires_in * 1000
            ),
        });

        return accessTokenResponse.access_token;
    }

    public async getValidAccessToken(): Promise<string> {
        const accessToken = await this.accessTokenRepository.getAccessToken();

        // Get a new access token if none exist or there is equal or less than 5 minutes to expiry
        if (
            accessToken === null ||
            accessToken.expiry.getTime() <= Date.now() + 5 * 60 * 1000
        ) {
            const newAccessToken = await this.getNewAccessToken();
            return newAccessToken;
        }

        return accessToken.token;
    }
}
