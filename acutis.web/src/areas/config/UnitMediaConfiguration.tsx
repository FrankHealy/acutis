"use client";

import React, { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus, Trash2, Ban } from "lucide-react";
import { mediaPlayerService, type MediaAsset, type MediaPlayerCatalog } from "@/services/mediaPlayerService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

type UnitMediaConfigurationProps = {
  unitId: UnitId;
};

type AssetType = "VoicedMeditation" | "MeditationMusic";

const emptyCatalog = (unitCode: string): MediaPlayerCatalog => ({
  unitCode,
  voicedMeditations: [],
  meditationMusic: [],
});

const UnitMediaConfiguration: React.FC<UnitMediaConfigurationProps> = ({ unitId }) => {
  const { loadKeys, t } = useLocalization();
  const [catalog, setCatalog] = useState<MediaPlayerCatalog>(emptyCatalog(unitId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [registerAssetType, setRegisterAssetType] = useState<AssetType>("VoicedMeditation");
  const [fileName, setFileName] = useState("");
  const [shortName, setShortName] = useState("");
  const [lengthSeconds, setLengthSeconds] = useState("");
  const [deleteFile, setDeleteFile] = useState(false);

  useEffect(() => {
    void loadKeys([
      "config.media.title",
      "config.media.sync_folder",
      "config.media.loading",
      "config.media.type.voiced",
      "config.media.type.music",
      "config.media.file_name",
      "config.media.short_name",
      "config.media.length_seconds",
      "config.media.add_item",
      "config.media.delete_file",
      "config.media.empty",
      "config.media.deactivate",
      "config.media.delete",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const refreshCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mediaPlayerService.getCatalog(unitId);
      setCatalog(response);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [unitId]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const handleSync = async () => {
    setError(null);
    try {
      await mediaPlayerService.sync(unitId, "Manual sync from unit configuration");
      await refreshCatalog();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fileName.trim()) return;

    setError(null);
    try {
      await mediaPlayerService.register({
        unitCode: unitId,
        assetType: registerAssetType,
        fileName: fileName.trim(),
        shortName: shortName.trim(),
        lengthSeconds: lengthSeconds ? Number(lengthSeconds) : undefined,
        reason: "Manual add from unit configuration",
      });
      setFileName("");
      setShortName("");
      setLengthSeconds("");
      await refreshCatalog();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deactivate = async (asset: MediaAsset) => {
    try {
      await mediaPlayerService.deactivate(asset.id, "Removed from active catalog");
      await refreshCatalog();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteAsset = async (asset: MediaAsset) => {
    try {
      await mediaPlayerService.delete(asset.id, deleteFile, "Deleted from unit configuration");
      await refreshCatalog();
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const assets = [...catalog.voicedMeditations, ...catalog.meditationMusic];

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{text("config.media.title", "Media Configuration")}</h3>
        <button
          type="button"
          onClick={handleSync}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          {text("config.media.sync_folder", "Sync Folder")}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-3 text-sm text-gray-500">{text("config.media.loading", "Loading media catalog...")}</p>}

      <form onSubmit={handleRegister} className="mt-4 grid gap-3 md:grid-cols-5">
        <div className="inline-flex overflow-hidden rounded-lg border border-gray-300">
          <button
            type="button"
            onClick={() => setRegisterAssetType("VoicedMeditation")}
            className={`px-3 py-2 text-sm font-semibold ${
              registerAssetType === "VoicedMeditation"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {text("config.media.type.voiced", "Voiced")}
          </button>
          <button
            type="button"
            onClick={() => setRegisterAssetType("MeditationMusic")}
            className={`border-l border-gray-300 px-3 py-2 text-sm font-semibold ${
              registerAssetType === "MeditationMusic"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {text("config.media.type.music", "Music")}
          </button>
        </div>
        <input
          value={fileName}
          onChange={(event) => setFileName(event.target.value)}
          placeholder={text("config.media.file_name", "File name in folder")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm md:col-span-2"
        />
        <input
          value={shortName}
          onChange={(event) => setShortName(event.target.value)}
          placeholder={text("config.media.short_name", "Short name")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <input
          value={lengthSeconds}
          onChange={(event) => setLengthSeconds(event.target.value)}
          placeholder={text("config.media.length_seconds", "Length (seconds)")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 md:col-span-5"
        >
          <Plus className="h-4 w-4" />
          {text("config.media.add_item", "Add Media Item")}
        </button>
      </form>

      <div className="mt-6 flex items-center gap-2 text-sm">
        <input
          id="deleteFile"
          type="checkbox"
          checked={deleteFile}
          onChange={(event) => setDeleteFile(event.target.checked)}
          className="h-4 w-4"
        />
        <label htmlFor="deleteFile" className="text-gray-700">
          {text("config.media.delete_file", "Also delete file from disk when hard deleting")}
        </label>
      </div>

      <div className="mt-4 space-y-3">
        {assets.length === 0 && !loading && <p className="text-sm text-gray-500">{text("config.media.empty", "No media configured.")}</p>}
        {assets.map((asset) => (
          <div key={asset.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 p-3">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{asset.shortName}</span>
              <span className="ml-2 text-gray-500">({asset.assetType})</span>
              <p className="text-xs text-gray-500">{asset.fileName}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void deactivate(asset)}
                className="inline-flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100"
              >
                <Ban className="h-3 w-3" />
                {text("config.media.deactivate", "Deactivate")}
              </button>
              <button
                type="button"
                onClick={() => void deleteAsset(asset)}
                className="inline-flex items-center gap-1 rounded border border-red-300 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
                {text("config.media.delete", "Delete")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UnitMediaConfiguration;
