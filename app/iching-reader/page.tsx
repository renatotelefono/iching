"use client";

import { useState } from "react";

export default function IchingReaderPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/iching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();
      setResponse(data.answer || "Nessuna risposta ricevuta");
    } catch (err) {
      console.error("Errore API:", err);
      setResponse("Errore nella consultazione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Consultazione I Ching</h1>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Inserisci la tua domanda..."
        className="border p-2 w-full h-28 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Consultazione in corso..." : "Consulta"}
      </button>

      {response && (
        <div className="mt-6 border p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Risposta:</h2>
          <p className="whitespace-pre-line">{response}</p>
        </div>
      )}
    </div>
  );
}
