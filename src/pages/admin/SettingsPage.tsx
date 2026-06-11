import { useEffect, useState } from "react";
import SettingsEditor from "@/pages/admin/SettingsEditor";
import { getSiteSettingsInitial, loadSiteSettings } from "@/lib/cms";
import type { SiteSettings } from "@/types/content";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(() => getSiteSettingsInitial());

  useEffect(() => {
    let active = true;

    async function syncSettings() {
      try {
        const nextSettings = await loadSiteSettings();
        if (active) {
          setSettings(nextSettings);
        }
      } catch {
        if (!active) {
          return;
        }
      }
    }

    syncSettings();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="max-w-[900px]">
        <h2 className="font-['Poppins'] text-[24px] font-[900]">Settings</h2>
        <p className="mt-3 text-white/55">
          全站固定文案、About 段落、社媒文案和页脚内容都在这里维护。
        </p>
      </div>
      <SettingsEditor settings={settings} onSaved={setSettings} />
    </div>
  );
}
