import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { AllPlaylists, DynamoDBItem } from "../../entities";

export class AllPlaylistsRepository {
    private dynamo: DynamoDBDocumentClient;

    constructor(dynamo: DynamoDBDocumentClient) {
        this.dynamo = dynamo;
    }

    public async getAllPlaylists(): Promise<AllPlaylists | null> {
        const getAllPlaylistsOutput = await this.dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: { PartitionKey: "AllPlaylists" },
            })
        );

        if (!getAllPlaylistsOutput.Item) {
            return null;
        }

        const item = getAllPlaylistsOutput.Item as DynamoDBItem<AllPlaylists>;

        return item.Data;
    }

    public async addPlaylistToDenormalizedAllPlaylistsItem(
        spotifyPlaylistId: string,
        madeForAllPlaylistId: string
    ) {
        const allPlaylistsObject = await this.getAllPlaylists();

        if (allPlaylistsObject === null) {
            const item: DynamoDBItem<AllPlaylists> = {
                PartitionKey: "AllPlaylists",
                Data: {},
            };

            await this.dynamo.send(
                new PutCommand({
                    TableName: process.env.DYNAMO_TABLE_NAME,
                    Item: item,
                })
            );
        }

        await this.dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: {
                    PartitionKey: "AllPlaylists",
                },
                UpdateExpression:
                    "SET #data.#spotifyPlaylistId = :madeForAllPlaylistId",
                ExpressionAttributeNames: {
                    "#data": "Data",
                    "#spotifyPlaylistId": spotifyPlaylistId,
                },
                ExpressionAttributeValues: {
                    ":madeForAllPlaylistId": madeForAllPlaylistId,
                },
            })
        );

        return;
    }

    public async removePlaylistFromDenormalizedAllPlaylistsItem(
        spotifyPlaylistId: string
    ) {
        await this.dynamo.send(
            new UpdateCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: {
                    PartitionKey: "AllPlaylists",
                },
                UpdateExpression: "REMOVE #data.#spotifyPlaylistId",
                ExpressionAttributeNames: {
                    "#data": "Data",
                    "#spotifyPlaylistId": spotifyPlaylistId,
                },
            })
        );

        return;
    }
}
