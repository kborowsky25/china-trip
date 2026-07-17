import React from "react";
import { Redirect } from "expo-router";
import { useProfile } from "../lib/profile";

// Entry gate: no profile chosen -> pick who you are; otherwise into the app.
export default function Index() {
  const { ready, profileId } = useProfile();
  if (!ready) return null;
  if (!profileId) return <Redirect href="/profile-select" />;
  return <Redirect href="/home" />;
}
