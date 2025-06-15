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

// notes.html
async function initNotesPage() {
  initNav();
  const container       = document.getElementById('notes-container');
  const filterEl        = document.getElementById('filter');
  const addBtn          = document.getElementById('add-btn');
  const restoreBtn      = document.getElementById('restore-btn');
  const clearBtn        = document.getElementById('clear-btn');
  const fetchBtn        = document.getElementById('fetch-btn');

  // 1) Twoje początkowe notatki
  const emptyNotes = [];
  const initialNotes = [
      {
        id: Date.now(),
        title: 'Lista zakupów',
        content: 'Żona informatyka wysyła go po zakupy:\n- Kup parówki, a jak będą jajka, to kup dziesięć.\nChłopina po wejściu do sklepu pyta:\n- Czy są jajka?\n- Tak - odpowiada sprzedawca.\n- To poproszę dziesięć parówek.\n',
        category: 'personal',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 1,
        title: 'Terminy egzaminów',
        content: '10 czerwiec - Badania operacyjne\n13 czerwiec - Sieci komputerowe\n',
        category: 'personal',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 2,
        title: 'Etap I - Mockupy',
        content: '- Utworzyć konto na Figmie\n- Utworzyć mockup dla wersji desktop\n- Utworzyć mockup dla wersji tablet\n- Utworzyć mockup dla wersji mobile\n',
        category: 'work',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 3,
        title: 'Etap II - Implementacja',
        content: '- Stworzenie aplikacji\n- Dołączenie API\n- Przygotowanie responsywności stron\n',
        category: 'work',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 4,
        title: 'Etap III - Dokumentacja i testy',
        content: '- Przygotowanie dokumentacji w Markdown\n- Testy aplikacji w przeglądarkach\n',
        category: 'work',
        createdAt: new Date().toISOString()
      },
      {
        id: Date.now() + 5,
        title: 'Pomysły na bloga',
        content: '- Artykuł o JavaScript\n- Recenzja książki UX\n- Tutorial Fetch API',
        category: 'others',
        createdAt: new Date().toISOString()
      }
    ];

  // 2) Zainicjuj storage jeśli pierwszy raz
  if (!localStorage.getItem('initialized')) {
    saveNotes(initialNotes);
    localStorage.setItem('initialized', 'true');
  }
  let notes = loadNotes();

  // 3) Render
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

  // 4) Filtr
  filterEl.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    render(loadNotes().filter(n => n.title.toLowerCase().includes(q)));
  });

  // 5) Dodaj nową
  addBtn.addEventListener('click', () => {
    const id = Date.now();
    addNote({ id, title: 'Nowa notatka', content: '', category: 'others', createdAt: new Date().toISOString() });
    window.location.href = `note.html?id=${id}`;
  });

  // 6) Wyczyść wszystkie (przywróć tylko initialNotes)
  clearBtn.addEventListener('click', () => {
    if (!confirm('Usunąć wszystkie notatki?')) return;
    saveNotes(emptyNotes);
    render(emptyNotes);
  });

  // 6) Wyczyść wszystkie (przywróć tylko initialNotes)
  restoreBtn.addEventListener('click', () => {
    if (!confirm('Usunąć wszystkie notatki i przywrócić tylko 3 początkowe?')) return;
    saveNotes(initialNotes);
    render(initialNotes);
  });

  // 7) Ponowny fetch z JSONPlaceholder (10 postów)
  fetchBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=10');
      const posts = await res.json();
      const apiNotes = posts.map(p => ({
        id: p.id + 1000,  // unikamy kolizji z initialNotes
        title: p.title,
        content: p.body,
        category: 'others',
        createdAt: new Date().toISOString()
      }));
      saveNotes(apiNotes);
      render(apiNotes);
    } catch (e) {
      alert('Błąd pobierania z API');
      console.error(e);
    }
  });

  // 8) Pierwotny render
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
    alert('Dziękuję za wiadomość! Chociaż nigdy nie dotrze!');
    form.reset();
  });
}
