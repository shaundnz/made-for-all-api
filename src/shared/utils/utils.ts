export const splitArrayIntoChunks = <T>(
    array: T[],
    chunkSize: number
): T[][] => {
    const result = array.reduce((resultArray: T[][], item, index) => {
        const chunkIndex = Math.floor(index / chunkSize);

        if (!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []; // start a new chunk
        }

        resultArray[chunkIndex].push(item);

        return resultArray;
    }, []);

    return result;
};

export const safeParseJSON = (data: any) => {
    try {
        return JSON.parse(data);
    } catch (ex) {
        return null;
    }
};

export const getCorsHeaders = () => ({
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": `https://${process.env.MADE_FOR_ALL_CLIENT_BASE_URL}`,
    "Access-Control-Allow-Methods": "*",
});
