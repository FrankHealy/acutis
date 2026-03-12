"use client";

import React from 'react';
import { Save, X } from 'lucide-react';
import type { CallLog } from '@/data/mock/callLogs';
import { useLocalization } from "@/areas/shared/i18n/LocalizationProvider";

export type CallLoggingFormState = {
  firstName: string;
  surname: string;
  callerType: CallLog['callerType'];
  concernType: '' | CallLog['concernType'];
  location: string;
  phoneNumber: string;
  notes: string;
};

type CallLoggingModalProps = {
  isOpen: boolean;
  formState: CallLoggingFormState;
  errorMessage?: string | null;
  isSaving: boolean;
  onChange: (field: keyof CallLoggingFormState, value: string) => void;
  onClose: () => void;
  onSave: () => void;
};

const CallLoggingModal: React.FC<CallLoggingModalProps> = ({
  isOpen,
  formState,
  errorMessage,
  isSaving,
  onChange,
  onClose,
  onSave,
}) => {
  const { loadKeys, t } = useLocalization();

  React.useEffect(() => {
    void loadKeys([
      "call_logging.modal.title",
      "call_logging.modal.description",
      "call_logging.modal.first_name",
      "call_logging.modal.first_name_placeholder",
      "call_logging.modal.surname",
      "call_logging.modal.surname_placeholder",
      "call_logging.modal.caller_type",
      "call_logging.modal.caller_type.self",
      "call_logging.modal.caller_type.family",
      "call_logging.modal.caller_type.professional",
      "call_logging.modal.caller_type.other",
      "call_logging.modal.concern_type",
      "call_logging.modal.concern_type.select",
      "call_logging.modal.concern_type.alcohol",
      "call_logging.modal.concern_type.drugs",
      "call_logging.modal.concern_type.gambling",
      "call_logging.modal.concern_type.general",
      "call_logging.modal.phone",
      "call_logging.modal.phone_placeholder",
      "call_logging.modal.location",
      "call_logging.modal.location_placeholder",
      "call_logging.modal.notes",
      "call_logging.modal.notes_placeholder",
      "call_logging.modal.cancel",
      "call_logging.modal.saving",
      "call_logging.modal.save",
    ]);
  }, [loadKeys]);

  const text = (key: string, fallback: string) => {
    const resolved = t(key);
    return resolved === key ? fallback : resolved;
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{text("call_logging.modal.title", "Log New Call")}</h3>
              <p className="text-sm text-gray-500">{text("call_logging.modal.description", "Record incoming inquiry")}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.first_name", "First Name")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder={text("call_logging.modal.first_name_placeholder", "Enter first name")}
                value={formState.firstName}
                onChange={(event) => onChange('firstName', event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.surname", "Surname")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder={text("call_logging.modal.surname_placeholder", "Enter surname")}
                value={formState.surname}
                onChange={(event) => onChange('surname', event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.caller_type", "Caller Type")} <span className="text-red-500">*</span>
              </label>
              <select
                value={formState.callerType}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                onChange={(event) => onChange('callerType', event.target.value)}
              >
                <option value="self">{text("call_logging.modal.caller_type.self", "Self")}</option>
                <option value="family">{text("call_logging.modal.caller_type.family", "Family Member")}</option>
                <option value="professional">{text("call_logging.modal.caller_type.professional", "Healthcare Professional")}</option>
                <option value="other">{text("call_logging.modal.caller_type.other", "Other")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.concern_type", "Concern Type")} <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                value={formState.concernType}
                onChange={(event) => onChange('concernType', event.target.value)}
              >
                <option value="">{text("call_logging.modal.concern_type.select", "Select concern...")}</option>
                <option value="alcohol">{text("call_logging.modal.concern_type.alcohol", "Alcohol")}</option>
                <option value="drugs">{text("call_logging.modal.concern_type.drugs", "Drugs")}</option>
                <option value="gambling">{text("call_logging.modal.concern_type.gambling", "Gambling")}</option>
                <option value="general">{text("call_logging.modal.concern_type.general", "General Inquiry")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.phone", "Phone Number")}
              </label>
              <input
                type="tel"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder={text("call_logging.modal.phone_placeholder", "087 123 4567")}
                value={formState.phoneNumber}
                onChange={(event) => onChange('phoneNumber', event.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.location", "Location")}
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none text-base"
                placeholder={text("call_logging.modal.location_placeholder", "City/County")}
                value={formState.location}
                onChange={(event) => onChange('location', event.target.value)}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {text("call_logging.modal.notes", "Call Notes")}
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none resize-none text-base"
                placeholder={text("call_logging.modal.notes_placeholder", "Optional notes about the call...")}
                value={formState.notes}
                onChange={(event) => onChange('notes', event.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-700 font-semibold rounded-lg border border-gray-200 transition-colors"
            >
              {text("call_logging.modal.cancel", "Cancel")}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-sm"
            >
              <div className="flex items-center space-x-2">
                <Save className="h-5 w-5" />
                <span>{isSaving ? text("call_logging.modal.saving", "Saving...") : text("call_logging.modal.save", "Save Call Log")}</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLoggingModal;
