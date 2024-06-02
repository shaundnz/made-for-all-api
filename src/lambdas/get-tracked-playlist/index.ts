import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const playlistId = event.pathParameters?.id;

  return {
    statusCode: 200,
    body: JSON.stringify({
      messages: `Get playlist with id ${playlistId}`,
    }),
  };
};
