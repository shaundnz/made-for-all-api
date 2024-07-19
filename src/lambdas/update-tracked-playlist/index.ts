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
import { SafeParseReturnType } from "zod";
import {
    CreateTrackedPlaylistRequestSchema,
    UpdateTrackedPlaylistRequestDto,
    UpdateTrackedPlaylistResponseDto,
} from "../../shared/api/contracts";
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
        UpdateTrackedPlaylistRequestDto
    > = CreateTrackedPlaylistRequestSchema.safeParse(safeParseJSON(event.body));

    if (!parseRes.success) {
        return {
            body: JSON.stringify(parseRes.error),
            statusCode: 400,
        };
    }

    const { spotifyPlaylistId }: UpdateTrackedPlaylistRequestDto =
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

    const trackedPlaylist = await madeForAllService.getTrackedPlaylist(
        spotifyPlaylistId
    );

    if (trackedPlaylist === null) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: `Playlist Id: ${spotifyPlaylistId} is not tracked`,
            }),
        };
    }

    await madeForAllService.updateMadeForAllPlaylist(
        spotifyPlaylistId,
        trackedPlaylist.madeForAllPlaylist.id
    );

    const response: UpdateTrackedPlaylistResponseDto = {
        spotifyPlaylistId: spotifyPlaylistId,
        madeForAllPlaylistId: trackedPlaylist.madeForAllPlaylist.id,
    };

    return {
        statusCode: 200,
        headers: getCorsHeaders(event.headers.origin || ""),
        body: JSON.stringify(response),
    };
};
