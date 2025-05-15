// Obsługa localStorage
const STORAGE_KEY = 'notes';

// Załaduj notatki
function loadNotes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

// Zapisz notatki
function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Dodaj notatkę
function addNote(note) {
  const notes = loadNotes();
  notes.push(note);
  saveNotes(notes);
}

// Zaktualizuj notatkę
function updateNote(id, updates) {
  const notes = loadNotes().map(n => n.id === id ? { ...n, ...updates } : n);
  saveNotes(notes);
}

// Usuń notatkę
function deleteNote(id) {
  const notes = loadNotes().filter(n => n.id !== id);
  saveNotes(notes);
}

// GET do notatkek
function getNote(id) {
  return loadNotes().find(n => n.id === id);
}
