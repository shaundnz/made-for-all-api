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
