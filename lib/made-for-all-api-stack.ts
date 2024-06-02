import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class MadeForAllApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'MadeForAllApiQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });

    const sampleLambda = new cdk.aws_lambda_nodejs.NodejsFunction(
      this,
      "sample-lambda",
      {
        timeout: cdk.Duration.seconds(15),
        memorySize: 128,
        entry: "src/lambdas/sample-lambda/index.ts",
      }
    );

    const api = new cdk.aws_apigateway.RestApi(this, "made-for-all-api", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["http://127.0.0.1:5173", "http://localhost:5173"],
      },
    });

    const test = api.root.addResource("test");
    test.addMethod(
      "GET",
      new cdk.aws_apigateway.LambdaIntegration(sampleLambda)
    );
  }
}
