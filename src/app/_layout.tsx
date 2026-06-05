import { initDB } from "@/db/database";
import * as Linking from "expo-linking";
import { Slot, useRouter } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useEffect } from "react";

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
