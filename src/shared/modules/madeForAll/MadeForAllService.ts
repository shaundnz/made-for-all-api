import { MadeForAllRepository } from "./MadeForAllRepository";

export class MadeForAllService {
    private madeForAllRepository: MadeForAllRepository;

    constructor(madeForAllRepository: MadeForAllRepository) {
        this.madeForAllRepository = madeForAllRepository;
    }

    public async getMadeForAllPlaylistId(
        spotifyPlaylistId: string
    ): Promise<string | null> {
        return await this.madeForAllRepository.getMadeForAllPlaylistId(
            spotifyPlaylistId
        );
    }
}
