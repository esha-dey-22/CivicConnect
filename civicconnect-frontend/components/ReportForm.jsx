"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useReport } from "../app/context/ReportContext";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "bn", label: "Bengali" },
  { value: "te", label: "Telugu" },
  { value: "mr", label: "Marathi" },
  { value: "ta", label: "Tamil" },
  { value: "ur", label: "Urdu" },
  { value: "gu", label: "Gujarati" },
  { value: "kn", label: "Kannada" },
  { value: "ml", label: "Malayalam" },
  { value: "pa", label: "Punjabi" },
  { value: "or", label: "Odia" },
  { value: "ar", label: "Arabic" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "id", label: "Indonesian" },
  { value: "it", label: "Italian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "fa", label: "Persian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "es", label: "Spanish" },
  { value: "sw", label: "Swahili" },
  { value: "th", label: "Thai" },
  { value: "tr", label: "Turkish" },
  { value: "uk", label: "Ukrainian" },
  { value: "vi", label: "Vietnamese" },
];

const BASE_TRANSLATION = {
  badge: "Citizen reporting",
  title: "Submit a civic complaint",
  subtitle:
    "Record the issue, add your live location, and share a voice-assisted complaint so authorities can act faster.",
  languageLabel: "Preferred language",
  titleLabel: "Issue Title",
  titlePlaceholder: "Enter issue title",
  locationLabel: "Location",
  locationPlaceholder: "Area, street, or landmark",
  useLiveLocation: "Use Live Location",
  fetchingLocation: "Fetching your live location...",
  locationUnsupported: "Geolocation is not supported by this browser.",
  locationDenied: "Unable to fetch location. Please allow location permission.",
  locationFound: "Live location captured successfully.",
  categoryLabel: "Category",
  categoryPlaceholder: "Select category",
  categories: {
    garbage: "Garbage",
    streetLight: "Street Light",
    waterLeakage: "Water Leakage",
    roadDamage: "Road Damage",
    drainage: "Drainage",
    sewage: "Sewage",
    trafficSignal: "Traffic Signal",
    illegalParking: "Illegal Parking",
    noisePollution: "Noise Pollution",
    airPollution: "Air Pollution",
    publicToilet: "Public Toilet",
    encroachment: "Encroachment",
    strayAnimals: "Stray Animals",
    other: "Other",
  },
  otherCategoryLabel: "Specify Category",
  otherCategoryPlaceholder: "Enter category",
  descriptionLabel: "Description",
  descriptionPlaceholder: "Describe the issue in detail",
  voiceLabel: "Voice complaint",
  startRecording: "Start Recording",
  stopRecording: "Stop Recording",
  voiceUnsupported: "Voice input is not supported in this browser.",
  voiceHint: "Record your complaint and it will be attached as transcript.",
  transcriptLabel: "Voice transcript",
  evidenceLabel: "Attach Evidence",
  fileTypeWarning: "Warning: Only JPEG or PNG files are allowed.",
  statusText: "Reports are initially marked as filed and appear in the public registry.",
  submitButton: "Submit Report",
  success: "Complaint submitted successfully.",
  failure: "Failed to submit complaint.",
  descriptionRequired: "Please type or record a complaint description.",
  warningTitle: "Warning",
  ok: "OK",
  translating: "Translating report section...",
};

const flattenTextTree = (value, prefix = "", accumulator = {}) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    Object.entries(value).forEach(([key, innerValue]) => {
      const nextPrefix = prefix ? `${prefix}.${key}` : key;
      flattenTextTree(innerValue, nextPrefix, accumulator);
    });
    return accumulator;
  }

  accumulator[prefix] = String(value ?? "");
  return accumulator;
};

const assignPath = (target, path, value) => {
  const segments = path.split(".");
  let cursor = target;

  segments.forEach((segment, index) => {
    if (index === segments.length - 1) {
      cursor[segment] = value;
      return;
    }

    if (!cursor[segment] || typeof cursor[segment] !== "object") {
      cursor[segment] = {};
    }

    cursor = cursor[segment];
  });
};

