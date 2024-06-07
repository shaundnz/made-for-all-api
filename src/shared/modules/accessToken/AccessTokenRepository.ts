import {
    DynamoDBDocumentClient,
    GetCommand,
    PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { AccessToken, DynamoDBItem } from "../../entities";

export class AccessTokenRepository {
    private dynamo: DynamoDBDocumentClient;

    constructor(dynamo: DynamoDBDocumentClient) {
        this.dynamo = dynamo;
    }

    public async getAccessToken(): Promise<AccessToken | null> {
        const getAccessTokenOutput = await this.dynamo.send(
            new GetCommand({
                TableName: process.env.DYNAMO_TABLE_NAME,
                Key: { PartitionKey: "AccessToken" },
            })
        );

        if (!getAccessTokenOutput.Item) {
            return null;
        }

        const item = getAccessTokenOutput.Item as DynamoDBItem<AccessToken>;

        return item.Data;
    }

    public async upsertAccessToken(accessToken: AccessToken) {
        const item: DynamoDBItem<AccessToken> = {
            PartitionKey: "AccessToken",
            Data: accessToken,
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
