import {
    DeleteCommand,
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBItem, PlaylistData, TrackedPlaylist } from "../../entities";

export class MadeForAllRepository {
    private dynamo: DynamoDBDocumentClient;

    constructor(dynamo: DynamoDBDocumentClient) {
        this.dynamo = dynamo;
    }

    public async getAllTrackedPlaylists(): Promise<TrackedPlaylist[]> {
        const getAllPlaylistsOutput = await this.dynamo.send(
            new QueryCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                KeyConditionExpression:
                    "#PartitionKey = :trackedPlaylistPartitionKey",
                ExpressionAttributeNames: {
                    "#PartitionKey": "PartitionKey",
                },
                ExpressionAttributeValues: {
                    ":trackedPlaylistPartitionKey": `TrackedPlaylist`,
                },
            })
        );

        if (!getAllPlaylistsOutput.Items) {
            return [];
        }

        const allPlaylistItems =
            getAllPlaylistsOutput.Items as DynamoDBItem<TrackedPlaylist>[];

        return allPlaylistItems.map((item) => item.Data);
    }

    public async getTrackedPlaylist(
        spotifyPlaylistId: string
    ): Promise<TrackedPlaylist | null> {
        const getMadeForAllPlaylistOutput = await this.dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: {
                    PartitionKey: "TrackedPlaylist",
                    SortKey: spotifyPlaylistId,
                },
            })
        );

        if (!getMadeForAllPlaylistOutput.Item) {
            return null;
        }

        const item =
            getMadeForAllPlaylistOutput.Item as DynamoDBItem<TrackedPlaylist>;

        return item.Data;
    }

    public async upsertTrackedPlaylist(
        spotifyPlaylist: PlaylistData,
        madeForAllPlaylist: PlaylistData
    ) {
        const item: DynamoDBItem<TrackedPlaylist> = {
            PartitionKey: "TrackedPlaylist",
            SortKey: spotifyPlaylist.id,
            Data: {
                spotifyPlaylist: spotifyPlaylist,
                madeForAllPlaylist: madeForAllPlaylist,
            },
        };

        await this.dynamo.send(
            new PutCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Item: item,
            })
        );

        return;
    }

    public async deleteMadeForAllPlaylist(spotifyPlaylistId: string) {
        await this.dynamo.send(
            new DeleteCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: {
                    PartitionKey: "TrackedPlaylist",
                    SortKey: spotifyPlaylistId,
                },
            })
        );
    }
}
