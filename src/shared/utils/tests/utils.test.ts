import { safeParseJSON, splitArrayIntoChunks } from "../utils";

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
