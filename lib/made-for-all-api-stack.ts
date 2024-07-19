import "dotenv/config";
import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";

export class MadeForAllApiStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new cdk.aws_dynamodb.TableV2(this, "MadeForAllTable", {
            partitionKey: {
                name: "PartitionKey",
                type: cdk.aws_dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "SortKey",
                type: cdk.aws_dynamodb.AttributeType.STRING,
            },
            billing: cdk.aws_dynamodb.Billing.onDemand(),
        });

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

        const getAllTrackedPlaylistLambda =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                "get-all-tracked-playlists",
                {
                    timeout: cdk.Duration.seconds(15),
                    memorySize: 128,
                    entry: "src/lambdas/get-all-tracked-playlists/index.ts",
                    environment: this.getLambdaEnvVariables(table),
                }
            );

        const createTrackedPlaylistLambda =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                "create-tracked-playlist",
                {
                    timeout: cdk.Duration.seconds(15),
                    memorySize: 128,
                    entry: "src/lambdas/create-tracked-playlist/index.ts",
                    environment: this.getLambdaEnvVariables(table),
                }
            );

        const updateTrackedPlaylistLambda =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                "upsert-tracked-playlist",
                {
                    timeout: cdk.Duration.seconds(15),
                    memorySize: 128,
                    entry: "src/lambdas/update-tracked-playlist/index.ts",
                    environment: this.getLambdaEnvVariables(table),
                }
            );

        const deleteTrackedPlaylistLambda =
            new cdk.aws_lambda_nodejs.NodejsFunction(
                this,
                "delete-tracked-playlist",
                {
                    timeout: cdk.Duration.seconds(15),
                    memorySize: 128,
                    entry: "src/lambdas/delete-tracked-playlist/index.ts",
                    environment: this.getLambdaEnvVariables(table),
                }
            );

        table.grantReadWriteData(getTrackedPlaylistLambda);
        table.grantReadWriteData(getAllTrackedPlaylistLambda);
        table.grantReadWriteData(createTrackedPlaylistLambda);
        table.grantReadWriteData(updateTrackedPlaylistLambda);
        table.grantReadWriteData(deleteTrackedPlaylistLambda);

        const certificateArn = process.env.AWS_CERTIFICATE_ARN || "";

        const certificate = acm.Certificate.fromCertificateArn(
            this,
            "MadeForAllCertificate",
            certificateArn
        );

        const api = new cdk.aws_apigateway.RestApi(this, "made-for-all-api", {
            defaultCorsPreflightOptions: {
                allowOrigins: ["http://localhost:5173"],
            },
        });

        const domain = new cdk.aws_apigateway.DomainName(
            this,
            "MadeForAllApiDomain",
            {
                domainName: process.env.MADE_FOR_ALL_API_BASE_URL || "",
                certificate,
            }
        );

        new cdk.aws_apigateway.BasePathMapping(this, "MadeForAllApiMapping", {
            domainName: domain,
            restApi: api,
        });

        // /playlists
        const playlists = api.root.addResource("playlists");

        playlists.addMethod(
            "GET",
            new cdk.aws_apigateway.LambdaIntegration(
                getAllTrackedPlaylistLambda
            )
        );

        playlists.addMethod(
            "POST",
            new cdk.aws_apigateway.LambdaIntegration(
                createTrackedPlaylistLambda
            )
        );

        playlists.addMethod(
            "PUT",
            new cdk.aws_apigateway.LambdaIntegration(
                updateTrackedPlaylistLambda
            )
        );

        // /playlists/:id
        const playlist = playlists.addResource("{id}");

        playlist.addMethod(
            "GET",
            new cdk.aws_apigateway.LambdaIntegration(getTrackedPlaylistLambda)
        );

        playlist.addMethod(
            "DELETE",
            new cdk.aws_apigateway.LambdaIntegration(
                deleteTrackedPlaylistLambda
            )
        );

        new cdk.CfnOutput(this, "MadeForAllApi", { value: api.url });
    }

    private getLambdaEnvVariables(
        table: cdk.aws_dynamodb.TableV2
    ): Record<string, string> {
        return {
            DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT || "",
            DYNAMO_TABLE_NAME: process.env.DYNAMO_TABLE_NAME || table.tableName,
            SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
            SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
            SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN:
                process.env.SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN || "",
        };
    }
}
