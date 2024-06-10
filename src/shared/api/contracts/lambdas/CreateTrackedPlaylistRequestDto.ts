import { z } from "zod";

export const CreateTrackedPlaylistRequestSchema = z.object({
    spotifyPlaylistId: z.string(),
});

export type CreateTrackedPlaylistRequestDto = z.infer<
    typeof CreateTrackedPlaylistRequestSchema
>;
