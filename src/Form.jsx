import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";
const STORAGE_KEYS = {
  lastUserId: "shopping_assistant.last_user_id",
  recentManuals: "shopping_assistant.recent_manuals",
  lastManualId: "shopping_assistant.last_manual_id",
};

const interestOptions = [
  "Power dressing",
  "Minimalist",
  "Romantic",
  "Streetwear",
  "Classic tailoring",
  "Soft glam",
  "Techwear",
  "Sustainable",
  "Bold color",
  "Quiet luxury",
];

export default function Form() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    budget: "",
    interests: "",
    occasion: "",
    intent: "",
  });

  const [result, setResult] = useState("");
  const [persona, setPersona] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUserId, setLastUserId] = useState("");

  const [compare, setCompare] = useState({
    query: "",
    budget: "",
    preferences: "",
  });
  const [compareResults, setCompareResults] = useState([]);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState("");

  const [visionFile, setVisionFile] = useState(null);
  const [visionResults, setVisionResults] = useState([]);
  const [visionLoading, setVisionLoading] = useState(false);
  const [visionError, setVisionError] = useState("");

  const [manual, setManual] = useState({
    title: "",
    userId: "",
    file: null,
    manualId: "",
    query: "",
  });
  const [manualResult, setManualResult] = useState([]);
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError, setManualError] = useState("");
  const [recentManuals, setRecentManuals] = useState([]);

  const [closetItem, setClosetItem] = useState({
    userId: "",
    name: "",
    category: "",
    color: "",
    brand: "",
    price: "",
    tags: "",
    notes: "",
  });
  const [closetList, setClosetList] = useState([]);
  const [closetExplain, setClosetExplain] = useState({
    userId: "",
    newItemDescription: "",
  });
  const [closetExplainResult, setClosetExplainResult] = useState("");
  const [closetLoading, setClosetLoading] = useState(false);
  const [closetError, setClosetError] = useState("");

  useEffect(() => {
    try {
      const storedUserId = localStorage.getItem(STORAGE_KEYS.lastUserId) || "";
      const storedManualId = localStorage.getItem(STORAGE_KEYS.lastManualId) || "";
      const storedManuals = localStorage.getItem(STORAGE_KEYS.recentManuals);
      const parsedManuals = storedManuals ? JSON.parse(storedManuals) : [];

      if (storedUserId) {
        setLastUserId(storedUserId);
        setManual((prev) => ({ ...prev, userId: storedUserId }));
        setClosetItem((prev) => ({ ...prev, userId: storedUserId }));
        setClosetExplain((prev) => ({ ...prev, userId: storedUserId }));
      }
      if (storedManualId) {
        setManual((prev) => ({ ...prev, manualId: storedManualId }));
      }
      if (Array.isArray(parsedManuals)) {
        setRecentManuals(parsedManuals);
      }
    } catch (err) {
      console.warn("Failed to load saved preferences.", err);
    }
  }, []);

  useEffect(() => {
    try {
      if (lastUserId) {
        localStorage.setItem(STORAGE_KEYS.lastUserId, lastUserId);
      }
      if (manual.manualId) {
        localStorage.setItem(STORAGE_KEYS.lastManualId, manual.manualId);
      }
      localStorage.setItem(STORAGE_KEYS.recentManuals, JSON.stringify(recentManuals));
    } catch (err) {
      console.warn("Failed to save preferences.", err);
    }
  }, [lastUserId, manual.manualId, recentManuals]);

  const clearSavedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.lastUserId);
      localStorage.removeItem(STORAGE_KEYS.lastManualId);
      localStorage.removeItem(STORAGE_KEYS.recentManuals);
    } catch (err) {
      console.warn("Failed to clear saved preferences.", err);
    }
    setLastUserId("");
    setRecentManuals([]);
    setManual((prev) => ({ ...prev, manualId: "", userId: "" }));
    setClosetItem((prev) => ({ ...prev, userId: "" }));
    setClosetExplain((prev) => ({ ...prev, userId: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompareChange = (e) => {
    const { name, value } = e.target;
    setCompare((prev) => ({ ...prev, [name]: value }));
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManual((prev) => ({ ...prev, [name]: value }));
  };

  const handleClosetChange = (e) => {
    const { name, value } = e.target;
    setClosetItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleClosetExplainChange = (e) => {
    const { name, value } = e.target;
    setClosetExplain((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");
    setPersona(null);

    try {
      const payload = {
        name: form.name.trim() || "Guest",
        age: Number(form.age) || 0,
        budget: Number(form.budget) || 0,
        interests: form.interests || "style",
      };

      const res = await fetch(`${API_BASE}/users/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.detail || "Failed to create user.");
      }
      const userIdValue = String(data.user_id);
      setLastUserId(userIdValue);
      setManual((prev) => ({ ...prev, userId: userIdValue }));
      setClosetItem((prev) => ({ ...prev, userId: userIdValue }));
      setClosetExplain((prev) => ({ ...prev, userId: userIdValue }));

      if (form.intent.trim()) {
        const personaRes = await fetch(`${API_BASE}/persona/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: form.intent,
            budget: payload.budget,
            occasion: form.occasion,
            style_goals: form.interests,
            user_id: data.user_id,
          }),
        });
        const personaData = await personaRes.json();
        if (personaRes.ok) {
          setPersona(personaData);
        }
      }

      const suggestions = await fetch(`${API_BASE}/users/recommend/${data.user_id}`);
      const finalData = await suggestions.json();
      setResult(finalData.suggestions || "No suggestions yet.");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompareSubmit = async (e) => {
    e.preventDefault();
    setCompareLoading(true);
    setCompareError("");
    setCompareResults([]);

    try {
      const payload = {
        query: compare.query,
        budget: compare.budget ? Number(compare.budget) : null,
        preferences: compare.preferences || null,
        max_results: 6,
      };

      const res = await fetch(`${API_BASE}/agents/compare`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Comparison search failed.");
      }
      setCompareResults(data.results || []);
    } catch (err) {
      setCompareError(err.message || "Comparison search failed.");
    } finally {
      setCompareLoading(false);
    }
  };

  const handleVisionSubmit = async (e) => {
    e.preventDefault();
    setVisionLoading(true);
    setVisionError("");
    setVisionResults([]);

    try {
      if (!visionFile) {
        throw new Error("Please select an image first.");
      }
      const formData = new FormData();
      formData.append("file", visionFile);

      const res = await fetch(`${API_BASE}/vision/search`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Vision search failed.");
      }
      setVisionResults(data.matches || []);
    } catch (err) {
      setVisionError(err.message || "Vision search failed.");
    } finally {
      setVisionLoading(false);
    }
  };

  const handleManualUpload = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    setManualError("");
    setManualResult([]);

    try {
      if (!manual.file) {
        throw new Error("Please select a PDF file.");
      }
      if (!manual.title.trim()) {
        throw new Error("Please enter a title for your style manual.");
      }

      const formData = new FormData();
      formData.append("title", manual.title);
      if (manual.userId) {
        formData.append("user_id", manual.userId);
      }
      formData.append("file", manual.file);

      const res = await fetch(`${API_BASE}/style-manuals/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Upload failed.");
      }
      setManual((prev) => ({
        ...prev,
        manualId: data.manual_id ? String(data.manual_id) : prev.manualId,
      }));
      if (data.manual_id) {
        const newManual = { id: String(data.manual_id), title: manual.title };
        setRecentManuals((prev) => {
          const existing = prev.filter((item) => item.id !== newManual.id);
          return [newManual, ...existing].slice(0, 5);
        });
      }
    } catch (err) {
      setManualError(err.message || "Upload failed.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleManualQuery = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    setManualError("");
    setManualResult([]);

    try {
      if (!manual.manualId) {
        throw new Error("Please enter a style manual ID.");
      }
      if (!manual.query.trim()) {
        throw new Error("Please enter a question to search.");
      }

      const res = await fetch(`${API_BASE}/style-manuals/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          manual_id: Number(manual.manualId),
          query: manual.query,
          top_k: 4,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Query failed.");
      }
      setManualResult(data.matches || []);
    } catch (err) {
      setManualError(err.message || "Query failed.");
    } finally {
      setManualLoading(false);
    }
  };

  const handleClosetAdd = async (e) => {
    e.preventDefault();
    setClosetLoading(true);
    setClosetError("");

    try {
      if (!closetItem.userId) {
        throw new Error("User ID is required.");
      }
      if (!closetItem.name.trim()) {
        throw new Error("Item name is required.");
      }

      const payload = {
        user_id: Number(closetItem.userId),
        name: closetItem.name,
        category: closetItem.category || null,
        color: closetItem.color || null,
        brand: closetItem.brand || null,
        price: closetItem.price ? Number(closetItem.price) : null,
        tags: closetItem.tags || null,
        notes: closetItem.notes || null,
      };

      const res = await fetch(`${API_BASE}/closet/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Failed to add item.");
      }

      const listRes = await fetch(`${API_BASE}/closet/items/${payload.user_id}`);
      const listData = await listRes.json();
      if (listRes.ok) {
        setClosetList(listData.items || []);
      }
    } catch (err) {
      setClosetError(err.message || "Failed to add item.");
    } finally {
      setClosetLoading(false);
    }
  };

  const handleClosetFetch = async (e) => {
    e.preventDefault();
    setClosetLoading(true);
    setClosetError("");

    try {
      if (!closetItem.userId) {
        throw new Error("User ID is required.");
      }

      const res = await fetch(`${API_BASE}/closet/items/${Number(closetItem.userId)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Failed to load closet.");
      }
      setClosetList(data.items || []);
    } catch (err) {
      setClosetError(err.message || "Failed to load closet.");
    } finally {
      setClosetLoading(false);
    }
  };

  const handleClosetExplain = async (e) => {
    e.preventDefault();
    setClosetLoading(true);
    setClosetError("");
    setClosetExplainResult("");

    try {
      if (!closetExplain.userId) {
        throw new Error("User ID is required.");
      }
      if (!closetExplain.newItemDescription.trim()) {
        throw new Error("Please describe the new item.");
      }

      const res = await fetch(`${API_BASE}/closet/compatibility`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(closetExplain.userId),
          new_item_description: closetExplain.newItemDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.detail || "Compatibility check failed.");
      }
      setClosetExplainResult(data.explanation || "No explanation returned.");
    } catch (err) {
      setClosetError(err.message || "Compatibility check failed.");
    } finally {
      setClosetLoading(false);
    }
  };

  return (
    <section className="space-y-10">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Your Style Brief</h2>
            <p className="mt-2 text-sm text-slate-600">
              Share what you want to feel and any budget stress. We will handle the rest.
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn"
            onClick={clearSavedData}
            aria-label="Clear saved form data"
          >
            Clear saved data
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Rachel Meyers"
              />
            </label>

            <label className="field">
              <span>Age</span>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="28"
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="field">
              <span>Budget (USD)</span>
              <input
                type="number"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                placeholder="250"
              />
            </label>

            <label className="field">
              <span>Occasion</span>
              <input
                type="text"
                name="occasion"
                value={form.occasion}
                onChange={handleChange}
                placeholder="High-stakes work gala"
              />
            </label>
          </div>

          <label className="field">
            <span>Style direction</span>
            <select name="interests" value={form.interests} onChange={handleChange}>
              <option value="">Select a style mood</option>
              {interestOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Intent & mood</span>
            <textarea
              name="intent"
              value={form.intent}
              onChange={handleChange}
              placeholder="I want to look powerful but approachable, and I am a bit anxious about budget."
              rows={4}
            />
          </label>

          <button type="submit" className="primary-btn" disabled={loading}>
            {loading ? "Crafting your plan..." : "Generate my shopping plan"}
          </button>
        </form>

        {error && <div className="error-card">{error}</div>}

        {persona && (
          <div className="result-card">
            <h3 className="text-lg font-semibold text-slate-900">Persona insight</h3>
            <p className="mt-2 text-sm text-slate-600">
              {persona.validation_message || "Your intent has been captured."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(persona.style_tags || []).map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="result-card">
            <h3 className="text-lg font-semibold text-slate-900">Shopping suggestions</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{result}</p>
          </div>
        )}
      </div>

      <div className="result-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Comparison Scout</h3>
          <p className="text-sm text-slate-600">
            Pulls options from multiple marketplaces and flags risky listings.
          </p>
        </div>

        <form onSubmit={handleCompareSubmit} className="grid gap-3">
          <label className="field">
            <span>Query</span>
            <input
              type="text"
              name="query"
              value={compare.query}
              onChange={handleCompareChange}
              placeholder="Black tailored blazer"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Budget</span>
              <input
                type="number"
                name="budget"
                value={compare.budget}
                onChange={handleCompareChange}
                placeholder="200"
              />
            </label>
            <label className="field">
              <span>Preferences</span>
              <input
                type="text"
                name="preferences"
                value={compare.preferences}
                onChange={handleCompareChange}
                placeholder="Structured, matte finish"
              />
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={compareLoading}>
            {compareLoading ? "Searching..." : "Compare prices"}
          </button>
        </form>

        {compareError && <div className="error-card">{compareError}</div>}

        {compareResults.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {compareResults.map((item) => (
              <div key={`${item.name}-${item.link}`} className="product-card">
                <div className="product-thumb">
                  {item.thumbnail || item.image ? (
                    <img
                      src={item.thumbnail || item.image}
                      alt={item.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-thumb__fallback">No image</div>
                  )}
                </div>
                <div className="product-body">
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-600">Source: {item.source}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {typeof item.price === "number" && (
                      <span>Price: ${item.price.toFixed(2)}</span>
                    )}
                    <span>Total: ${item.total_cost?.toFixed?.(2) || item.total_cost}</span>
                    {item.good_deal && <span className="tag">Good deal</span>}
                  </div>
                {item.review_risk?.risk_level && (
                    <p className="mt-2 text-xs text-amber-700">
                      Risk: {item.review_risk.risk_level}
                    </p>
                )}
                {item.link && (
                  <a
                    className="mt-2 inline-flex text-xs font-semibold text-slate-900 underline"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View listing
                  </a>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="result-card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Visual Search</h3>
          <p className="text-sm text-slate-600">
            Upload a photo and we will find close matches online.
          </p>
        </div>

        <form onSubmit={handleVisionSubmit} className="grid gap-3">
          <label className="field">
            <span>Upload image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setVisionFile(e.target.files?.[0] || null)}
            />
          </label>
          <button className="primary-btn" type="submit" disabled={visionLoading}>
            {visionLoading ? "Analyzing..." : "Find matches"}
          </button>
        </form>

        {visionError && <div className="error-card">{visionError}</div>}

        {visionResults.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {visionResults.map((match) => (
              <div key={`${match.title}-${match.link}`} className="product-card">
                <div className="product-thumb">
                  {match.thumbnail ? (
                    <img src={match.thumbnail} alt={match.title} loading="lazy" />
                  ) : (
                    <div className="product-thumb__fallback">No image</div>
                  )}
                </div>
                <div className="product-body">
                  <p className="text-sm font-semibold text-slate-900">{match.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{match.source}</p>
                  {match.price && <p className="mt-1 text-xs text-slate-600">{match.price}</p>}
                {match.link && (
                  <a
                    className="mt-2 inline-flex text-xs font-semibold text-slate-900 underline"
                    href={match.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View match
                  </a>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="result-card space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Style Manual</h3>
          <p className="text-sm text-slate-600">
            Upload your PDF guide and query it for on-brand guidance.
          </p>
        </div>

        <form onSubmit={handleManualUpload} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Manual title</span>
              <input
                type="text"
                name="title"
                value={manual.title}
                onChange={handleManualChange}
                placeholder="2026 Spring Capsule"
              />
            </label>
            <label className="field">
              <span>User ID (optional)</span>
              <input
                type="number"
                name="userId"
                value={manual.userId}
                onChange={handleManualChange}
                placeholder={lastUserId || "1"}
              />
            </label>
          </div>
          <label className="field">
            <span>PDF File</span>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) =>
                setManual((prev) => ({ ...prev, file: e.target.files?.[0] || null }))
              }
            />
          </label>
          <button className="primary-btn" type="submit" disabled={manualLoading}>
            {manualLoading ? "Uploading..." : "Upload style manual"}
          </button>
        </form>

        <form onSubmit={handleManualQuery} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="field">
              <span>Manual ID</span>
              <input
                type="number"
                name="manualId"
                value={manual.manualId}
                onChange={handleManualChange}
                placeholder="ID from upload"
              />
            </label>
            <label className="field">
              <span>Recent manuals</span>
              <select
                value={manual.manualId}
                onChange={(e) =>
                  setManual((prev) => ({ ...prev, manualId: e.target.value }))
                }
              >
                <option value="">Select recent manual</option>
                {recentManuals.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} (#{item.id})
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Question</span>
              <input
                type="text"
                name="query"
                value={manual.query}
                onChange={handleManualChange}
                placeholder="What colors dominate the season?"
              />
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={manualLoading}>
            {manualLoading ? "Searching..." : "Search style manual"}
          </button>
        </form>

        {manualError && <div className="error-card">{manualError}</div>}

        {manualResult.length > 0 && (
          <div className="grid gap-3">
            {manualResult.map((match, index) => (
              <div key={`${index}-${match.slice(0, 16)}`} className="glass-panel">
                <p className="text-xs text-slate-600 whitespace-pre-line">{match}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="result-card space-y-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Virtual Closet</h3>
          <p className="text-sm text-slate-600">
            Track your closet, then ask why a new item works with your existing looks.
          </p>
        </div>

        <form onSubmit={handleClosetAdd} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>User ID</span>
              <input
                type="number"
                name="userId"
                value={closetItem.userId}
                onChange={handleClosetChange}
                placeholder="1"
              />
            </label>
            <label className="field">
              <span>Item name</span>
              <input
                type="text"
                name="name"
                value={closetItem.name}
                onChange={handleClosetChange}
                placeholder="Black wide-leg trousers"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Category</span>
              <input
                type="text"
                name="category"
                value={closetItem.category}
                onChange={handleClosetChange}
                placeholder="Bottoms"
              />
            </label>
            <label className="field">
              <span>Color</span>
              <input
                type="text"
                name="color"
                value={closetItem.color}
                onChange={handleClosetChange}
                placeholder="Black"
              />
            </label>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>Brand</span>
              <input
                type="text"
                name="brand"
                value={closetItem.brand}
                onChange={handleClosetChange}
                placeholder="Massimo Dutti"
              />
            </label>
            <label className="field">
              <span>Price</span>
              <input
                type="number"
                name="price"
                value={closetItem.price}
                onChange={handleClosetChange}
                placeholder="120"
              />
            </label>
          </div>
          <label className="field">
            <span>Tags</span>
            <input
              type="text"
              name="tags"
              value={closetItem.tags}
              onChange={handleClosetChange}
              placeholder="tailored, matte, work"
            />
          </label>
          <label className="field">
            <span>Notes</span>
            <input
              type="text"
              name="notes"
              value={closetItem.notes}
              onChange={handleClosetChange}
              placeholder="Pairs with gold jewelry"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="primary-btn" type="submit" disabled={closetLoading}>
              {closetLoading ? "Saving..." : "Add to closet"}
            </button>
            <button
              className="primary-btn"
              type="button"
              onClick={handleClosetFetch}
              disabled={closetLoading}
            >
              {closetLoading ? "Loading..." : "Refresh closet"}
            </button>
          </div>
        </form>

        {closetError && <div className="error-card">{closetError}</div>}

        {closetList.length > 0 && (
          <div className="grid gap-3 md:grid-cols-2">
            {closetList.map((item) => (
              <div key={`${item.id}-${item.name}`} className="glass-panel">
                <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {item.category || ""} {item.color || ""}
                </p>
                {item.brand && <p className="mt-1 text-xs text-slate-600">{item.brand}</p>}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleClosetExplain} className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <label className="field">
              <span>User ID</span>
              <input
                type="number"
                name="userId"
                value={closetExplain.userId}
                onChange={handleClosetExplainChange}
                placeholder="1"
              />
            </label>
            <label className="field">
              <span>New item description</span>
              <input
                type="text"
                name="newItemDescription"
                value={closetExplain.newItemDescription}
                onChange={handleClosetExplainChange}
                placeholder="Ivory silk blouse with soft drape"
              />
            </label>
          </div>
          <button className="primary-btn" type="submit" disabled={closetLoading}>
            {closetLoading ? "Analyzing..." : "Explain why it works"}
          </button>
        </form>

        {closetExplainResult && (
          <div className="glass-panel">
            <p className="text-sm text-slate-600 whitespace-pre-line">{closetExplainResult}</p>
          </div>
        )}
      </div>
    </section>
  );
}
