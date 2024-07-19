import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { SpotifyApiClient } from "../../shared/api/SpotifyApiClient";
import {
    AccessTokenRepository,
    AccessTokenService,
} from "../../shared/modules/accessToken";
import { SpotifyAccessTokenApiClient } from "../../shared/api";
import {
    MadeForAllRepository,
    MadeForAllService,
} from "../../shared/modules/madeForAll";
import {
    CreateTrackedPlaylistRequestDto,
    CreateTrackedPlaylistRequestSchema,
    CreateTrackedPlaylistResponseDto,
} from "../../shared/api/contracts";
import { SafeParseReturnType } from "zod";
import { getCorsHeaders, safeParseJSON } from "../../shared/utils";

const client = new DynamoDBClient({
    endpoint: process.env.DYNAMO_ENDPOINT,
});

const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    // Validate payload
    const parseRes: SafeParseReturnType<
        unknown,
        CreateTrackedPlaylistRequestDto
    > = CreateTrackedPlaylistRequestSchema.safeParse(safeParseJSON(event.body));

    if (!parseRes.success) {
        return {
            body: JSON.stringify(parseRes.error),
            statusCode: 400,
        };
    }

    const { spotifyPlaylistId }: CreateTrackedPlaylistRequestDto =
        parseRes.data;

    const accessTokenService = new AccessTokenService(
        new AccessTokenRepository(dynamo),
        new SpotifyAccessTokenApiClient()
    );

    const accessToken = await accessTokenService.getValidAccessToken();

    const madeForAllService = new MadeForAllService(
        new MadeForAllRepository(dynamo),
        new SpotifyApiClient(accessToken)
    );

    const existingMadeForAllPlaylist =
        await madeForAllService.getTrackedPlaylist(spotifyPlaylistId);

    if (existingMadeForAllPlaylist !== null) {
        return {
            statusCode: 409,
            body: JSON.stringify({
                message: `Playlist Id: ${spotifyPlaylistId} is already tracked`,
            }),
        };
    }

    const response: CreateTrackedPlaylistResponseDto =
        await madeForAllService.createMadeForAllPlaylist(spotifyPlaylistId);

    return {
        statusCode: 201,
        headers: getCorsHeaders(event.headers.origin || ""),
        body: JSON.stringify(response),
    };
};
