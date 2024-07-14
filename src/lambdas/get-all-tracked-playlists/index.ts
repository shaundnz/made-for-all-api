import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResult } from "aws-lambda";
import {
    MadeForAllRepository,
    MadeForAllService,
} from "../../shared/modules/madeForAll";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import {
    SpotifyAccessTokenApiClient,
    SpotifyApiClient,
} from "../../shared/api";
import {
    AccessTokenRepository,
    AccessTokenService,
} from "../../shared/modules/accessToken";

const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_ENDPOINT,
});

const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (): Promise<APIGatewayProxyResult> => {
    const accessTokenService = new AccessTokenService(
        new AccessTokenRepository(dynamo),
        new SpotifyAccessTokenApiClient()
    );

    const accessToken = await accessTokenService.getValidAccessToken();

    const madeForAllService = new MadeForAllService(
        new MadeForAllRepository(dynamo),
        new SpotifyApiClient(accessToken)
    );

    const allPlaylistsResponse =
        await madeForAllService.getAllTrackedPlaylists();

    return {
        statusCode: 200,
        body: JSON.stringify(allPlaylistsResponse),
    };
};
