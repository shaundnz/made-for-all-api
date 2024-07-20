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

export const getCorsHeaders = (
    origin: string
):
    | {}
    | {
          "Access-Control-Allow-Headers": string;
          "Access-Control-Allow-Origin": string;
          "Access-Control-Allow-Methods": string;
      } => {
    const allowedDomains = [
        `https://${process.env.MADE_FOR_ALL_CLIENT_BASE_URL}`,
        `https://www.${process.env.MADE_FOR_ALL_CLIENT_BASE_URL}`,
        "http://localhost:5173",
        "http://localhost:4173",
    ];

    console.log(origin);

    if (allowedDomains.findIndex((domain) => domain === origin) === -1) {
        return {};
    }

    return {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "*",
    };
};
