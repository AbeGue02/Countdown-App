import { useEffect } from "react";
import { Slot, useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { SQLiteProvider } from "expo-sqlite";
import { initDB } from "@/db/database";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const parsed = Linking.parse(url);
      if (parsed.path === "widget/change") {
        router.push("/widget-select");
      }
    });

    // Handle cold-start deep link
    Linking.getInitialURL().then((url) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      if (parsed.path === "widget/change") {
        router.push("/widget-select");
      }
    });

    return () => subscription.remove();
  }, [router]);

  return (
    <SQLiteProvider databaseName="countdowns.db" onInit={initDB}>
      <Slot />
    </SQLiteProvider>
  );
}

