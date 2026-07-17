// "Who are you?" identity, persisted locally. No login — just the selected
// traveller, remembered across launches and changeable any time.
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TRAVELLERS, Traveller } from "./data";

const KEY = "ct.profileId";

interface ProfileCtx {
  ready: boolean;
  profileId: string | null;
  profile: Traveller | null;
  setProfile: (id: string) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const Ctx = createContext<ProfileCtx | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(KEY);
        if (v && TRAVELLERS.some((t) => t.id === v)) setProfileId(v);
      } catch {
        // ignore
      }
      setReady(true);
    })();
  }, []);

  const setProfile = useCallback(async (id: string) => {
    setProfileId(id);
    try {
      await AsyncStorage.setItem(KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const clearProfile = useCallback(async () => {
    setProfileId(null);
    try {
      await AsyncStorage.removeItem(KEY);
    } catch {
      // ignore
    }
  }, []);

  const profile = useMemo(
    () => (profileId ? TRAVELLERS.find((t) => t.id === profileId) ?? null : null),
    [profileId]
  );

  const value = useMemo(
    () => ({ ready, profileId, profile, setProfile, clearProfile }),
    [ready, profileId, profile, setProfile, clearProfile]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProfile(): ProfileCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useProfile must be used within ProfileProvider");
  return c;
}
