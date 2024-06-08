import { AccessTokenMapper } from "../AccessTokenMapper";

describe("AccessTokenMapper", () => {
    it("should map from an entity object to dynamo object", () => {
        // Arrange
        const expiry = new Date(2024, 5, 7, 10);

        const entity = {
            token: "secretToken",
            expiry: expiry,
        };

        // Act
        const dynamoObject = AccessTokenMapper.entityToDynamoObject(entity);

        // Assert
        expect(dynamoObject.token).toBe(entity.token);
        expect(dynamoObject.expiry).toBe(expiry.toISOString());
    });

    it("should map from a dynamo object to entity object", () => {
        // Arrange
        const expiry = new Date(2024, 5, 7, 10).toISOString();

        const dynamoObject = {
            token: "secretToken",
            expiry: expiry,
        };

        // Act
        const entity = AccessTokenMapper.dynamoObjectToEntity(dynamoObject);

        // Assert
        expect(entity.token).toBe(dynamoObject.token);
        expect(entity.expiry).toBeInstanceOf(Date);
        expect(entity.expiry.toISOString()).toBe(expiry);
    });
});
