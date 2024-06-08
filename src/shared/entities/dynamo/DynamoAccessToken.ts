import { AccessToken } from "../AccessToken";
import { MapToDynamoObject } from "./MapToDynamoObject";

export type DynamoAccessToken = MapToDynamoObject<AccessToken>;
