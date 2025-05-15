document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname.split('/').pop();
  switch (path) {
    case 'notes.html': initNotesPage(); break;
    case 'note.html': initNotePage(); break;
    case 'categories.html': initCategoriesPage(); break;
    case 'about.html': initAboutPage(); break;
    default: initNav();
  }
});

// Wspólne: menu mobilne
function initNav() {
  const btn = document.getElementById('nav-toggle');
  const ul = document.querySelector('nav ul');
  btn && btn.addEventListener('click', () => {
    ul.style.display = ul.style.display === 'flex' ? 'none' : 'flex';
    ul.style.flexDirection = 'column';
  });
}

// notes.html: fetch z API jeśli lokalnie pusto
async function initNotesPage() {
  initNav();
  const container = document.getElementById('notes-container');
  const filterEl = document.getElementById('filter');
  const addBtn = document.getElementById('add-btn');

  // 1) pobierz lokalne notatki
  let notes = loadNotes();

  // 2) jeśli pusto, fetch z JSONPlaceholder
  if (notes.length === 0) {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
      const posts = await res.json();
      notes = posts.map(p => ({
        id: p.id,
        title: p.title,
        content: p.body,
        category: 'others',
        createdAt: new Date().toISOString()
      }));
      saveNotes(notes);
    } catch (e) {
      console.error('Błąd pobierania z API:', e);
    }
  }

  // funkcja renderująca
  function render(list) {
    container.innerHTML = '';
    list.forEach(n => {
      const div = document.createElement('div');
      div.className = 'card';
      div.textContent = n.title;
      div.onclick = () => window.location.href = `note.html?id=${n.id}`;
      container.appendChild(div);
    });
  }

  // filtrowanie
  filterEl.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    render(loadNotes().filter(n => n.title.toLowerCase().includes(q)));
  });

  // dodawanie nowej notatki
  addBtn.addEventListener('click', () => {
    const id = Date.now();
    addNote({
      id,
      title: 'Nowa notatka',
      content: '',
      category: 'others',
      createdAt: new Date().toISOString()
    });
    window.location.href = `note.html?id=${id}`;
  });

  render(notes);
}

// note.html
function initNotePage() {
  initNav();
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const note = getNote(id);
  if (!note) return;

  const titleInput     = document.getElementById('note-title');
  const categorySelect = document.getElementById('note-category');
  const contentEl      = document.getElementById('note-content');
  const backBtn        = document.getElementById('back-btn');
  const saveBtn        = document.getElementById('save-btn');
  const deleteBtn      = document.getElementById('delete-btn');

  titleInput.value     = note.title;
  categorySelect.value = note.category;
  contentEl.value      = note.content;

  backBtn.addEventListener('click', () => history.back());

  saveBtn.addEventListener('click', () => {
    updateNote(id, {
      title:    titleInput.value,
      category: categorySelect.value,
      content:  contentEl.value
    });
    alert('Zapisano zmiany!');
  });

  deleteBtn.addEventListener('click', () => {
    if (confirm('Usunąć notatkę?')) {
      deleteNote(id);
      window.location.href = 'notes.html';
    }
  });
}

// categories.html
function initCategoriesPage() {
  initNav();
  ['personal','work','others'].forEach(cat => {
    const listEl = document.querySelector(`.card-list[data-category="${cat}"]`);
    loadNotes()
      .filter(n => n.category === cat)
      .forEach(n => {
        const div = document.createElement('div');
        div.className = 'card';
        div.textContent = n.title;
        div.onclick = () => window.location.href = `note.html?id=${n.id}`;
        listEl.appendChild(div);
      });
  });
}

// about.html
function initAboutPage() {
  initNav();
  const form = document.getElementById('contact-form');
  form.addEventListener('submit', e => {
    e.preventDefault();
    alert('Dziękuję za wiadomość!');
    form.reset();
  });
}
