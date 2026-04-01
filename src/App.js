import { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  orderBy,
  query
} from "firebase/firestore";
import "./App.css";

function App() {
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const notesCollection = collection(db, "notes");

  const addNote = async () => {
    if (note.trim() === "" || saving) return;
    setSaving(true);
    await addDoc(notesCollection, { text: note, createdAt: new Date() });
    setNote("");
    await fetchNotes();
    setSaving(false);
  };

  const fetchNotes = async () => {
    const q = query(notesCollection, orderBy("createdAt", "desc"));
    const data = await getDocs(q);
    setNotes(data.docs.map((d) => ({ ...d.data(), id: d.id })));
    setLoading(false);
  };

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, "notes", id));
    await fetchNotes();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addNote();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Math.floor((new Date() - date) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const todayCount = notes.filter((n) => {
    if (!n.createdAt) return false;
    const d = n.createdAt.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
    return new Date().toDateString() === d.toDateString();
  }).length;

 useEffect(() => {
    fetchNotes();
}, [fetchNotes]);

  return (
    <div className="app-wrap">
      <div className="container">

        <div className="top-bar">
          <div className="logo">note<span>.</span>vault</div>
        </div>

        <div className="hero">
          <div className="hero-label">
            <span className="pulse-dot"></span> Your thoughts deserve a home
          </div>
          <h1>Forget nothing.<br />Regret nothing.</h1>
          <p className="hero-sub">Type it. Save it. It lives in the cloud now — rent-free.</p>
        </div>

        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{notes.length}</div>
            <div className="stat-label">Total Notes</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{todayCount}</div>
            <div className="stat-label">Added Today</div>
          </div>
          <div className="stat-card">
            <div className="stat-num synced">&#10003;</div>
            <div className="stat-label">Synced</div>
          </div>
        </div>

        <div className="input-card">
          <div className="card-label">
            <span className="dot-accent"></span> New note
          </div>
          <div className="input-row">
            <input
              type="text"
              className="note-input"
              placeholder="What's on your mind..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={saving}
            />
            <button
              className={`btn-add${saving ? " btn-saving" : ""}`}
              onClick={addNote}
              disabled={saving}
            >
              {saving ? "Saving..." : "+ Add"}
            </button>
          </div>
        </div>

        <div className="notes-header">
          <span className="notes-header-label">Saved notes</span>
          <span className="notes-badge">{notes.length} {notes.length === 1 ? "note" : "notes"}</span>
        </div>

        <div className="notes-list">
          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Loading notes...</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">&#9675;</div>
              <p>Nothing here yet. Your first note is one click away.</p>
            </div>
          ) : (
            notes.map((n, i) => (
              <div className="note-item" key={n.id}>
                <span className="note-index">{String(i + 1).padStart(2, "0")}</span>
                <p className="note-text">{n.text}</p>
                <span className="note-time">{formatTime(n.createdAt)}</span>
                <button className="btn-delete" onClick={() => deleteNote(n.id)} title="Delete">
                  &times;
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default App;