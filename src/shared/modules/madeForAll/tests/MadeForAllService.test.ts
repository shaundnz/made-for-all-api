import { MadeForAllRepository } from "../MadeForAllRepository";
import { MadeForAllService } from "../MadeForAllService";

describe("MadeForAllService", () => {
    let sut: MadeForAllService;
    let mockMadeForAllRepository: MadeForAllRepository;

    beforeEach(() => {
        mockMadeForAllRepository = {
            getMadeForAllPlaylistId: jest.fn(),
            upsertMadeForAllPlaylist: jest.fn(),
        } as unknown as MadeForAllRepository;

        sut = new MadeForAllService(mockMadeForAllRepository);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("getMadeForAllPlaylistId", () => {
        it("should return the madeForAll playlist id if the playlist is tracked", async () => {
            // Arrange
            const madeForAllId = "made-for-all-playlist-id";
            jest.spyOn(
                mockMadeForAllRepository,
                "getMadeForAllPlaylistId"
            ).mockImplementationOnce(() => Promise.resolve(madeForAllId));

            // Act
            const res = await sut.getMadeForAllPlaylistId("id");

            // Assert
            expect(res).toBe(madeForAllId);
        });

        it("should return null if the playlist is not tracked", async () => {
            // Arrange
            jest.spyOn(
                mockMadeForAllRepository,
                "getMadeForAllPlaylistId"
            ).mockImplementationOnce(() => Promise.resolve(null));

            // Act
            const res = await sut.getMadeForAllPlaylistId("id");

            // Assert
            expect(res).toBeNull();
        });
    });
});
