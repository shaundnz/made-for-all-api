import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
    AllPlaylistsRepository,
    MadeForAllRepository,
    MadeForAllService,
} from "../../shared/modules/madeForAll";
import { GetTrackedPlaylistResponseDto } from "../../shared/api/contracts";
import {
    AccessTokenRepository,
    AccessTokenService,
} from "../../shared/modules/accessToken";
import {
    SpotifyAccessTokenApiClient,
    SpotifyApiClient,
} from "../../shared/api";

const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_ENDPOINT,
});

const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const playlistId = event.pathParameters?.id;

    if (!playlistId) {
        return { statusCode: 400, body: "" };
    }

    const accessTokenService = new AccessTokenService(
        new AccessTokenRepository(dynamo),
        new SpotifyAccessTokenApiClient()
    );

    const accessToken = await accessTokenService.getValidAccessToken();

    const madeForAllService = new MadeForAllService(
        new MadeForAllRepository(dynamo),
        new AllPlaylistsRepository(dynamo),
        new SpotifyApiClient(accessToken)
    );

    const trackedPlaylist = await madeForAllService.getTrackedPlaylist(
        playlistId
    );

    if (!trackedPlaylist) {
        return {
            statusCode: 404,
            body: "",
        };
    }

    const response: GetTrackedPlaylistResponseDto = trackedPlaylist;

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
};
