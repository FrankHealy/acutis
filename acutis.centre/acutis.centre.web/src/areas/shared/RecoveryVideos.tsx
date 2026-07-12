"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import type { UnitId } from "./unit/unitTypes";
import { unitVideoService, type VideoDto } from "@/services/unitVideoService";

type RecoveryVideosProps = {
  unitId: UnitId;
};

const i18nKeys = [
  "recovery_videos.title",
  "recovery_videos.empty",
  "recovery_videos.loading",
  "recovery_videos.error",
  "recovery_videos.column.title",
  "recovery_videos.column.duration",
  "recovery_videos.column.source",
  "recovery_videos.column.description",
  "recovery_videos.column.tags",
  "recovery_videos.column.downloaded",
  "recovery_videos.downloaded.yes",
  "recovery_videos.downloaded.no",
  "recovery_videos.unknown_source",
];

function formatDuration(totalSeconds: number, locale: string): string {
  const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
  const seconds = Math.max(0, totalSeconds) % 60;
  const numberFormat = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  return `${numberFormat.format(minutes)}:${numberFormat.format(seconds)}`;
}

export default function RecoveryVideos({ unitId }: RecoveryVideosProps) {
  const { t, loadKeys, locale } = useLocalization();
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    void loadKeys(i18nKeys);
  }, [loadKeys]);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setLoading(true);
      setErrorKey(null);
      try {
        const result = await unitVideoService.getVideos(unitId);
        if (isMounted) {
          setVideos(result);
        }
      } catch {
        if (isMounted) {
          setErrorKey("recovery_videos.error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      isMounted = false;
    };
  }, [unitId]);

  const rows = useMemo(() => videos, [videos]);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">{t("recovery_videos.title")}</h3>
      {loading && <p className="mt-3 text-sm text-gray-500">{t("recovery_videos.loading")}</p>}
      {errorKey && <p className="mt-3 text-sm text-red-600">{t(errorKey)}</p>}
      {!loading && !errorKey && rows.length === 0 && <p className="mt-3 text-sm text-gray-500">{t("recovery_videos.empty")}</p>}

      {!loading && !errorKey && rows.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.title")}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.duration")}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.source")}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.description")}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.tags")}</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">{t("recovery_videos.column.downloaded")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {rows.map((video) => (
                <tr key={video.id}>
                  <td className="px-3 py-2 text-sm text-gray-800">
                    <a
                      href={unitVideoService.buildPlaybackUrl(video)}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-blue-700 hover:underline"
                    >
                      {video.title}
                    </a>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{formatDuration(video.lengthSeconds, locale)}</td>
                  <td className="px-3 py-2 text-sm">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {video.source?.trim() || t("recovery_videos.unknown_source")}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-sm text-gray-700">{video.description || ""}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">{video.tags.length > 0 ? video.tags.join(", ") : ""}</td>
                  <td className="px-3 py-2 text-sm text-gray-700">
                    {video.isDownloaded ? t("recovery_videos.downloaded.yes") : t("recovery_videos.downloaded.no")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
