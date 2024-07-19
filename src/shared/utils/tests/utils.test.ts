import { getCorsHeaders, safeParseJSON, splitArrayIntoChunks } from "../utils";

describe("splitArrayIntoChunks", () => {
    it("should split the array into chunks", () => {
        const chunkSize = 2;
        const arr = ["a", "b", "c", "d", "e", "f", "g"];

        const chunks = splitArrayIntoChunks(arr, chunkSize);

        expect(chunks.length).toBe(4);
        expect(chunks).toEqual([["a", "b"], ["c", "d"], ["e", "f"], ["g"]]);
    });
});

describe("safeParseJSON", () => {
    it("should parse valid JSON", () => {
        const data = {
            spotifyPlaylistId: "37i9dQZF1DX6wk8dYln4y0",
        };

        const res = safeParseJSON(JSON.stringify(data));
        expect(res).toBeDefined();
        expect(res).toEqual(data);
    });

    it.each([
        "string",
        undefined,
        null,
        '{"hello": "world"',
        '{"hello": "world}',
        '{hello: "world"}',
    ])("should return null if data is invalid JSON", (data) => {
        const res = safeParseJSON(data);
        expect(res).toBeNull();
    });
});

describe("getCorsHeaders", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules(); // Clears any cache
        process.env = { ...originalEnv }; // Copy the original env
    });

    afterEach(() => {
        process.env = originalEnv; // Restore the original env
    });

    it("should return correct headers for allowed domain without www", () => {
        process.env.MADE_FOR_ALL_CLIENT_BASE_URL = "madeforall.shaundnz.com";
        const origin = "https://madeforall.shaundnz.com";

        const headers = getCorsHeaders(origin);

        expect(headers).toEqual({
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "*",
        });
    });

    it("should return correct headers for allowed domain with www", () => {
        process.env.MADE_FOR_ALL_CLIENT_BASE_URL = "madeforall.shaundnz.com";
        const origin = "https://www.madeforall.shaundnz.com";

        const headers = getCorsHeaders(origin);

        expect(headers).toEqual({
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "*",
        });
    });

    it("should return empty object for non-allowed domain", () => {
        process.env.MADE_FOR_ALL_CLIENT_BASE_URL = "madeforall.shaundnz.com";
        const origin = "https://notallowed.shaundnz.com";

        const headers = getCorsHeaders(origin);

        expect(headers).toEqual({});
    });
});
