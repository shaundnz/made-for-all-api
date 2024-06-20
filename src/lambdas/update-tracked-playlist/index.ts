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
    AllPlaylistsRepository,
    MadeForAllRepository,
    MadeForAllService,
} from "../../shared/modules/madeForAll";
import { SafeParseReturnType } from "zod";
import {
    CreateTrackedPlaylistRequestSchema,
    UpdateTrackedPlaylistRequestDto,
    UpdateTrackedPlaylistResponseDto,
} from "../../shared/api/contracts";
import { safeParseJSON } from "../../shared/utils";

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
        new AllPlaylistsRepository(dynamo),
        new SpotifyApiClient(accessToken)
    );

    const existingMadeForAllPlaylistId =
        await madeForAllService.getMadeForAllPlaylistId(spotifyPlaylistId);

    if (existingMadeForAllPlaylistId === null) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: `Playlist Id: ${spotifyPlaylistId} is not tracked`,
            }),
        };
    }

    await madeForAllService.updateMadeForAllPlaylist(
        spotifyPlaylistId,
        existingMadeForAllPlaylistId
    );

    const response: UpdateTrackedPlaylistResponseDto = {
        spotifyPlaylistId: spotifyPlaylistId,
        madeForAllPlaylistId: existingMadeForAllPlaylistId,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(response),
    };
};
