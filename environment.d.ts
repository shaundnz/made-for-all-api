declare global {
    namespace NodeJS {
        interface ProcessEnv {
            [key: string]: string | undefined;
            DYNAMO_TABLE_NAME: string;
            DYNAMO_ENDPOINT: string;
            SPOTIFY_CLIENT_ID: string;
            SPOTIFY_CLIENT_SECRET: string;
            SPOTIFY_MADE_FOR_ALL_USER_REFRESH_TOKEN: string;
            MADE_FOR_ALL_API_BASE_URL: string;
        }
    }
}

export {};
