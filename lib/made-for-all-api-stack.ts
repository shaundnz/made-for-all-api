import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class MadeForAllApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new cdk.aws_dynamodb.TableV2(this, "MadeForAllTable", {
            partitionKey: {
                name: "PartitionKey",
                type: cdk.aws_dynamodb.AttributeType.STRING,
            },
            billing: cdk.aws_dynamodb.Billing.onDemand(),
        });

        const sampleLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
            this,
            "sample-lambda",
            {
                timeout: cdk.Duration.seconds(15),
                memorySize: 128,
                entry: "src/lambdas/sample-lambda/index.ts",
            }
        );

        const getTrackedPlaylistLambda =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                "get-tracked-playlist",
                {
                    timeout: cdk.Duration.seconds(15),
                    memorySize: 128,
                    entry: "src/lambdas/get-tracked-playlist/index.ts",
                    environment: this.getLambdaEnvVariables(table),
                }
            );

        table.grantReadData(getTrackedPlaylistLambda);

        const api = new cdk.aws_apigateway.RestApi(this, "made-for-all-api");

        const test = api.root.addResource("sample");
        test.addMethod(
            "GET",
            new cdk.aws_apigateway.LambdaIntegration(sampleLambda)
        );

        const playlists = api.root.addResource("playlists");

        const playlist = playlists.addResource("{id}");
        playlist.addMethod(
            "GET",
            new cdk.aws_apigateway.LambdaIntegration(getTrackedPlaylistLambda)
        );
    }

    private getLambdaEnvVariables(
        table: cdk.aws_dynamodb.TableV2
    ): Record<string, string> {
        return {
            DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT || "",
            DYNAMO_TABLE_NAME: table.tableName || "",
            SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
            SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
            SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN:
                process.env.SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN || "",
        };
    }
}
