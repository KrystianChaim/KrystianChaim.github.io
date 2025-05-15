// CRUD w localStorage
const STORAGE_KEY = 'notes';

function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function addNote(note) {
  const notes = loadNotes();
  notes.push(note);
  saveNotes(notes);
}

function updateNote(id, updates) {
  const notes = loadNotes().map(n => n.id === id ? { ...n, ...updates } : n);
  saveNotes(notes);
}

function deleteNote(id) {
  const notes = loadNotes().filter(n => n.id !== id);
  saveNotes(notes);
}

function getNote(id) {
  return loadNotes().find(n => n.id === id);
}
