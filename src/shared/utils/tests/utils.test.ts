import { splitArrayIntoChunks } from "../utils";

describe("splitArrayIntoChunks", () => {
    it("should split the array into chunks", () => {
        const chunkSize = 2;
        const arr = ["a", "b", "c", "d", "e", "f", "g"];

        const chunks = splitArrayIntoChunks(arr, chunkSize);

        expect(chunks.length).toBe(4);
        expect(chunks).toEqual([["a", "b"], ["c", "d"], ["e", "f"], ["g"]]);
    });
});
