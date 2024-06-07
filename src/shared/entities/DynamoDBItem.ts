export interface DynamoDBItem<T> {
    PartitionKey: string;
    Data: T;
}
