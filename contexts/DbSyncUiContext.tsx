import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BANNER_HEIGHT = 64;
const OFFSCREEN = -(BANNER_HEIGHT + 48);
const HOLD_MS = 4000;

export type DbSyncUiContextValue = {
  /** Dummy sync: shows top banner ~4s, then returns `true`. */
  syncDBData: () => Promise<boolean>;
  isSyncing: boolean;
};

const DbSyncUiContext = createContext<DbSyncUiContextValue | null>(null);

function SyncBanner({
  visible,
  translateY,
  topInset,
}: {
  visible: boolean;
  translateY: Animated.Value;
  topInset: number;
}) {
  if (!visible) return null;

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {}}
    >
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Animated.View
          pointerEvents="none"
          style={[
            styles.bannerWrap,
            {
              paddingTop: topInset + 8,
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.banner}>
            <ActivityIndicator color="#0a7ea4" size="small" />
            <Text style={styles.bannerText}>Syncing…</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function DbSyncUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [isSyncing, setIsSyncing] = useState(false);
  const [bannerMounted, setBannerMounted] = useState(false);
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const runningRef = useRef(false);

  const slideIn = useCallback(() => {
    translateY.setValue(OFFSCREEN);
    return new Promise<void>((resolve) => {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 9,
        tension: 80,
      }).start(({ finished }) => {
        if (finished) resolve();
      });
    });
  }, [translateY]);

  const slideOut = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.timing(translateY, {
        toValue: OFFSCREEN,
        duration: 320,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) resolve();
      });
    });
  }, [translateY]);

  const runSyncBannerSequence = useCallback(async (): Promise<boolean> => {
    if (runningRef.current) return false;
    runningRef.current = true;
    setIsSyncing(true);
    setBannerMounted(true);

    try {
      await slideIn();
      await new Promise((r) => setTimeout(r, HOLD_MS));
      await slideOut();
      return true;
    } finally {
      setBannerMounted(false);
      setIsSyncing(false);
      runningRef.current = false;
    }
  }, [slideIn, slideOut]);

  useEffect(() => {
    void runSyncBannerSequence();
  }, [runSyncBannerSequence]);

  const syncDBData = useCallback(
    () => runSyncBannerSequence(),
    [runSyncBannerSequence],
  );

  const value = useMemo<DbSyncUiContextValue>(
    () => ({
      syncDBData,
      isSyncing,
    }),
    [syncDBData, isSyncing],
  );

  return (
    <DbSyncUiContext.Provider value={value}>
      {children}
      <SyncBanner
        visible={bannerMounted}
        translateY={translateY}
        topInset={insets.top}
      />
    </DbSyncUiContext.Provider>
  );
}

export function useDbSyncUi(): DbSyncUiContextValue {
  const ctx = useContext(DbSyncUiContext);
  if (!ctx) {
    throw new Error("useDbSyncUi must be within DbSyncUiProvider");
  }
  return ctx;
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: "transparent",
  },
  bannerWrap: {
    alignItems: "center",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f0f4f8",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#c5d4e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a2b3c",
  },
});
