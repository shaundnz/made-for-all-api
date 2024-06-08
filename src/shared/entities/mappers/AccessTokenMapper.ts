import { AccessToken } from "../AccessToken";
import { DynamoAccessToken } from "../dynamo";

export class AccessTokenMapper {
    public static entityToDynamoObject(entity: AccessToken): DynamoAccessToken {
        return {
            token: entity.token,
            expiry: entity.expiry.toISOString(),
        };
    }

    public static dynamoObjectToEntity(
        dynamoObject: DynamoAccessToken
    ): AccessToken {
        return {
            token: dynamoObject.token,
            expiry: new Date(dynamoObject.expiry),
        };
    }
}
