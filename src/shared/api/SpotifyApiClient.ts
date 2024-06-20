import {
    Playlist,
    SpotifyApi,
    Track,
    TrackItem,
} from "@spotify/web-api-ts-sdk";
import { splitArrayIntoChunks } from "../utils";

const MADE_FOR_ALL_USER_ID = "31bowcqwxwyhoxvonqpfuhj3azjm";

export class SpotifyApiClient {
    private spotifyClient: SpotifyApi;
    private authenticatedMadeForAllClient: SpotifyApi;

    constructor(validAccessToken: string) {
        this.spotifyClient = SpotifyApi.withClientCredentials(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET
        );

        this.authenticatedMadeForAllClient = SpotifyApi.withClientCredentials(
            process.env.SPOTIFY_CLIENT_ID,
            process.env.SPOTIFY_CLIENT_SECRET,
            undefined,
            {
                fetch: (req, init) => {
                    if (init) {
                        const withAccessToken = new Headers(init.headers);
                        withAccessToken.delete("Authorization");
                        withAccessToken.append(
                            "Authorization",
                            `Bearer ${validAccessToken}`
                        );
                        init.headers = withAccessToken;
                    }
                    return fetch(req, init);
                },
            }
        );
    }

    public async getPlaylistWithAllTracks(
        playlistId: string
    ): Promise<Playlist<Track>> {
        const playlist = await this.spotifyClient.playlists.getPlaylist(
            playlistId
        );

        const trackItems = [...playlist.tracks.items];
        let fetchedAllTracks = !playlist.tracks.next;
        let offset = playlist.tracks.limit;
        const limit = 50;

        while (!fetchedAllTracks) {
            const playlistTracksRes =
                await this.spotifyClient.playlists.getPlaylistItems(
                    playlistId,
                    undefined,
                    undefined,
                    limit,
                    offset
                );
            trackItems.push(...playlistTracksRes.items);
            offset = offset + limit;
            fetchedAllTracks = !playlistTracksRes.next;
        }

        playlist.tracks.items = trackItems;

        return playlist;
    }

    public async createMadeForAllPlaylist(
        originalPlaylist: Playlist<Track>
    ): Promise<Playlist<TrackItem>> {
        const createdPlaylist =
            await this.authenticatedMadeForAllClient.playlists.createPlaylist(
                MADE_FOR_ALL_USER_ID,
                {
                    name: `MadeForAll - ${originalPlaylist.name}`,
                    description: originalPlaylist.description,
                }
            );

        const playlistCover = await this.getPlaylistCoverImageInBase64String(
            originalPlaylist
        );

        await new Promise((r) => setTimeout(r, 400));

        await this.authenticatedMadeForAllClient.playlists.addCustomPlaylistCoverImageFromBase64String(
            createdPlaylist.id,
            playlistCover
        );

        return createdPlaylist;
    }

    public async updateMadeForAllPlaylistTracks(
        originalPlaylistWithAllTracks: Playlist<TrackItem>,
        targetPlaylistWithAllTracks: Playlist<TrackItem>
    ) {
        // Remove Current All Songs
        const tracksToRemoveUriChunks = splitArrayIntoChunks(
            targetPlaylistWithAllTracks.tracks.items.map((track) => ({
                uri: track.track.uri,
            })),
            100
        );

        for (let i = 0; i < tracksToRemoveUriChunks.length; i++) {
            await this.authenticatedMadeForAllClient.playlists.removeItemsFromPlaylist(
                targetPlaylistWithAllTracks.id,
                { tracks: tracksToRemoveUriChunks[i] }
            );
        }

        // Add Songs
        const tracksToAddUriChunks = splitArrayIntoChunks(
            originalPlaylistWithAllTracks.tracks.items.map(
                (track) => track.track.uri
            ),
            100
        );

        for (let i = 0; i < tracksToAddUriChunks.length; i++) {
            await this.authenticatedMadeForAllClient.playlists.addItemsToPlaylist(
                targetPlaylistWithAllTracks.id,
                tracksToAddUriChunks[i]
            );
        }
    }

    // Playlist aren't actually deleted, the user just unfollows it.
    public async deleteMadeForAllPlaylist(madeForAllPlaylistId: string) {
        await this.authenticatedMadeForAllClient.currentUser.playlists.unfollow(
            madeForAllPlaylistId
        );
    }

    private async getPlaylistCoverImageInBase64String(
        playlist: Playlist<Track>
    ): Promise<string> {
        const imageUrl = playlist.images[0].url;

        const res = await fetch(imageUrl);

        const imageBuffer = await res.arrayBuffer();

        return Buffer.from(imageBuffer).toString("base64");
    }
}
