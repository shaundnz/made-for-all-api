export interface DynamoDBItem<T> {
    PartitionKey: string;
    SortKey: string;
    Data: T;
}
