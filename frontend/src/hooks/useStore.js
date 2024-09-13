import { create } from "zustand";
import { shuffleArray } from "@/lib/utils.js";
import { SOLANA_USERS } from "@/constants/index.js";

export const useStore = create((set) => ({
  featuredResults: [],
  topTen: [],
  setFeaturedResults: async (execute) => {
    const results = await Promise.all(
      shuffleArray(SOLANA_USERS).map((user) =>
        execute({ variables: { name: user } }),
      ),
    );

    const filteredResults = results
      .filter((res) => res.data)
      .map((res) => res.data.userByName);

    const topTenCreators = filteredResults.slice(0, 10);

    set({
      featuredResults: filteredResults,
      topTen: topTenCreators,
    });
  },
  setTopTen: (topTen) => set({ topTen }),
}));
