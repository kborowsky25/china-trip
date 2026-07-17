import React, { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import { StyleProp, ImageStyle } from "react-native";
import { loadWiki, fallbackImage } from "../lib/services";
import { colors } from "../lib/theme";

// Loads a Wikipedia thumbnail for `title`, falling back to a deterministic
// stock image if Wikipedia has nothing (mirrors the web app's image loader).
export function WikiImage({
  title,
  city,
  lock,
  style,
  w = 640,
  h = 430,
  contentFit = "cover",
  uri: directUri,
}: {
  title: string;
  city: string;
  lock: number;
  style?: StyleProp<ImageStyle>;
  w?: number;
  h?: number;
  contentFit?: "cover" | "contain";
  uri?: string; // when provided, use this directly (skip the Wikipedia lookup)
}) {
  const [uri, setUri] = useState<string | null>(directUri ?? null);
  const triedFb = useRef(false);

  useEffect(() => {
    if (directUri) {
      setUri(directUri);
      return;
    }
    let alive = true;
    loadWiki(title).then((src) => {
      if (!alive) return;
      setUri(src || fallbackImage(title, city, lock, w, h));
    });
    return () => {
      alive = false;
    };
  }, [title, city, lock, w, h, directUri]);

  return (
    <Image
      source={uri ? { uri } : undefined}
      style={[{ backgroundColor: "#e4eaf2" }, style]}
      contentFit={contentFit}
      transition={220}
      onError={() => {
        if (!triedFb.current) {
          triedFb.current = true;
          setUri(fallbackImage(title, city, lock, w, h));
        }
      }}
    />
  );
}
