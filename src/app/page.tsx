"use client";

import { useState, useEffect } from "react";

export default function CorrectionBuilder() {
  const [text, setText] = useState("Saya melihat seseorang dipasar membeli buah-buahaan.");
  const [corrections, setCorrections] = useState<{ [index: number]: { correct: string[]; explanation: string } }>({});
  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [copied, setCopied] = useState(false);
  const [savedTexts, setSavedTexts] = useState<string[]>([]);
  const [showSavedTexts, setShowSavedTexts] = useState(false);

  // Load saved texts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("siteliti-saved-texts");
    if (stored) {
      setSavedTexts(JSON.parse(stored));
    }
  }, []);

  const words = text.split(" ");

  const handleWordClick = (index: number) => {
    if (corrections[index]) {
      document.getElementById(`correct-${index}`)?.focus();
      return;
    }

    const raw = words[index];
    const cleaned = raw.replace(/[.,!?]/g, "");

    setCorrections({
      ...corrections,
      [index]: {
        correct: [cleaned],
        explanation: `Penjelasan untuk '${cleaned}'`
      }
    });
  };

  const handleCorrectChange = (index: number, value: string) => {
    const updated = { ...corrections };
    updated[index].correct = value.split(" ");
    setCorrections(updated);
  };

  const handleExplanationChange = (index: number, value: string) => {
    const updated = { ...corrections };
    updated[index].explanation = value;
    setCorrections(updated);
  };

  const handleRemoveCorrection = (index: number) => {
    const updated = { ...corrections };
    delete updated[index];
    setCorrections(updated);
  };

  const handleExport = () => {
    const blob = new Blob(
      [JSON.stringify({ original: text, corrections }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `siteliti-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify({ original: text, corrections }, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mereset semua perubahan?")) {
      setText("");
      setCorrections({});
    }
  };

  const handleSaveText = () => {
    if (!text.trim()) return;
    
    const updated = [...new Set([...savedTexts, text])];
    setSavedTexts(updated);
    localStorage.setItem("siteliti-saved-texts", JSON.stringify(updated));
  };

  const handleLoadSavedText = (savedText: string) => {
    setText(savedText);
    setCorrections({});
    setShowSavedTexts(false);
  };

  const handleDeleteSavedText = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedTexts.filter((_, i) => i !== index);
    setSavedTexts(updated);
    localStorage.setItem("siteliti-saved-texts", JSON.stringify(updated));
  };

  const renderPreview = () => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Pratinjau Koreksi</h3>
        <div className="text-gray-700 leading-relaxed">
          {words.map((word, i) => {
            const correction = corrections[i];
            const hasCorrection = !!correction;
            
            return (
              <span key={i} className="relative inline-block mx-1 group">
                {hasCorrection ? (
                  <>
                    <span className="text-red-600 font-medium relative cursor-help">
                      {word}
                      <span className="absolute -bottom-0.5 left-0 right-0 h-1 bg-red-100 rounded-full"></span>
                    </span>
                    <span className="hidden group-hover:block absolute z-10 bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-3 py-1.5 whitespace-nowrap shadow-lg">
                      {correction.explanation}
                      <span className="absolute top-full left-1/2 -ml-1 w-2 h-2 bg-gray-800 rotate-45"></span>
                    </span>
                  </>
                ) : (
                  <span>{word}</span>
                )}
              </span>
            );
          })}
        </div>
        
        {Object.keys(corrections).length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3">Daftar Koreksi:</h4>
            <ul className="space-y-3">
              {Object.entries(corrections).map(([indexStr, data]) => {
                const index = Number(indexStr);
                return (
                  <li key={index} className="text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start">
                      <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-2 mt-0.5">
                        {words[index]}
                      </span>
                      <span className="text-gray-600 mr-2">→</span>
                      <span className="font-medium text-green-700 mr-2">{data.correct.join(" ")}</span>
                    </div>
                    <div className="mt-1 text-gray-600">{data.explanation}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSaveText}
                className="px-4 py-2 bg-white border text-black border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
              >
                <span>💾</span> Simpan Teks
              </button>
              {savedTexts.length > 0 && (
                <button
                  onClick={() => setShowSavedTexts(!showSavedTexts)}
                  className="px-4 py-2 bg-white border text-black border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
                >
                  <span>📚</span> Teks Tersimpan ({savedTexts.length})
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Saved Texts Panel */}
        {showSavedTexts && (
          <div className="mb-6 bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-800">Teks Tersimpan</h3>
              <button 
                onClick={() => setShowSavedTexts(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
              >
                ✕
              </button>
            </div>
            {savedTexts.length === 0 ? (
              <p className="text-black text-center py-4">Belum ada teks yang disimpan</p>
            ) : (
              <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {savedTexts.map((savedText, i) => (
                  <li 
                    key={i}
                    onClick={() => handleLoadSavedText(savedText)}
                    className="p-3 border text-black border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer text-sm flex justify-between items-center group"
                  >
                    <span className="truncate flex-1 pr-2">{savedText}</span>
                    <button 
                      onClick={(e) => handleDeleteSavedText(i, e)}
                      className="text-gray-400 hover:text-red-500 ml-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      🗑️
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Editor Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">Masukkan Teks:</label>
              <textarea
                className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                rows={5}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setCorrections({});
                }}
                placeholder="Ketik atau tempel teks yang ingin dikoreksi di sini..."
              />
            </div>

            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Kata-kata dalam teks:</label>
                <span className="text-xs text-gray-500">{words.length} kata</span>
              </div>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                {words.map((word, i) => (
                  <button
                    key={i}
                    onClick={() => handleWordClick(i)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                      corrections[i] 
                        ? "bg-red-100 border border-red-200 text-red-700 shadow-inner font-medium" 
                        : "bg-white border border-gray-200 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="text-xs text-gray-400 mr-1">{i}</span>
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Corrections Panel */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">
                {activeTab === "editor" ? "Editor Koreksi" : "Pratinjau"}
              </h3>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("editor")}
                  className={`px-3 py-1 text-sm text-black rounded-md ${
                    activeTab === "editor" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                >
                  Editor
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={`px-3 py-1 text-sm text-black rounded-md ${
                    activeTab === "preview" ? "bg-white shadow-sm" : "text-gray-600"
                  }`}
                >
                  Pratinjau
                </button>
              </div>
            </div>

            {activeTab === "editor" ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {Object.keys(corrections).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Belum ada koreksi</p>
                    <p className="text-sm text-gray-400">Klik kata pada teks untuk menambahkan koreksi</p>
                  </div>
                ) : (
                  Object.entries(corrections).map(([indexStr, data]) => {
                    const index = Number(indexStr);
                    return (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 relative">
                        <button
                          onClick={() => handleRemoveCorrection(index)}
                          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1 cursor-pointer"
                        >
                          🗑️
                        </button>
                        <div className="flex items-start mb-3">
                          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded mr-3">
                            Kata #{index}
                          </span>
                          <code className="bg-gray-200 px-2 py-1 rounded text-black text-sm">{words[index]}</code>
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Perbaikan:</label>
                          <input
                            id={`correct-${index}`}
                            type="text"
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={data.correct.join(" ")}
                            onChange={(e) => handleCorrectChange(index, e.target.value)}
                            placeholder="Masukkan kata yang benar..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Penjelasan:</label>
                          <textarea
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            value={data.explanation}
                            onChange={(e) => handleExplanationChange(index, e.target.value)}
                            placeholder="Berikan penjelasan untuk koreksi ini..."
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              renderPreview()
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
          >
            💾 Export JSON
          </button>
          <button
            onClick={handleCopyJson}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              copied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            disabled={copied}
          >
            {copied ? "✓ Tersalin!" : "📋 Salin JSON"}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition flex items-center gap-2"
          >
            🔄 Reset
          </button>
        </div>

        {/* JSON Output */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-gray-800">Output JSON</h3>
            <button
              onClick={handleCopyJson}
              className={`text-sm flex items-center gap-1 px-3 py-1 rounded ${
                copied ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              disabled={copied}
            >
              {copied ? "✓ Tersalin" : "📋 Salin"}
            </button>
          </div>
          <pre className="text-xs text-black p-4 bg-gray-50 rounded-lg overflow-x-auto max-h-80">
            {JSON.stringify({ original: text, corrections }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}