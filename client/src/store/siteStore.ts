import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Site {
  id: number;
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

interface SiteStore {
  selectedSiteId: number | null;
  selectedSite: Site | null;
  setSelectedSite: (siteId: number, site: Site) => void;
  clearSelectedSite: () => void;
}

export const useSiteStore = create<SiteStore>()(
  persist(
    (set) => ({
      selectedSiteId: null,
      selectedSite: null,
      setSelectedSite: (siteId: number, site: Site) => {
        set({ selectedSiteId: siteId, selectedSite: site });
      },
      clearSelectedSite: () => {
        set({ selectedSiteId: null, selectedSite: null });
      },
    }),
    {
      name: 'site-storage', // localStorage에 저장될 key 이름
    }
  )
);

