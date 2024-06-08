import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
    MadeForAllRepository,
    MadeForAllService,
} from "../../shared/modules/madeForAll";
import { GetTrackedPlaylistResponse } from "../../shared/api/contracts";

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

    const madeForAllService = new MadeForAllService(
        new MadeForAllRepository(dynamo)
    );

    const madeForPlaylistId = await madeForAllService.getMadeForAllPlaylistId(
        playlistId
    );

    if (!madeForPlaylistId) {
        return {
            statusCode: 404,
            body: "",
        };
    }

    const responseBody: GetTrackedPlaylistResponse = {
        spotifyPlaylistId: playlistId,
        madeForAllPlaylistId: madeForPlaylistId,
    };

    return {
        statusCode: 200,
        body: JSON.stringify(responseBody),
    };
};
