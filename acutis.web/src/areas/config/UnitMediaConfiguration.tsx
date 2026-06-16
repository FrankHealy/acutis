"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { RefreshCw, Plus, Trash2, Ban } from "lucide-react";
import { mediaPlayerService, type MediaAsset, type MediaPlayerCatalog } from "@/services/mediaPlayerService";
import type { UnitId } from "@/areas/shared/unit/unitTypes";
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";
import { ConfigEditorDialog } from "@/areas/config/ConfigActionDialogs";
import { isAuthorizedClient } from "@/lib/authMode";
import Toast from "@/units/shared/ui/Toast";

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
  const { data: session, status } = useSession();
  const { loadKeys, t } = useLocalization();
  const [catalog, setCatalog] = useState<MediaPlayerCatalog>(emptyCatalog(unitId));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorError, setEditorError] = useState<string | null>(null);
  const [registerAssetType, setRegisterAssetType] = useState<AssetType>("VoicedMeditation");
  const [fileName, setFileName] = useState("");
  const [shortName, setShortName] = useState("");
  const [lengthSeconds, setLengthSeconds] = useState("");
  const [deleteFile, setDeleteFile] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const resetEditor = () => {
    setEditorError(null);
    setFileName("");
    setShortName("");
    setLengthSeconds("");
    setEditorOpen(false);
  };

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
      "config.actions.add_new",
      "config.media.confirm_deactivate",
      "config.media.confirm_delete",
      "config.media.toast.synced",
      "config.media.toast.added",
      "config.media.toast.deactivated",
      "config.media.toast.deleted",
      "config.toast.close",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  const refreshCatalog = useCallback(async () => {
    if (!isAuthorizedClient(status, session?.accessToken)) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await mediaPlayerService.getCatalog(unitId, session?.accessToken);
      setCatalog(response);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, status, unitId]);

  useEffect(() => {
    void refreshCatalog();
  }, [refreshCatalog]);

  const handleSync = async () => {
    setError(null);
    try {
      if (!isAuthorizedClient(status, session?.accessToken)) return;
      await mediaPlayerService.sync(unitId, "Manual sync from unit configuration", session?.accessToken);
      await refreshCatalog();
      setToast(text("config.media.toast.synced", "Media folder synced."));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!fileName.trim()) return;

    setEditorError(null);
    try {
      if (!isAuthorizedClient(status, session?.accessToken)) return;
      await mediaPlayerService.register({
        unitCode: unitId,
        assetType: registerAssetType,
        fileName: fileName.trim(),
        shortName: shortName.trim(),
        lengthSeconds: lengthSeconds ? Number(lengthSeconds) : undefined,
        reason: "Manual add from unit configuration",
      }, session?.accessToken);
      await refreshCatalog();
      resetEditor();
      setToast(text("config.media.toast.added", "Media item added."));
    } catch (e) {
      setEditorError((e as Error).message);
    }
  };

  const deactivate = async (asset: MediaAsset) => {
    if (!window.confirm(text("config.media.confirm_deactivate", `Deactivate ${asset.shortName}?`))) return;
    try {
      if (!isAuthorizedClient(status, session?.accessToken)) return;
      await mediaPlayerService.deactivate(asset.id, "Removed from active catalog", session?.accessToken);
      await refreshCatalog();
      setToast(text("config.media.toast.deactivated", "Media item deactivated."));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteAsset = async (asset: MediaAsset) => {
    if (!window.confirm(text("config.media.confirm_delete", `Delete ${asset.shortName}?`))) return;
    try {
      if (!isAuthorizedClient(status, session?.accessToken)) return;
      await mediaPlayerService.delete(asset.id, deleteFile, "Deleted from unit configuration", session?.accessToken);
      await refreshCatalog();
      setToast(text("config.media.toast.deleted", "Media item deleted."));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const assets = [...catalog.voicedMeditations, ...catalog.meditationMusic];

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{text("config.media.title", "Media Configuration")}</h3>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={() => { setEditorError(null); setEditorOpen(true); }} className="app-primary-button inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"><Plus className="h-4 w-4" />{text("config.actions.add_new", "Add New")}</button><button type="button" onClick={handleSync} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"><RefreshCw className="h-4 w-4" />{text("config.media.sync_folder", "Sync Folder")}</button></div>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-3 text-sm text-gray-500">{text("config.media.loading", "Loading media catalog...")}</p>}

      <ConfigEditorDialog open={editorOpen} onClose={resetEditor} closeLabel="Close" title={text("config.media.add_item", "Add Media Item")} size="medium">
      <form onSubmit={handleRegister} className="grid gap-3">
        {editorError && <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{editorError}</p>}
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          {text("config.media.add_item", "Add Media Item")}
        </button>
      </form>
      </ConfigEditorDialog>

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
      <Toast open={Boolean(toast)} message={toast ?? ""} type="success" onClose={() => setToast(null)} closeLabel={text("config.toast.close", "Close")} />
    </div>
  );
};

export default UnitMediaConfiguration;
