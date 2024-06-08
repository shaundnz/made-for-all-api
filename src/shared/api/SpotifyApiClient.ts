import fetch from "node-fetch";
import { HTTPResponseError } from "./HTTPResponseError";
import { SpotifyGetAccessTokenResponse } from "./contracts";

export class SpotifyApiClient {
    public async getNewAccessToken(): Promise<SpotifyGetAccessTokenResponse> {
        const params = new URLSearchParams([
            ["grant_type", "refresh_token"],
            [
                "refresh_token",
                process.env.SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN,
            ],
        ]);

        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        process.env.SPOTIFY_CLIENT_ID +
                            ":" +
                            process.env.SPOTIFY_CLIENT_SECRET
                    ).toString("base64"),
            },
            body: params,
        });

        if (!res.ok) {
            throw new HTTPResponseError(res);
        }

        const data = (await res.json()) as SpotifyGetAccessTokenResponse;

        return data;
    }
}