const inflateTextTree = (flatMap) => {
  const result = {};
  Object.entries(flatMap).forEach(([path, value]) => assignPath(result, path, value));
  return result;
};

const BASE_FLAT_TRANSLATION = flattenTextTree(BASE_TRANSLATION);

const translateSingleText = async (text, targetLanguage) => {
  if (!text.trim()) {
    return text;
  }

  const response = await fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`
  );

  if (!response.ok) {
    throw new Error("Translation request failed.");
  }

  const payload = await response.json();
  const chunks = Array.isArray(payload?.[0]) ? payload[0] : [];
  const translated = chunks.map((chunk) => chunk?.[0] || "").join("").trim();
  return translated || text;
};

const translateTextTree = async (targetLanguage) => {
  const translatedEntries = await Promise.all(
    Object.entries(BASE_FLAT_TRANSLATION).map(async ([path, text]) => {
      const translatedText = await translateSingleText(text, targetLanguage).catch(() => text);
      return [path, translatedText];
    })
  );

  return inflateTextTree(Object.fromEntries(translatedEntries));
};

export default function ReportForm({ redirectOnSubmit = true }) {
  const { addReport } = useReport();
  const router = useRouter();
  const translationCacheRef = useRef(new Map([["en", BASE_TRANSLATION]]));

  const [language, setLanguage] = useState("en");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const [category, setCategory] = useState("");
  const [otherCategory, setOtherCategory] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileError, setFileError] = useState("");

  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [baseDescriptionAtRecordStart, setBaseDescriptionAtRecordStart] = useState("");
  const [voiceError, setVoiceError] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [t, setT] = useState(BASE_TRANSLATION);

  useEffect(() => {
    let cancelled = false;

    if (language === "en") {
      setT(BASE_TRANSLATION);
      setIsTranslating(false);
      return () => {
        cancelled = true;
      };
    }

    const cached = translationCacheRef.current.get(language);
    if (cached) {
      setT(cached);
      setIsTranslating(false);
      return () => {
        cancelled = true;
      };
    }

    const runTranslation = async () => {
      setIsTranslating(true);
      const translatedTree = await translateTextTree(language).catch(() => BASE_TRANSLATION);

      if (cancelled) {
        return;
      }

      translationCacheRef.current.set(language, translatedTree);
      setT(translatedTree);
      setIsTranslating(false);
    };

    runTranslation();

    return () => {
      cancelled = true;
    };
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      recognitionRef.current = null;
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language || "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceError("");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setVoiceError(event?.error ? `Voice error: ${event.error}` : t.voiceUnsupported);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let text = "";

      for (let index = 0; index < event.results.length; index += 1) {
        text += event.results[index][0].transcript;
      }

      const normalized = text.trim();
      if (normalized) {
        setVoiceTranscript(normalized);
        setDescription(`${baseDescriptionAtRecordStart}${baseDescriptionAtRecordStart ? " " : ""}${normalized}`.trim());
      }
    };

    recognitionRef.current = recognition;
    setSpeechSupported(true);

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [baseDescriptionAtRecordStart, language, t.voiceUnsupported]);

  const openWarning = (message) => {
    setWarningMessage(message);
    setShowWarningModal(true);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setSelectedImage(null);
      setFileError("");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setSelectedImage(null);
      setFileError(t.fileTypeWarning);
      openWarning(t.fileTypeWarning);
      event.target.value = "";
      return;
    }

    setSelectedImage(file);
    setFileError("");
  };

  const handleCaptureLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(t.locationUnsupported);
      return;
    }

    setIsLocating(true);
    setLocationStatus(t.fetchingLocation);

    const retrievePosition = (options) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
      });
    };

    const performReverseGeocode = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "CivicConnect/1.0"
            }
          }
        );
        if (response.ok) {
          const payload = await response.json();
          return payload?.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        }
      } catch (err) {
        console.error("Reverse geocoding failed:", err);
      }
      return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    };

    const handleSuccess = async (position) => {
      const { latitude, longitude } = position.coords;
      setCoordinates({ latitude, longitude });

      const address = await performReverseGeocode(latitude, longitude);
      setLocation(address);
      setLocationStatus(t.locationFound);
      setIsLocating(false);
    };

    // Try high accuracy first, fallback to standard accuracy on failure/timeout
    retrievePosition({ enableHighAccuracy: true, timeout: 5000, maximumAge: 0 })
      .then(handleSuccess)
      .catch((error) => {
        console.warn("High accuracy geolocation failed, attempting standard accuracy...", error.message);

        retrievePosition({ enableHighAccuracy: false, timeout: 8000, maximumAge: 0 })
          .then(handleSuccess)
          .catch((fallbackError) => {
            console.warn("Standard accuracy geolocation failed:", {
              code: fallbackError?.code,
              message: fallbackError?.message
            });

            let message = t.locationDenied;
            if (fallbackError.code === 1) {
              message = "Location permission denied. Please allow location permissions in your browser and macOS system settings.";
            } else if (fallbackError.code === 3) {
              message = "Location request timed out. Please try again or enter the location manually.";
            } else {
              message = "Location unavailable. Please enter the location manually.";
            }

            setLocationStatus(message);
            setIsLocating(false);
          });
      });
  };

  const handleVoiceToggle = () => {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setVoiceError(t.voiceUnsupported);
      return;
    }

    if (isListening) {
      recognition.stop();
      return;
    }

    setBaseDescriptionAtRecordStart(description.trim());
    setVoiceTranscript("");
    setVoiceError("");
    recognition.start();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (selectedImage && !["image/jpeg", "image/png"].includes(selectedImage.type)) {
      setFileError(t.fileTypeWarning);
      return;
    }

    const resolvedDescription = description.trim();

    if (!resolvedDescription) {
      openWarning(t.descriptionRequired);
      return;
    }

    let resolvedCoordinates = coordinates;

    // If no coordinates captured (manual text entry), attempt forward geocoding
    if (!resolvedCoordinates && location.trim()) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.trim())}`,
          {
            headers: {
              "User-Agent": "CivicConnect/1.0"
            }
          }
        );
        if (response.ok) {
          const payload = await response.json();
          if (payload && payload.length > 0) {
            resolvedCoordinates = {
              latitude: Number(payload[0].lat),
              longitude: Number(payload[0].lon)
            };
          }
        }
      } catch (err) {
        console.error("Forward geocoding failed:", err);
      }
    }

    const submission = await addReport({
      title,
      description: resolvedDescription,
      location,
      coordinates: resolvedCoordinates,
      language,
      voiceTranscript,
      category: category === "Other" ? otherCategory : category,
      file: selectedImage,
    });

    if (!submission?.success) {
      alert(submission?.error || t.failure);
      return;
    }

    alert(t.success);

    setTitle("");
    setDescription("");
    setLocation("");
    setCoordinates(null);
    setLocationStatus("");
    setCategory("");
    setOtherCategory("");
    setSelectedImage(null);
    setFileError("");
    setVoiceTranscript("");
    setVoiceError("");

    if (redirectOnSubmit) {
      router.push("/complaints");
    }
  };

  return (
    <>
      <div className="mb-8 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.28em] text-sky-300/80">{t.badge}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{t.title}</h1>
        <p className="mt-3 text-slate-300">{t.subtitle}</p>
        {isTranslating ? <p className="mt-2 text-xs text-sky-300/80">{t.translating}</p> : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/10 backdrop-blur-xl sm:p-6 md:grid-cols-2 md:gap-6"
      >
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.languageLabel}</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
          >
            {LANGUAGE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.titleLabel}</label>
          <input
            type="text"
            placeholder={t.titlePlaceholder}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.locationLabel}</label>
          <input
            type="text"
            placeholder={t.locationPlaceholder}
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
            required
          />
          {locationStatus ? <p className="mt-2 text-xs text-slate-400">{locationStatus}</p> : null}
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">&nbsp;</label>
          <button
            type="button"
            onClick={handleCaptureLiveLocation}
            disabled={isLocating}
            className="w-full rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLocating ? t.fetchingLocation : t.useLiveLocation}
          </button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.categoryLabel}</label>
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition focus:border-sky-400/50"
            required
          >
            <option value="">{t.categoryPlaceholder}</option>
            <option value="Garbage">{t.categories.garbage}</option>
            <option value="Street Light">{t.categories.streetLight}</option>
            <option value="Water Leakage">{t.categories.waterLeakage}</option>
            <option value="Road Damage">{t.categories.roadDamage}</option>
            <option value="Drainage">{t.categories.drainage}</option>
            <option value="Sewage">{t.categories.sewage}</option>
            <option value="Traffic Signal">{t.categories.trafficSignal}</option>
            <option value="Illegal Parking">{t.categories.illegalParking}</option>
            <option value="Noise Pollution">{t.categories.noisePollution}</option>
            <option value="Air Pollution">{t.categories.airPollution}</option>
            <option value="Public Toilet">{t.categories.publicToilet}</option>
            <option value="Encroachment">{t.categories.encroachment}</option>
            <option value="Stray Animals">{t.categories.strayAnimals}</option>
            <option value="Other">{t.categories.other}</option>
          </select>
        </div>

        {category === "Other" ? (
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">{t.otherCategoryLabel}</label>
            <input
              type="text"
              placeholder={t.otherCategoryPlaceholder}
              value={otherCategory}
              onChange={(event) => setOtherCategory(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
              required
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.descriptionLabel}</label>
          <div className="relative">
            <button
              type="button"
              onClick={handleVoiceToggle}
              disabled={!speechSupported}
              aria-label={isListening ? t.stopRecording : t.voiceLabel}
              title={isListening ? t.stopRecording : t.voiceLabel}
              className="absolute right-3 top-3 rounded-full bg-emerald-500 p-2 text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
                <path d="M12 14.5a3.5 3.5 0 0 0 3.5-3.5V6a3.5 3.5 0 1 0-7 0v5a3.5 3.5 0 0 0 3.5 3.5Zm5.5-3.5a.75.75 0 0 0-1.5 0 4 4 0 1 1-8 0 .75.75 0 0 0-1.5 0 5.5 5.5 0 0 0 4.75 5.44V19H9.5a.75.75 0 0 0 0 1.5h5a.75.75 0 0 0 0-1.5h-1.75v-2.56A5.5 5.5 0 0 0 17.5 11Z" />
              </svg>
            </button>

            <textarea
              placeholder={t.descriptionPlaceholder}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="5"
              className="w-full rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 pr-14 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50"
            />
          </div>

          <p className="mt-2 text-xs text-slate-400">{t.voiceHint}</p>
          {!speechSupported ? <p className="mt-3 text-xs text-amber-300">{t.voiceUnsupported}</p> : null}
          {voiceError ? <p className="mt-3 text-xs text-red-300">{voiceError}</p> : null}

        </div>

        <div className="md:col-span-2">
          <label className="mb-2 block text-sm font-medium text-slate-300">{t.evidenceLabel}</label>
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileChange}
            className="w-full rounded-2xl border border-dashed border-white/15 bg-slate-950/40 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-sky-500 file:px-4 file:py-2 file:font-medium file:text-white hover:file:bg-sky-400"
          />
          {fileError ? <p className="mt-2 text-sm text-red-300">{fileError}</p> : null}
        </div>

        <div className="md:col-span-2 flex flex-col gap-4 rounded-2xl border border-white/10 bg-slate-950/30 px-4 py-4 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between">
          <span>{t.statusText}</span>
          <button
            type="submit"
            className="w-full rounded-full bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 sm:w-auto"
          >
            {t.submitButton}
          </button>
        </div>
      </form>

      {showWarningModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-red-400/30 bg-slate-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-red-300">{t.warningTitle}</h2>
            <p className="mt-3 text-gray-200">{warningMessage}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="rounded-lg bg-red-500 px-5 py-2 font-medium text-white hover:bg-red-400"
              >
                {t.ok}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
