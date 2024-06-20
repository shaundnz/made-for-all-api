import { z } from "zod";

export const UpdateTrackedPlaylistRequestSchema = z.object({
    spotifyPlaylistId: z.string(),
});

export type UpdateTrackedPlaylistRequestDto = z.infer<
    typeof UpdateTrackedPlaylistRequestSchema
>;
