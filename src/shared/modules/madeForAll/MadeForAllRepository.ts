import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBItem, MadeForAllPlaylist } from "../../entities";

export class MadeForAllRepository {
    private dynamo: DynamoDBDocumentClient;

    constructor(dynamo: DynamoDBDocumentClient) {
        this.dynamo = dynamo;
    }

    public async getMadeForAllPlaylistId(
        spotifyPlaylistId: string
    ): Promise<string | null> {
        const getMadeForAllPlaylistOutput = await this.dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: { PartitionKey: spotifyPlaylistId },
            })
        );

        if (!getMadeForAllPlaylistOutput.Item) {
            return null;
        }

        const item =
            getMadeForAllPlaylistOutput.Item as DynamoDBItem<MadeForAllPlaylist>;

        return item.Data.madeForAllPlaylistId;
    }

    public async upsertMadeForAllPlaylist(
        spotifyPlaylistId: string,
        madeForAllPlaylist: MadeForAllPlaylist
    ) {
        const item: DynamoDBItem<MadeForAllPlaylist> = {
            PartitionKey: spotifyPlaylistId,
            Data: madeForAllPlaylist,
        };

        await this.dynamo.send(
            new PutCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Item: item,
            })
        );

        return;
    }
}
