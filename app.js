// ==========================================================================
// TİD Defteri - Uygulama Mantığı (Sıfırdan Başlangıç)
// ==========================================================================

import { initialCategories, initialWords, initialSentences } from './data.js';
import { supabase } from './supabaseClient.js';

// v5 Anahtarları (1., 2. ve 3. Hafta kelimeleri için)
const STORAGE_WORDS_KEY = 'tid_words_v5';
const STORAGE_SENTENCES_KEY = 'tid_sentences_v5';
const STORAGE_CATEGORIES_KEY = 'tid_categories_v5';
const STORAGE_GUEST_PROGRESS_KEY = 'tid_guest_progress_v5';

let state = {
  categories: [],
  words: [],
  sentences: [],
  currentUser: null,
  authTab: 'login',
  activeTab: 'words',
  activeCategory: 'all',
  activeSort: 'default',
  practiceMode: 'word', // 'word' | 'sentence-generator'
  practiceCategory: 'all',
  genSentenceLength: 3,
  genCategory: 'all',
  currentGeneratedSentence: [],
  searchQuery: '',
  sentenceSearchQuery: '',
  categorySearchQuery: '',
  currentFlashcard: null,
  activeVideoItem: null
};

// Toast Bildirimi Göster
function showToast(message, duration = 2800) {
  const toast = document.getElementById('toast-notification');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// YouTube Linkini Embed formatına çevirici
function parseYouTubeUrl(url) {
  if (!url) return null;
  try {
    let videoId = null;
    let startTime = 0;

    const timeMatch = url.match(/[?&](?:t|start)=(\d+)s?/);
    if (timeMatch) {
      startTime = parseInt(timeMatch[1], 10);
    }

    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split(/[?&]/)[0];
    } else if (url.includes('youtube.com/shorts/')) {
      videoId = url.split('youtube.com/shorts/')[1].split(/[?&]/)[0];
    } else if (url.includes('youtube.com/watch')) {
      const urlObj = new URL(url);
      videoId = urlObj.searchParams.get('v');
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('youtube.com/embed/')[1].split(/[?&]/)[0];
    }

    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&start=${startTime}`;
    }
  } catch (e) {
    console.error('URL parse hatası:', e);
  }
  return null;
}

// Yerel Yedekten Kategorileri Yükle
function loadLocalCategories() {
  const savedCategories = localStorage.getItem(STORAGE_CATEGORIES_KEY);
  if (!savedCategories) {
    const prevCatStr = localStorage.getItem('tid_categories_v4');
    if (prevCatStr) {
      try {
        const prevCats = JSON.parse(prevCatStr);
        const prevCatIds = new Set(prevCats.map(c => c.id));
        const newCatsFromInitial = initialCategories.filter(c => !prevCatIds.has(c.id));
        state.categories = [...prevCats, ...newCatsFromInitial];
      } catch (e) {
        state.categories = initialCategories;
      }
    } else {
      state.categories = initialCategories;
    }
  } else {
    try {
      state.categories = JSON.parse(savedCategories);
    } catch(e) {
      state.categories = initialCategories;
    }
  }
}

// Yerel Yedekten Kelimeleri Yükle
function loadLocalWords() {
  const savedWords = localStorage.getItem(STORAGE_WORDS_KEY);
  if (!savedWords) {
    const prevWordsStr = localStorage.getItem('tid_words_v4');
    if (prevWordsStr) {
      try {
        const prevWords = JSON.parse(prevWordsStr);
        const prevIds = new Set(prevWords.map(w => w.id));
        const newFromInitial = initialWords.filter(w => !prevIds.has(w.id));
        state.words = [...prevWords, ...newFromInitial];
      } catch (e) {
        state.words = initialWords;
      }
    } else {
      state.words = initialWords;
    }
  } else {
    try {
      state.words = JSON.parse(savedWords);
    } catch (e) {
      state.words = initialWords;
    }
  }
}

// Anında Yerel Önbelleği Ekrana Bas (0 Gecikme)
function loadInitialCache() {
  loadLocalCategories();
  loadLocalWords();
  const savedSentences = localStorage.getItem(STORAGE_SENTENCES_KEY);
  state.sentences = savedSentences ? JSON.parse(savedSentences) : initialSentences;

  // Misafir İlerlemesini Yükle
  let guestMap = {};
  const guestProgStr = localStorage.getItem(STORAGE_GUEST_PROGRESS_KEY);
  if (guestProgStr) {
    try { guestMap = JSON.parse(guestProgStr); } catch (e) {}
  } else {
    const savedWordsStr = localStorage.getItem(STORAGE_WORDS_KEY);
    if (savedWordsStr) {
      try {
        const oldSaved = JSON.parse(savedWordsStr);
        oldSaved.forEach(w => {
          if (w.clickCount || (w.status && w.status !== 'learning')) {
            guestMap[w.id] = { clickCount: w.clickCount || 0, status: w.status || 'learning' };
          }
        });
        localStorage.setItem(STORAGE_GUEST_PROGRESS_KEY, JSON.stringify(guestMap));
      } catch (e) {}
    }
  }

  state.words.forEach(w => {
    if (guestMap[w.id]) {
      w.clickCount = guestMap[w.id].clickCount || 0;
      w.status = guestMap[w.id].status || 'learning';
    }
  });

  const emanetWord = state.words.find(w => w.id === 'w-316' || w.word.toLowerCase().includes('emanet'));
  if (emanetWord && !emanetWord.ytUrl) {
    emanetWord.ytUrl = 'https://isaretce.com/wp-content/uploads/2017/03/allaha-emanet-ol.gif';
    emanetWord.notes = emanetWord.notes || 'İşaretçe TİD Hareketli GIF';
  }

  updateStatsHeader();
  renderFilterChips();
  renderWordsList();
  renderSentencesList();
  renderTopForgottenList();
  loadRandomFlashcard();
}

// Verileri Supabase veya Yerel Kaynaktan Yükle
async function loadDataFromSupabaseOrLocal() {
  // 1. Kullanıcı Oturumunu Kontrol Et
  try {
    const { data: { session } } = await supabase.auth.getSession();
    state.currentUser = session?.user || null;
  } catch (e) {
    console.warn('Supabase session kontrolü:', e);
  }
  updateAuthUI();

  // 2. Kategorileri Çek
  try {
    const { data: dbCategories, error: catErr } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (dbCategories && dbCategories.length > 0) {
      state.categories = dbCategories.map(c => ({
        id: c.id,
        name: c.name,
        color: c.color,
        userId: c.user_id
      }));
    } else {
      loadLocalCategories();
    }
  } catch (err) {
    console.warn('Supabase kategori hatası, yerel yükleniyor:', err);
    loadLocalCategories();
  }

  // 3. Kelimeleri Çek
  try {
    const { data: dbWords, error: wordErr } = await supabase
      .from('words')
      .select('*')
      .order('id');

    if (dbWords && dbWords.length > 0) {
      state.words = dbWords.map(w => ({
        id: w.id,
        word: w.word,
        category: w.category,
        week: w.week,
        ytUrl: w.yt_url || '',
        notes: w.notes || '',
        userId: w.user_id,
        clickCount: 0,
        status: 'learning'
      }));
    } else {
      loadLocalWords();
    }
  } catch (err) {
    console.warn('Supabase kelime hatası, yerel yükleniyor:', err);
    loadLocalWords();
  }

  // 4. İlerleme & İzlenme Sayılarını Eşitle (Giriş Yapmış Üye vs Misafir)
  if (state.currentUser) {
    try {
      const { data: progressList } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', state.currentUser.id);

      if (progressList && progressList.length > 0) {
        const progMap = {};
        progressList.forEach(p => {
          progMap[p.word_id] = { clickCount: p.click_count, status: p.status };
        });

        state.words.forEach(w => {
          if (progMap[w.id]) {
            w.clickCount = progMap[w.id].clickCount || 0;
            w.status = progMap[w.id].status || 'learning';
          }
        });
      }
    } catch (err) {
      console.warn('Supabase kullanıcı ilerleme hatası:', err);
    }
  } else {
    // Misafir Modu: localStorage ilerlemesini eşle
    let guestMap = {};
    const guestProgStr = localStorage.getItem(STORAGE_GUEST_PROGRESS_KEY);
    if (guestProgStr) {
      try { guestMap = JSON.parse(guestProgStr); } catch (e) {}
    } else {
      const savedWordsStr = localStorage.getItem(STORAGE_WORDS_KEY);
      if (savedWordsStr) {
        try {
          const oldSaved = JSON.parse(savedWordsStr);
          oldSaved.forEach(w => {
            if (w.clickCount || (w.status && w.status !== 'learning')) {
              guestMap[w.id] = { clickCount: w.clickCount || 0, status: w.status || 'learning' };
            }
          });
          localStorage.setItem(STORAGE_GUEST_PROGRESS_KEY, JSON.stringify(guestMap));
        } catch (e) {}
      }
    }

    state.words.forEach(w => {
      if (guestMap[w.id]) {
        w.clickCount = guestMap[w.id].clickCount || 0;
        w.status = guestMap[w.id].status || 'learning';
      }
    });
  }

  // 5. Cümleler (Yerel Saklama)
  const savedSentences = localStorage.getItem(STORAGE_SENTENCES_KEY);
  state.sentences = savedSentences ? JSON.parse(savedSentences) : initialSentences;

  // Allah'a emanet ol için hareketli GIF garanti bağlantısı
  const emanetWord = state.words.find(w => w.id === 'w-316' || w.word.toLowerCase().includes('emanet'));
  if (emanetWord && !emanetWord.ytUrl) {
    emanetWord.ytUrl = 'https://isaretce.com/wp-content/uploads/2017/03/allaha-emanet-ol.gif';
    emanetWord.notes = emanetWord.notes || 'İşaretçe TİD Hareketli GIF';
  }

  saveState();
  renderFilterChips();
  renderWordsList();
  renderSentencesList();
  renderTopForgottenList();
  loadRandomFlashcard();
}

// İlerlemeyi Buluta veya Misafir Hafızasına Kaydet
async function syncWordProgress(word) {
  if (state.currentUser) {
    try {
      await supabase
        .from('user_word_progress')
        .upsert({
          user_id: state.currentUser.id,
          word_id: word.id,
          click_count: word.clickCount || 0,
          status: word.status || 'learning',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,word_id' });
    } catch (err) {
      console.warn('Supabase ilerleme kaydetme hatası:', err);
    }
  } else {
    // Misafir Modu
    let guestProg = {};
    try {
      guestProg = JSON.parse(localStorage.getItem(STORAGE_GUEST_PROGRESS_KEY) || '{}');
    } catch (e) {}
    guestProg[word.id] = {
      clickCount: word.clickCount || 0,
      status: word.status || 'learning'
    };
    localStorage.setItem(STORAGE_GUEST_PROGRESS_KEY, JSON.stringify(guestProg));
  }
}

function saveState() {
  localStorage.setItem(STORAGE_WORDS_KEY, JSON.stringify(state.words));
  localStorage.setItem(STORAGE_SENTENCES_KEY, JSON.stringify(state.sentences));
  localStorage.setItem(STORAGE_CATEGORIES_KEY, JSON.stringify(state.categories));
  updateStatsHeader();
}

// İstatistikleri Güncelle
function updateStatsHeader() {
  const totalWordsEl = document.getElementById('total-words-count');
  const totalSentencesEl = document.getElementById('total-sentences-count');
  const hardWordsEl = document.getElementById('hard-words-count');
  const unuttuklarimBadge = document.getElementById('unuttuklarim-badge');

  if (totalWordsEl) totalWordsEl.textContent = state.words.length;
  if (totalSentencesEl) totalSentencesEl.textContent = state.sentences.length;

  const hardCount = state.words.filter(w => w.status === 'hard').length;
  if (hardWordsEl) hardWordsEl.textContent = hardCount;

  const forgottenCount = state.words.filter(w => (w.clickCount || 0) >= 3).length;
  if (unuttuklarimBadge) unuttuklarimBadge.textContent = forgottenCount;
}

// Kategori Çiplerini Çiz
function renderFilterChips() {
  const categoryChipsList = document.getElementById('category-chips-list');

  // Kategoriler
  if (categoryChipsList) {
    const q = (state.categorySearchQuery || '').toLowerCase().trim();
    const visibleCategories = q
      ? state.categories.filter(c => c.name.toLowerCase().includes(q))
      : state.categories;

    let catHtml = `<button class="chip-btn ${state.activeCategory === 'all' ? 'active' : ''}" data-cat="all">Tümü</button>`;

    if (visibleCategories.length === 0) {
      catHtml += `<span class="no-cat-found">"${escapeHtml(state.categorySearchQuery)}" bulunamadı</span>`;
    } else {
      visibleCategories.forEach(cat => {
        catHtml += `
          <button class="chip-btn ${state.activeCategory === cat.id ? 'active' : ''}" data-cat="${cat.id}">
            ${escapeHtml(cat.name)}
          </button>
        `;
      });
    }

    categoryChipsList.innerHTML = catHtml;

    categoryChipsList.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.activeCategory = btn.getAttribute('data-cat');
        categoryChipsList.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        renderWordsList();
      });
    });
  }

  populateCategorySelects();
  populatePracticeFilters();
}

function populateCategorySelects() {
  const wordCatSelect = document.getElementById('word-category');
  const sentenceCatSelect = document.getElementById('sentence-category');

  const optionsHtml = state.categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  if (wordCatSelect) wordCatSelect.innerHTML = optionsHtml;
  if (sentenceCatSelect) sentenceCatSelect.innerHTML = optionsHtml;
}

function populatePracticeFilters() {
  const catSelect = document.getElementById('practice-category-select');
  const genCatSelect = document.getElementById('gen-category-select');

  const populateCat = (select, currentVal) => {
    if (!select) return;
    let catOptions = `<option value="all" ${currentVal === 'all' ? 'selected' : ''}>🎲 Tümü (Karışık - ${state.words.length})</option>`;
    state.categories.forEach(cat => {
      const count = state.words.filter(w => w.category === cat.id).length;
      catOptions += `<option value="${cat.id}" ${currentVal === cat.id ? 'selected' : ''}>${cat.name} (${count})</option>`;
    });
    select.innerHTML = catOptions;
  };

  populateCat(catSelect, state.practiceCategory || 'all');
  populateCat(genCatSelect, state.genCategory || 'all');
}

let pendingConfirmCallback = null;

let editingItemId = null;
let editingItemType = null; // 'word' | 'sentence'

function openEditWordModal(word) {
  editingItemId = word.id;
  editingItemType = 'word';

  const title = document.getElementById('add-modal-title');
  const submitBtn = document.getElementById('btn-submit-word');
  const tabs = document.getElementById('add-modal-tabs');
  const tabWordBtn = document.getElementById('modal-tab-word');

  if (title) title.textContent = 'Kelimeyi Düzenle';
  if (submitBtn) submitBtn.textContent = 'Güncelle';
  if (tabs) tabs.style.display = 'none';

  tabWordBtn?.click();

  const wordInput = document.getElementById('word-input');
  const catInput = document.getElementById('word-category');
  const ytInput = document.getElementById('word-yt');
  const notesInput = document.getElementById('word-notes');

  if (wordInput) wordInput.value = word.word || '';
  if (catInput) catInput.value = word.category || 'diger';
  if (ytInput) ytInput.value = word.ytUrl || '';
  if (notesInput) notesInput.value = word.notes || '';

  document.getElementById('add-modal')?.classList.add('active');
}

function openEditSentenceModal(sentence) {
  editingItemId = sentence.id;
  editingItemType = 'sentence';

  const title = document.getElementById('add-modal-title');
  const submitBtn = document.getElementById('btn-submit-sentence');
  const tabs = document.getElementById('add-modal-tabs');
  const tabSentenceBtn = document.getElementById('modal-tab-sentence');

  if (title) title.textContent = 'Cümleyi Düzenle';
  if (submitBtn) submitBtn.textContent = 'Güncelle';
  if (tabs) tabs.style.display = 'none';

  tabSentenceBtn?.click();

  const trInput = document.getElementById('sentence-turkish');
  const tidInput = document.getElementById('sentence-tid');
  const catInput = document.getElementById('sentence-category');
  const ytInput = document.getElementById('sentence-yt');
  const notesInput = document.getElementById('sentence-notes');

  if (trInput) trInput.value = sentence.turkish || '';
  if (tidInput) tidInput.value = (sentence.tidOrder || []).join(', ');
  if (catInput) catInput.value = sentence.category || 'diger';
  if (ytInput) ytInput.value = sentence.ytUrl || '';
  if (notesInput) notesInput.value = sentence.notes || '';

  document.getElementById('add-modal')?.classList.add('active');
}

function showConfirmDialog(title, message, onConfirm) {
  const modal = document.getElementById('confirm-modal');
  const titleEl = document.getElementById('confirm-modal-title');
  const msgEl = document.getElementById('confirm-modal-message');

  if (titleEl) titleEl.textContent = title;
  if (msgEl) msgEl.textContent = message;
  pendingConfirmCallback = onConfirm;

  modal?.classList.add('active');
}

// Kelimeler Listesini Çiz
function renderWordsList() {
  const container = document.getElementById('words-cards-container');
  if (!container) return;

  let filtered = [...state.words];

  // Arama (Kelime, Not veya Kategori adıyla eşleşme)
  if (state.searchQuery.trim() !== '') {
    const q = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(w => {
      const cat = state.categories.find(c => c.id === w.category);
      const catName = cat ? cat.name.toLowerCase() : '';
      return w.word.toLowerCase().includes(q) || 
             (w.notes && w.notes.toLowerCase().includes(q)) ||
             catName.includes(q);
    });
  }

  // Kategori Filtresi
  if (state.activeCategory !== 'all') {
    filtered = filtered.filter(w => w.category === state.activeCategory);
  }

  // Sıralama
  if (state.activeSort === 'most-clicked') {
    filtered.sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0));
  } else if (state.activeSort === 'hard-only') {
    filtered = filtered.filter(w => w.status === 'hard');
  }

  // Boş Durum
  if (filtered.length === 0) {
    if (state.words.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Henüz kelime eklenmedi</div>
          <p class="empty-state-desc">Öğrendiğin işaret dili kelimelerini defterine kaydetmeye başla.</p>
          <button class="btn-empty-add" id="btn-empty-add-word">+ İlk Kelimeni Ekle</button>
        </div>
      `;
      document.getElementById('btn-empty-add-word')?.addEventListener('click', () => {
        document.getElementById('add-modal')?.classList.add('active');
      });
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Eşleşen kelime bulunamadı</div>
          <p class="empty-state-desc">Arama terimini veya filtreyi değiştirebilirsin.</p>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = filtered.map(item => {
    const cat = state.categories.find(c => c.id === item.category) || { name: 'Genel' };
    const clicks = item.clickCount || 0;

    let statusText = 'Öğreniliyor';
    let statusClass = '';
    if (item.status === 'hard') {
      statusText = 'Zorlanıyorum';
      statusClass = 'hard-active';
    } else if (item.status === 'mastered') {
      statusText = 'Öğrendim';
      statusClass = 'mastered-active';
    }

    return `
      <div class="word-card ${item.status || 'learning'}" data-id="${item.id}">
        <div class="card-top">
          <h3 class="word-name">${escapeHtml(item.word)}</h3>
          <div class="card-badges">
            <span class="category-tag">${cat.name}</span>
            <button class="btn-edit" data-action="edit-word" data-id="${item.id}" title="Kelimeyi Düzenle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Düzenle
            </button>
            <button class="btn-delete" data-action="delete-word" data-id="${item.id}" title="Kelimeyi Sil">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Sil
            </button>
          </div>
        </div>

        ${item.notes ? `<div class="word-notes">${escapeHtml(item.notes)}</div>` : ''}

        <div class="card-footer">
          <span class="click-counter">
            ${clicks} kez bakıldı
          </span>

          <div class="card-actions">
            <button class="btn-status-toggle ${statusClass}" data-action="toggle-status" data-id="${item.id}">
              ${statusText}
            </button>
            ${item.ytUrl ? `
              <button class="btn-play-video" data-action="play-video" data-id="${item.id}">
                İzle
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Dinleyiciler
  container.querySelectorAll('[data-action="play-video"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.words.find(w => w.id === id);
      if (item) openVideoBottomSheet(item, 'word');
    });
  });

  container.querySelectorAll('[data-action="edit-word"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.words.find(w => w.id === id);
      if (!item) return;

      if (!state.currentUser) {
        openAuthModal('login', 'Kelimeleri düzenlemek ve yenilerini eklemek için lütfen ücretsiz üye olun veya giriş yapın.');
        return;
      }
      openEditWordModal(item);
    });
  });

  container.querySelectorAll('[data-action="toggle-status"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      toggleWordStatus(id);
    });
  });

  container.querySelectorAll('[data-action="delete-word"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.words.find(w => w.id === id);
      if (!item) return;

      if (!state.currentUser) {
        openAuthModal('login', 'Kelimeleri silmek ve düzenlemek için lütfen ücretsiz üye olun veya giriş yapın.');
        return;
      }

      const name = `"${item.word}"`;
      showConfirmDialog('Kelimeyi Sil', `${name} kelimesini silmek istediğinize emin misiniz?`, async () => {
        try {
          await supabase.from('words').delete().eq('id', id);
        } catch (err) {
          console.warn('DB silme hatası:', err);
        }
        state.words = state.words.filter(w => w.id !== id);
        saveState();
        renderFilterChips();
        renderWordsList();
        renderTopForgottenList();
        loadRandomFlashcard();
        showToast('Kelime başarıyla silindi.');
      });
    });
  });
}

function toggleWordStatus(wordId) {
  const word = state.words.find(w => w.id === wordId);
  if (!word) return;

  if (word.status === 'learning') {
    word.status = 'hard';
  } else if (word.status === 'hard') {
    word.status = 'mastered';
  } else {
    word.status = 'learning';
  }

  saveState();
  syncWordProgress(word);
  renderWordsList();
  renderTopForgottenList();
}

// Kelime Etiketini Sözlükte Bul (Türkçe Harf, Büyük/Küçük ve Parçalı Eşleşme)
function findWordByTag(tag) {
  if (!tag) return null;
  const cleanTag = tag.trim().toLocaleLowerCase('tr-TR');

  // 1. Birebir Tam Eşleşme
  let found = state.words.find(w => w.word.toLocaleLowerCase('tr-TR') === cleanTag);
  if (found) return found;

  // 2. Çift / Çizgili Kelimeler (Örn: "Var - Yok" -> "Var" veya "Yok", "Evli - Eş" -> "Evli" veya "Eş")
  found = state.words.find(w => {
    const parts = w.word.toLocaleLowerCase('tr-TR').split(/[\s\-\/–,]+/).map(p => p.trim());
    return parts.includes(cleanTag);
  });
  if (found) return found;

  // 3. Başlangıç veya Kapsama Eşleşmesi (Örn: "Görmek" -> "Bakmak - Görmek")
  found = state.words.find(w => {
    const wLower = w.word.toLocaleLowerCase('tr-TR');
    return wLower.includes(cleanTag) || cleanTag.includes(wLower);
  });
  return found || null;
}

// Cümleler Listesini Çiz
function renderSentencesList() {
  const container = document.getElementById('sentences-cards-container');
  if (!container) return;

  let filtered = [...state.sentences];

  if (state.sentenceSearchQuery.trim() !== '') {
    const q = state.sentenceSearchQuery.toLowerCase().trim();
    filtered = filtered.filter(s => 
      s.turkish.toLowerCase().includes(q) ||
      (s.tidOrder && s.tidOrder.some(t => t.toLowerCase().includes(q))) ||
      (s.notes && s.notes.toLowerCase().includes(q))
    );
  }

  if (filtered.length === 0) {
    if (state.sentences.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Henüz cümle eklenmedi</div>
          <p class="empty-state-desc">Öğrendiğin cümle kalıplarını ve TİD kelime dizilimini buraya kaydedebilirsin.</p>
          <button class="btn-empty-add" id="btn-empty-add-sentence">+ İlk Cümleni Ekle</button>
        </div>
      `;
      document.getElementById('btn-empty-add-sentence')?.addEventListener('click', () => {
        const addModal = document.getElementById('add-modal');
        const tabSentenceBtn = document.getElementById('modal-tab-sentence');
        tabSentenceBtn?.click();
        addModal?.classList.add('active');
      });
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-title">Eşleşen cümle bulunamadı</div>
          <p class="empty-state-desc">Arama terimini değiştirebilirsin.</p>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = filtered.map(item => {
    const cat = state.categories.find(c => c.id === item.category) || { name: 'Genel' };
    const tidTagsHtml = (item.tidOrder || []).map(tag => {
      const matched = findWordByTag(tag);
      const hasMedia = Boolean(matched && matched.ytUrl);
      const titleText = matched
        ? (hasMedia ? `${matched.word} (GIF izlemek için tıkla)` : `${matched.word} (Görsel eklenmemiş)`)
        : `${tag} (Sözlükte henüz kayıtlı değil)`;

      return `
        <button type="button" class="tid-tag ${hasMedia ? 'has-media' : 'no-media'}" 
          data-action="inspect-tag" data-tag="${escapeHtml(tag)}" title="${escapeHtml(titleText)}">
          ${hasMedia ? `<svg class="tag-play-icon" width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>` : ''}
          ${escapeHtml(tag)}
        </button>
      `;
    }).join('');

    return `
      <div class="sentence-card" data-id="${item.id}">
        <div class="card-top">
          <h3 class="sentence-turkish">${escapeHtml(item.turkish)}</h3>
          <div class="card-badges">
            <span class="category-tag">${cat.name}</span>
            <button class="btn-edit" data-action="edit-sentence" data-id="${item.id}" title="Cümleyi Düzenle">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Düzenle
            </button>
            <button class="btn-delete" data-action="delete-sentence" data-id="${item.id}" title="Cümleyi Sil">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              Sil
            </button>
          </div>
        </div>

        <div class="tid-order-row">
          <div class="tid-order-label">İşaret Dili Sırası:</div>
          <button type="button" class="btn-flow-play" data-action="play-flow" data-id="${item.id}" title="Bu cümlenin tüm işaretlerini sırayla oynat">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Akışı Oynat
          </button>
        </div>

        <div class="tid-sequence-tags">
          ${tidTagsHtml}
        </div>

        ${item.notes ? `<div class="word-notes">${escapeHtml(item.notes)}</div>` : ''}

        <div class="card-footer">
          <span class="click-counter">
            ${item.clickCount || 0} kez bakıldı
          </span>
          ${item.ytUrl ? `
            <button class="btn-play-video" data-action="play-sentence" data-id="${item.id}">
              İzle
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Kelime Etiketine Tıklama Dinleyicisi
  container.querySelectorAll('[data-action="inspect-tag"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = btn.getAttribute('data-tag');
      const matched = findWordByTag(tag);
      if (matched && matched.ytUrl) {
        openVideoBottomSheet(matched, 'word');
      } else if (matched) {
        showToast(`"${matched.word}" kayıtlı ancak henüz GIF/video eklenmemiş.`);
      } else {
        showToast(`"${tag}" kelimesi henüz sözlüğe eklenmemiş.`);
      }
    });
  });

  // Sırayla Oynat (Akış) Butonu Dinleyicisi
  container.querySelectorAll('[data-action="play-flow"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.sentences.find(s => s.id === id);
      if (item) openSentenceFlowModal(item);
    });
  });

  container.querySelectorAll('[data-action="play-sentence"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.sentences.find(s => s.id === id);
      if (item) openVideoBottomSheet(item, 'sentence');
    });
  });

  container.querySelectorAll('[data-action="edit-sentence"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.sentences.find(s => s.id === id);
      if (item) openEditSentenceModal(item);
    });
  });

  container.querySelectorAll('[data-action="delete-sentence"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      const item = state.sentences.find(s => s.id === id);
      const name = item ? `"${item.turkish}"` : 'Bu';
      showConfirmDialog('Cümleyi Sil', `${name} cümlesini silmek istediğinize emin misiniz?`, () => {
        state.sentences = state.sentences.filter(s => s.id !== id);
        saveState();
        renderSentencesList();
      });
    });
  });
}

// Video Bottom Sheet
function openVideoBottomSheet(item, type = 'word') {
  state.activeVideoItem = { item, type };
  const overlay = document.getElementById('video-bottom-sheet');
  const titleEl = document.getElementById('video-sheet-title');
  const badgeEl = document.getElementById('video-sheet-badge');
  const notesEl = document.getElementById('video-sheet-notes');
  const iframeEl = document.getElementById('video-iframe');
  const imgEl = document.getElementById('media-image');
  const extBtn = document.getElementById('btn-open-youtube-direct');
  const masterBtn = document.getElementById('btn-sheet-toggle-mastered');

  if (!overlay) return;

  titleEl.textContent = type === 'word' ? item.word : item.turkish;
  const cat = state.categories.find(c => c.id === item.category);
  badgeEl.textContent = cat ? cat.name : 'Genel';
  notesEl.textContent = item.notes || 'Not eklenmemiş.';

  item.clickCount = (item.clickCount || 0) + 1;
  saveState();
  if (type === 'word') {
    syncWordProgress(item);
    renderWordsList();
    renderTopForgottenList();
  } else {
    renderSentencesList();
  }

  const isImageUrl = item.ytUrl && (
    item.ytUrl.match(/\.(gif|png|jpe?g|webp)($|\?)/i) ||
    item.ytUrl.includes('isaretce.com')
  );

  if (isImageUrl) {
    if (iframeEl) {
      iframeEl.src = '';
      iframeEl.style.display = 'none';
    }
    if (imgEl) {
      imgEl.src = item.ytUrl;
      imgEl.style.display = 'block';
    }
    if (extBtn) {
      extBtn.href = item.ytUrl;
      extBtn.textContent = 'Görseli / GIF\'i Aç';
      extBtn.style.display = 'inline-flex';
    }
  } else {
    if (imgEl) {
      imgEl.src = '';
      imgEl.style.display = 'none';
    }
    const embedUrl = parseYouTubeUrl(item.ytUrl);
    if (embedUrl) {
      if (iframeEl) {
        iframeEl.src = embedUrl;
        iframeEl.style.display = 'block';
      }
      if (extBtn) {
        extBtn.href = item.ytUrl;
        extBtn.textContent = "YouTube'da Aç";
        extBtn.style.display = 'inline-flex';
      }
    } else {
      if (iframeEl) {
        iframeEl.src = '';
        iframeEl.style.display = 'none';
      }
      if (extBtn) extBtn.style.display = 'none';
    }
  }

  if (type === 'word') {
    masterBtn.style.display = 'inline-block';
    masterBtn.textContent = item.status === 'mastered' ? 'Öğrenildi' : 'Öğrendim Olarak İşaretle';
    masterBtn.onclick = () => {
      item.status = item.status === 'mastered' ? 'learning' : 'mastered';
      saveState();
      syncWordProgress(item);
      renderWordsList();
      masterBtn.textContent = item.status === 'mastered' ? 'Öğrenildi' : 'Öğrendim Olarak İşaretle';
    };
  } else {
    masterBtn.style.display = 'none';
  }

  overlay.classList.add('active');
}

function closeVideoBottomSheet() {
  const overlay = document.getElementById('video-bottom-sheet');
  const iframeEl = document.getElementById('video-iframe');
  const imgEl = document.getElementById('media-image');
  if (overlay) overlay.classList.remove('active');
  if (iframeEl) iframeEl.src = '';
  if (imgEl) {
    imgEl.src = '';
    imgEl.style.display = 'none';
  }
}

// ==========================================
// Cümle Akış Oynatıcı (Sequence Player)
// ==========================================
let flowState = {
  sentence: null,
  items: [],
  currentIndex: 0,
  isPlaying: true,
  progressInterval: null,
  stepDuration: 2800
};

function openSentenceFlowModal(sentence) {
  if (!sentence || !sentence.tidOrder || sentence.tidOrder.length === 0) {
    showToast('Bu cümlenin işaret sırası bulunmuyor.');
    return;
  }

  flowState.sentence = sentence;
  flowState.items = sentence.tidOrder.map(tag => {
    const wordItem = findWordByTag(tag);
    const hasMedia = Boolean(wordItem && wordItem.ytUrl);
    return { tag, wordItem, hasMedia };
  });

  flowState.currentIndex = 0;
  flowState.isPlaying = true;

  const modal = document.getElementById('sentence-flow-modal');
  const titleEl = document.getElementById('flow-modal-title');
  if (titleEl) titleEl.textContent = sentence.turkish;

  modal?.classList.add('active');
  renderFlowStep();
  startFlowTimer();
}

function closeSentenceFlowModal() {
  stopFlowTimer();
  const modal = document.getElementById('sentence-flow-modal');
  modal?.classList.remove('active');

  const imgEl = document.getElementById('flow-media-img');
  const iframeEl = document.getElementById('flow-media-iframe');
  if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
  if (iframeEl) { iframeEl.src = ''; iframeEl.style.display = 'none'; }
}

function renderFlowStep() {
  if (!flowState.items || flowState.items.length === 0) return;
  const current = flowState.items[flowState.currentIndex];
  if (!current) return;

  // 1. Adım Hapları
  const stepsStrip = document.getElementById('flow-steps-strip');
  if (stepsStrip) {
    stepsStrip.innerHTML = flowState.items.map((item, idx) => {
      const isActive = (idx === flowState.currentIndex);
      const activeClass = isActive ? 'active' : '';
      const mediaClass = item.hasMedia ? 'has-media' : '';
      return `
        <button type="button" class="flow-step-pill ${activeClass} ${mediaClass}" data-step-idx="${idx}">
          ${idx + 1}. ${escapeHtml(item.tag)}
        </button>
      `;
    }).join('');

    stepsStrip.querySelectorAll('.flow-step-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-step-idx'), 10);
        jumpToFlowStep(idx);
      });
    });

    const activePill = stepsStrip.querySelector('.flow-step-pill.active');
    activePill?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }

  // 2. Metin Bilgileri
  const counterEl = document.getElementById('flow-current-counter');
  const wordTitleEl = document.getElementById('flow-current-word-title');
  const notesEl = document.getElementById('flow-current-notes');

  if (counterEl) counterEl.textContent = `${flowState.currentIndex + 1} / ${flowState.items.length}`;
  if (wordTitleEl) wordTitleEl.textContent = current.wordItem ? current.wordItem.word : current.tag;
  if (notesEl) {
    notesEl.textContent = current.wordItem?.notes
      ? current.wordItem.notes
      : (current.hasMedia ? 'TİD İşareti' : 'Bu kelime için henüz not veya GIF eklenmemiş.');
  }

  // 3. Medya Ekranı (GIF / Video)
  const imgEl = document.getElementById('flow-media-img');
  const iframeEl = document.getElementById('flow-media-iframe');
  const fallbackEl = document.getElementById('flow-media-fallback');
  const fallbackWord = document.getElementById('flow-fallback-word');

  if (current.hasMedia) {
    if (fallbackEl) fallbackEl.style.display = 'none';
    const ytUrl = current.wordItem.ytUrl;
    const isImage = ytUrl.match(/\.(gif|png|jpe?g|webp)($|\?)/i) || ytUrl.includes('isaretce.com');

    if (isImage) {
      if (iframeEl) { iframeEl.src = ''; iframeEl.style.display = 'none'; }
      if (imgEl) {
        imgEl.src = ytUrl;
        imgEl.style.display = 'block';
      }
    } else {
      if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
      const embedUrl = parseYouTubeUrl(ytUrl);
      if (embedUrl && iframeEl) {
        iframeEl.src = embedUrl;
        iframeEl.style.display = 'block';
      }
    }
  } else {
    if (imgEl) { imgEl.src = ''; imgEl.style.display = 'none'; }
    if (iframeEl) { iframeEl.src = ''; iframeEl.style.display = 'none'; }
    if (fallbackEl) {
      if (fallbackWord) fallbackWord.textContent = current.tag;
      fallbackEl.style.display = 'flex';
    }
  }

  // 4. Önceki butonu
  const prevBtn = document.getElementById('btn-flow-prev');
  if (prevBtn) prevBtn.disabled = (flowState.currentIndex === 0);

  updateFlowPlayPauseButton();
}

function updateFlowPlayPauseButton() {
  const pauseIcon = document.getElementById('icon-flow-pause');
  const playIcon = document.getElementById('icon-flow-play');
  const textEl = document.getElementById('text-flow-play-pause');

  if (flowState.isPlaying) {
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (playIcon) playIcon.style.display = 'none';
    if (textEl) textEl.textContent = 'Duraklat';
  } else {
    if (pauseIcon) pauseIcon.style.display = 'none';
    if (playIcon) playIcon.style.display = 'block';
    if (textEl) textEl.textContent = 'Oynat';
  }
}

function startFlowTimer() {
  stopFlowTimer();
  if (!flowState.isPlaying) return;

  const progressBar = document.getElementById('flow-progress-bar');
  const startTime = Date.now();
  const duration = flowState.stepDuration;

  flowState.progressInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const pct = Math.min(100, (elapsed / duration) * 100);
    if (progressBar) progressBar.style.width = pct + '%';

    if (elapsed >= duration) {
      clearInterval(flowState.progressInterval);
      flowState.progressInterval = null;
      nextFlowStep();
    }
  }, 40);
}

function stopFlowTimer() {
  if (flowState.progressInterval) {
    clearInterval(flowState.progressInterval);
    flowState.progressInterval = null;
  }
  const progressBar = document.getElementById('flow-progress-bar');
  if (progressBar) progressBar.style.width = '0%';
}

function nextFlowStep() {
  if (flowState.currentIndex < flowState.items.length - 1) {
    flowState.currentIndex++;
    renderFlowStep();
    if (flowState.isPlaying) startFlowTimer();
  } else {
    flowState.currentIndex = 0;
    renderFlowStep();
    if (flowState.isPlaying) {
      showToast('Cümle akışı tamamlandı (başa sarıldı).');
      startFlowTimer();
    }
  }
}

function prevFlowStep() {
  if (flowState.currentIndex > 0) {
    flowState.currentIndex--;
    renderFlowStep();
    if (flowState.isPlaying) startFlowTimer();
  }
}

function jumpToFlowStep(idx) {
  if (idx >= 0 && idx < flowState.items.length) {
    flowState.currentIndex = idx;
    renderFlowStep();
    if (flowState.isPlaying) startFlowTimer();
  }
}

function toggleFlowPlayPause() {
  flowState.isPlaying = !flowState.isPlaying;
  updateFlowPlayPauseButton();
  if (flowState.isPlaying) {
    startFlowTimer();
  } else {
    stopFlowTimer();
  }
}

// Flashcard / Pratik
function loadRandomFlashcard() {
  const catEl = document.getElementById('fc-category');
  const wordEl = document.getElementById('fc-word');
  const hintEl = document.getElementById('fc-hint');
  const poolCountEl = document.getElementById('fc-pool-count');
  const watchBtn = document.getElementById('btn-fc-watch');

  let pool = [...state.words];

  // Kategori Filtresi
  if (state.practiceCategory && state.practiceCategory !== 'all') {
    pool = pool.filter(w => w.category === state.practiceCategory);
  }

  if (pool.length === 0) {
    if (catEl) catEl.textContent = '-';
    if (wordEl) wordEl.textContent = 'Kelime Bulunamadı';
    if (hintEl) hintEl.textContent = 'Seçilen filtre kriterlerine uygun kelime bulunmuyor.';
    if (poolCountEl) poolCountEl.textContent = '0 kelime';
    if (watchBtn) watchBtn.style.opacity = '0.5';
    state.currentFlashcard = null;
    return;
  }

  if (poolCountEl) {
    const isFiltered = (state.practiceCategory !== 'all');
    poolCountEl.textContent = isFiltered ? `Havuz: ${pool.length} kelime` : `Tüm Havuz: ${pool.length} kelime`;
  }

  // Zorlanılan kelimelere hafif öncelik ver (%35 şansla)
  const hardWords = pool.filter(w => w.status === 'hard' || (w.clickCount || 0) >= 3);
  const selectedPool = (hardWords.length > 0 && Math.random() < 0.35) ? hardWords : pool;

  // Önceki kelimeyle ardışık aynı olmasını önle
  let nextWord;
  if (selectedPool.length > 1 && state.currentFlashcard) {
    const candidates = selectedPool.filter(w => w.id !== state.currentFlashcard.id);
    nextWord = candidates[Math.floor(Math.random() * candidates.length)] || selectedPool[0];
  } else {
    nextWord = selectedPool[Math.floor(Math.random() * selectedPool.length)];
  }

  state.currentFlashcard = nextWord;

  const cat = state.categories.find(c => c.id === nextWord.category);
  if (catEl) catEl.textContent = cat ? cat.name : 'Genel';
  if (wordEl) wordEl.textContent = nextWord.word;
  if (hintEl) {
    hintEl.textContent = nextWord.notes ? `İpucu: ${nextWord.notes}` : 'İşaretini hatırla, videoyla kontrol et.';
  }

  if (watchBtn) {
    if (nextWord.ytUrl) {
      watchBtn.style.opacity = '1';
      watchBtn.innerHTML = (nextWord.ytUrl.match(/\.(gif|png|jpe?g|webp)($|\?)/i) || nextWord.ytUrl.includes('isaretce.com'))
        ? '🖼 GIF Gör'
        : '▶ Videoyu İzle';
    } else {
      watchBtn.style.opacity = '0.5';
      watchBtn.innerHTML = '▶ Medya Yok';
    }
  }
}

// Rastgele Cümle / Akış Üreteci
function generateRandomSentence() {
  const container = document.getElementById('generated-words-sequence');
  const quoteEl = document.getElementById('generated-sentence-quote');
  const poolCountEl = document.getElementById('gen-pool-count');

  if (!container || !quoteEl) return;

  let pool = [...state.words];

  if (state.genCategory && state.genCategory !== 'all') {
    pool = pool.filter(w => w.category === state.genCategory);
  }

  if (poolCountEl) {
    const isFiltered = (state.genCategory !== 'all');
    poolCountEl.textContent = isFiltered ? `Havuz: ${pool.length} kelime` : `Tüm Havuz: ${pool.length} kelime`;
  }

  const requestedLen = state.genSentenceLength || 3;

  if (pool.length < 2) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:13px; padding: 12px 0;">Seçilen filtrede cümle kuracak yeterli kelime bulunmuyor.</p>';
    quoteEl.textContent = '...';
    state.currentGeneratedSentence = [];
    return;
  }

  const actualLen = Math.min(requestedLen, pool.length);

  // Havuzdan rastgele N farklı kelime seç (Fisher-Yates)
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selectedWords = shuffled.slice(0, actualLen);
  state.currentGeneratedSentence = selectedWords;

  // Çipler olarak çiz
  container.innerHTML = selectedWords.map((word, idx) => {
    const isLast = idx === selectedWords.length - 1;
    const hasMedia = Boolean(word.ytUrl);

    return `
      <div class="gen-word-chip" data-id="${word.id}" title="${hasMedia ? 'Görseli / Videoyu Aç' : 'Detay'}">
        <span class="gen-word-order">${idx + 1}</span>
        <span class="gen-word-text">${escapeHtml(word.word)}</span>
        ${hasMedia ? '<span class="gen-word-media-indicator" title="Medyası var">🎬</span>' : ''}
      </div>
      ${!isLast ? '<span class="gen-sequence-arrow">→</span>' : ''}
    `;
  }).join('');

  // Tıklanan kelimenin videosunu/GIF'ini aç
  container.querySelectorAll('.gen-word-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const id = chip.getAttribute('data-id');
      const item = state.words.find(w => w.id === id);
      if (item) {
        if (item.ytUrl) {
          openVideoBottomSheet(item, 'word');
        } else {
          alert(`"${item.word}" için henüz video veya GIF linki eklenmemiş.`);
        }
      }
    });
  });

  // Cümle metni
  quoteEl.textContent = `"${selectedWords.map(w => w.word).join(' ')}"`;
}

function renderTopForgottenList() {
  const container = document.getElementById('top-forgotten-list');
  if (!container) return;

  const sorted = [...state.words]
    .filter(w => (w.clickCount || 0) > 0)
    .sort((a, b) => (b.clickCount || 0) - (a.clickCount || 0))
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = '<p class="empty-state-desc" style="font-size:12px; color:#94a3b8;">Henüz video izleme kaydı yok.</p>';
    return;
  }

  container.innerHTML = sorted.map((w, index) => {
    return `
      <div class="top-item-row" data-id="${w.id}">
        <div class="top-item-info">
          <span class="top-rank">#${index + 1}</span>
          <span class="top-word-title">${escapeHtml(w.word)}</span>
        </div>
        <span class="top-clicks-badge">${w.clickCount || 0} kez</span>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.top-item-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.getAttribute('data-id');
      const item = state.words.find(w => w.id === id);
      if (item && item.ytUrl) openVideoBottomSheet(item, 'word');
    });
  });
}

// Kategori Yönetimi Durumu
let editingCategoryId = null;

function saveCategoryEdit(catId) {
  const input = document.getElementById(`input-edit-cat-${catId}`);
  if (!input) return;
  const newName = input.value.trim();
  if (!newName) {
    showToast('Kategori adı boş bırakılamaz.');
    return;
  }

  const existingDuplicate = state.categories.find(c => c.id !== catId && c.name.toLowerCase() === newName.toLowerCase());
  if (existingDuplicate) {
    showToast('Bu isimde başka bir kategori zaten var.');
    return;
  }

  const cat = state.categories.find(c => c.id === catId);
  if (cat) {
    if (!state.currentUser) {
      editingCategoryId = null;
      renderManageCategoriesList();
      openAuthModal('login', 'Kategorileri düzenlemek için lütfen ücretsiz üye olun veya giriş yapın.');
      return;
    }

    cat.name = newName;
    saveState();
    try {
      supabase.from('categories').update({ name: newName }).eq('id', catId);
    } catch (e) {}
    editingCategoryId = null;
    renderFilterChips();
    renderWordsList();
    renderSentencesList();
    populateCategorySelects();
    renderManageCategoriesList();
    showToast('Kategori adı güncellendi.');
  }
}

// Kategori Yönetimi Listesini Çiz (Düzenle & Sil)
function renderManageCategoriesList() {
  const container = document.getElementById('manage-categories-list');
  if (!container) return;

  if (state.categories.length === 0) {
    container.innerHTML = '<p style="font-size:12px; color:var(--text-muted); padding: 8px 0;">Kayıtlı kategori bulunmuyor.</p>';
    return;
  }

  container.innerHTML = state.categories.map(cat => {
    const wordCount = state.words.filter(w => w.category === cat.id).length;
    const isEditing = editingCategoryId === cat.id;

    if (isEditing) {
      return `
        <div class="manage-cat-item is-editing" data-id="${cat.id}">
          <div class="manage-cat-edit-form">
            <span style="color: ${cat.color || '#475569'}; font-size: 16px;">●</span>
            <input type="text" class="input-edit-cat" id="input-edit-cat-${cat.id}" value="${escapeHtml(cat.name)}" placeholder="Kategori adı..." maxlength="40" />
            <div class="manage-cat-actions">
              <button type="button" class="btn-icon-action save" data-action="save-cat-edit" data-id="${cat.id}">Kaydet</button>
              <button type="button" class="btn-icon-action cancel" data-action="cancel-cat-edit" data-id="${cat.id}">Vazgeç</button>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="manage-cat-item" data-id="${cat.id}">
        <div class="manage-cat-info">
          <span style="color: ${cat.color || '#475569'}; font-size: 16px;">●</span>
          <span class="manage-cat-name-display" id="cat-name-${cat.id}">${escapeHtml(cat.name)}</span>
          <span class="manage-cat-count">${wordCount} kelime</span>
        </div>
        <div class="manage-cat-actions">
          <button type="button" class="btn-icon-action" data-action="edit-cat" data-id="${cat.id}" title="Yeniden Adlandır">
            Düzenle
          </button>
          ${cat.id !== 'diger' ? `
            <button type="button" class="btn-icon-action danger" data-action="delete-cat" data-id="${cat.id}" title="Kategoriyi Sil">
              Sil
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');

  // Düzenleme modundaysa inputa odaklan
  if (editingCategoryId) {
    const editInput = document.getElementById(`input-edit-cat-${editingCategoryId}`);
    if (editInput) {
      editInput.focus();
      editInput.select();
      editInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          saveCategoryEdit(editingCategoryId);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          editingCategoryId = null;
          renderManageCategoriesList();
        }
      });
    }
  }

  // Düzenle butonu
  container.querySelectorAll('[data-action="edit-cat"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cat = state.categories.find(c => c.id === id);
      if (!cat) return;

      if (!state.currentUser) {
        openAuthModal('login', 'Kategorileri düzenlemek için lütfen ücretsiz üye olun veya giriş yapın.');
        return;
      }
      editingCategoryId = id;
      renderManageCategoriesList();
    });
  });

  // Kaydet butonu
  container.querySelectorAll('[data-action="save-cat-edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      saveCategoryEdit(id);
    });
  });

  // Vazgeç butonu
  container.querySelectorAll('[data-action="cancel-cat-edit"]').forEach(btn => {
    btn.addEventListener('click', () => {
      editingCategoryId = null;
      renderManageCategoriesList();
    });
  });

  // Sil butonu
  container.querySelectorAll('[data-action="delete-cat"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cat = state.categories.find(c => c.id === id);
      if (!cat) return;

      if (!state.currentUser) {
        openAuthModal('login', 'Kategorileri silmek için lütfen ücretsiz üye olun veya giriş yapın.');
        return;
      }

      const wordCount = state.words.filter(w => w.category === id).length;
      const note = wordCount > 0 
        ? `Bu kategorideki ${wordCount} kelime silinmeyecek, otomatik olarak "Genel" kategorisine aktarılacaktır.` 
        : '';

      showConfirmDialog('Kategoriyi Sil', `"${cat.name}" kategorisini silmek istediğinize emin misiniz? ${note}`, async () => {
        try {
          await supabase.from('categories').delete().eq('id', id);
        } catch (e) {}

        state.words.forEach(w => {
          if (w.category === id) w.category = 'diger';
        });
        state.sentences.forEach(s => {
          if (s.category === id) s.category = 'diger';
        });

        state.categories = state.categories.filter(c => c.id !== id);
        if (state.activeCategory === id) {
          state.activeCategory = 'all';
        }

        saveState();
        renderFilterChips();
        renderWordsList();
        renderSentencesList();
        populateCategorySelects();
        renderManageCategoriesList();
        showToast('Kategori silindi.');
      });
    });
  });
}

// ==================== AUTH & HESAP YÖNETİMİ ====================
function updateAuthUI() {
  const btnAuth = document.getElementById('btn-auth');
  const authStatusText = document.getElementById('auth-status-text');
  const profileEmail = document.getElementById('profile-user-email');

  if (state.currentUser) {
    const email = state.currentUser.email || 'Üye';
    const shortEmail = email.length > 14 ? email.substring(0, 11) + '...' : email;
    if (authStatusText) authStatusText.innerHTML = `<span class="auth-user-email">${escapeHtml(shortEmail)}</span>`;
    btnAuth?.classList.add('logged-in');
    btnAuth?.setAttribute('title', `${email} (Hesap Menüsü)`);
    if (profileEmail) profileEmail.textContent = email;
  } else {
    if (authStatusText) authStatusText.textContent = 'Giriş Yap';
    btnAuth?.classList.remove('logged-in');
    btnAuth?.setAttribute('title', 'Giriş Yap / Üye Ol (0 TL)');
    if (profileEmail) profileEmail.textContent = '';
  }
}

function openAuthModal(defaultTab = 'login', customSubtext = null) {
  const modal = document.getElementById('auth-modal');
  const title = document.getElementById('auth-modal-title');
  const subtext = document.getElementById('auth-subtext');
  const msg = document.getElementById('auth-message');
  const tabLogin = document.getElementById('tab-login-btn');
  const tabRegister = document.getElementById('tab-register-btn');
  const submitBtn = document.getElementById('btn-submit-auth');

  state.authTab = defaultTab;
  if (msg) {
    msg.style.display = 'none';
    msg.textContent = '';
  }

  if (customSubtext && subtext) {
    subtext.textContent = customSubtext;
  } else if (subtext) {
    subtext.textContent = 'Giriş yaptığınızda özel kelimeleriniz ve izleme istatistikleriniz bulutta güvenle saklanır.';
  }

  if (defaultTab === 'register') {
    tabRegister?.classList.add('active');
    tabLogin?.classList.remove('active');
    if (title) title.textContent = 'Ücretsiz Kayıt Ol';
    if (submitBtn) submitBtn.textContent = 'Kayıt Ol';
  } else {
    tabLogin?.classList.add('active');
    tabRegister?.classList.remove('active');
    if (title) title.textContent = 'Giriş Yap';
    if (submitBtn) submitBtn.textContent = 'Giriş Yap';
  }

  modal?.classList.add('active');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal?.classList.remove('active');
  const form = document.getElementById('form-auth');
  form?.reset();
  const msg = document.getElementById('auth-message');
  if (msg) msg.style.display = 'none';
  const btnGoogleText = document.getElementById('btn-google-text');
  if (btnGoogleText) btnGoogleText.textContent = 'Google ile Devam Et';
}

function openProfileModal() {
  const modal = document.getElementById('profile-modal');
  const emailEl = document.getElementById('profile-user-email');
  if (emailEl) emailEl.textContent = state.currentUser?.email || '';
  modal?.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  modal?.classList.remove('active');
}

// Modallar
function initModals() {
  const addModal = document.getElementById('add-modal');
  const btnFabAdd = document.getElementById('btn-fab-add');
  const closeAddModal = document.getElementById('close-add-modal');
  const tabWordBtn = document.getElementById('modal-tab-word');
  const tabSentenceBtn = document.getElementById('modal-tab-sentence');
  const tabCatBtn = document.getElementById('modal-tab-category');
  const formWord = document.getElementById('form-add-word');
  const formSentence = document.getElementById('form-add-sentence');
  const formCat = document.getElementById('form-add-category');
  const btnCancelWord = document.getElementById('btn-cancel-word');
  const btnCancelSentence = document.getElementById('btn-cancel-sentence');
  const btnCancelCat = document.getElementById('btn-cancel-category');

  // Auth Modalı Elemanları
  const btnAuth = document.getElementById('btn-auth');
  const closeAuthModalBtn = document.getElementById('close-auth-modal');
  const btnCancelAuth = document.getElementById('btn-cancel-auth');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegisterBtn = document.getElementById('tab-register-btn');
  const formAuth = document.getElementById('form-auth');
  const btnGoogleAuth = document.getElementById('btn-google-auth');

  // Google ile Giriş Yap / Kayıt Ol
  btnGoogleAuth?.addEventListener('click', async () => {
    const btnText = document.getElementById('btn-google-text');
    const originalText = btnText ? btnText.textContent : 'Google ile Devam Et';
    const msgEl = document.getElementById('auth-message');
    if (msgEl) msgEl.style.display = 'none';

    try {
      if (btnText) btnText.textContent = 'Google\'a yönlendiriliyor...';
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err) {
      console.error('Google Auth Hatası:', err);
      if (btnText) btnText.textContent = originalText;
      if (msgEl) {
        msgEl.className = 'auth-message error';
        msgEl.textContent = 'Google ile bağlantı kurulamadı: ' + (err.message || '');
        msgEl.style.display = 'block';
      }
    }
  });

  // Profil Modalı Elemanları
  const closeProfileModalBtn = document.getElementById('close-profile-modal');
  const btnCloseProfile = document.getElementById('btn-close-profile');
  const btnLogout = document.getElementById('btn-logout');

  // Auth Butonu Tıklaması
  btnAuth?.addEventListener('click', () => {
    if (state.currentUser) {
      openProfileModal();
    } else {
      openAuthModal('login');
    }
  });

  closeAuthModalBtn?.addEventListener('click', closeAuthModal);
  btnCancelAuth?.addEventListener('click', closeAuthModal);
  document.getElementById('auth-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'auth-modal') closeAuthModal();
  });

  tabLoginBtn?.addEventListener('click', () => openAuthModal('login'));
  tabRegisterBtn?.addEventListener('click', () => openAuthModal('register'));

  closeProfileModalBtn?.addEventListener('click', closeProfileModal);
  btnCloseProfile?.addEventListener('click', closeProfileModal);
  document.getElementById('profile-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'profile-modal') closeProfileModal();
  });

  btnLogout?.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      state.currentUser = null;
      updateAuthUI();
      closeProfileModal();
      showToast('Çıkış yapıldı. Misafir modundasınız.');
      await loadDataFromSupabaseOrLocal();
    } catch (err) {
      console.error('Çıkış hatası:', err);
    }
  });

  // Giriş / Kayıt Formu Gönderimi
  formAuth?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('auth-email');
    const passwordInput = document.getElementById('auth-password');
    const submitBtn = document.getElementById('btn-submit-auth');
    const msgEl = document.getElementById('auth-message');

    const email = emailInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!email || !password) return;

    const originalText = submitBtn?.textContent || 'Gönder';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'İşleniyor...';
    }
    if (msgEl) msgEl.style.display = 'none';

    try {
      if (state.authTab === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password
        });
        if (error) throw error;
        showToast('Kayıt başarılı! Hoş geldiniz.');
        closeAuthModal();
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;
        showToast('Giriş başarılı! Hoş geldiniz.');
        closeAuthModal();
      }
    } catch (err) {
      let errText = err.message || 'İşlem başarısız oldu.';
      if (errText.includes('Invalid login credentials')) {
        errText = 'E-posta adresi veya şifre hatalı.';
      } else if (errText.includes('User already registered')) {
        errText = 'Bu e-posta ile kayıtlı bir hesap zaten var.';
      } else if (errText.includes('Password should be at least')) {
        errText = 'Şifre en az 6 karakter olmalıdır.';
      }
      if (msgEl) {
        msgEl.className = 'auth-message error';
        msgEl.textContent = errText;
        msgEl.style.display = 'block';
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
  });

  // Kategori Yönetim Modalı Elemanları
  const categoriesModal = document.getElementById('categories-modal');
  const btnManageCats = document.getElementById('btn-manage-cats');
  const closeCategoriesModal = document.getElementById('close-categories-modal');
  const btnCloseCategoriesModal = document.getElementById('btn-close-categories-modal');
  const formManageAddCategory = document.getElementById('form-manage-add-category');
  const manageNewCatInput = document.getElementById('manage-new-cat-input');

  const openCategoriesModal = () => {
    editingCategoryId = null;
    renderManageCategoriesList();
    if (manageNewCatInput) manageNewCatInput.value = '';
    categoriesModal?.classList.add('active');
  };

  const hideCategoriesModal = () => {
    categoriesModal?.classList.remove('active');
    editingCategoryId = null;
  };

  btnManageCats?.addEventListener('click', openCategoriesModal);
  closeCategoriesModal?.addEventListener('click', hideCategoriesModal);
  btnCloseCategoriesModal?.addEventListener('click', hideCategoriesModal);
  categoriesModal?.addEventListener('click', (e) => {
    if (e.target.id === 'categories-modal') hideCategoriesModal();
  });

  formManageAddCategory?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!manageNewCatInput) return;
    const name = manageNewCatInput.value.trim();
    if (!name) return;

    if (!state.currentUser) {
      hideCategoriesModal();
      openAuthModal('login', 'Özel kategorilerinizi bulutta saklamak için lütfen ücretsiz üye olun veya giriş yapın.');
      return;
    }

    if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      showToast('Bu isimde bir kategori zaten var!');
      return;
    }

    const id = 'cat-u-' + Date.now();
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2', '#475569', '#ca8a04', '#0d9488'];
    const randomColor = colors[state.categories.length % colors.length];

    const newCat = {
      id: id,
      name: name,
      color: randomColor,
      userId: state.currentUser.id
    };

    state.categories.push(newCat);

    try {
      await supabase.from('categories').insert([{
        id: id,
        name: name,
        color: randomColor,
        user_id: state.currentUser.id
      }]);
      showToast('Kategori buluta eklendi!');
    } catch (err) {
      console.error(err);
    }

    saveState();
    renderFilterChips();
    populateCategorySelects();
    renderManageCategoriesList();
    manageNewCatInput.value = '';
  });

  btnFabAdd?.addEventListener('click', () => {
    editingItemId = null;
    editingItemType = null;
    const title = document.getElementById('add-modal-title');
    const submitWordBtn = document.getElementById('btn-submit-word');
    const submitSentenceBtn = document.getElementById('btn-submit-sentence');
    const tabs = document.getElementById('add-modal-tabs');
    if (title) title.textContent = 'Yeni Kayıt Ekle';
    if (submitWordBtn) submitWordBtn.textContent = 'Kaydet';
    if (submitSentenceBtn) submitSentenceBtn.textContent = 'Kaydet';
    if (tabs) tabs.style.display = 'flex';
    formWord?.reset();
    formSentence?.reset();
    formCat?.reset();
    tabWordBtn?.click();
    if (addModal) addModal.classList.add('active');
  });

  const hideAddModal = () => {
    if (addModal) addModal.classList.remove('active');
    formWord?.reset();
    formSentence?.reset();
    formCat?.reset();
    editingItemId = null;
    editingItemType = null;
    const title = document.getElementById('add-modal-title');
    const submitWordBtn = document.getElementById('btn-submit-word');
    const submitSentenceBtn = document.getElementById('btn-submit-sentence');
    const tabs = document.getElementById('add-modal-tabs');
    if (title) title.textContent = 'Yeni Kayıt Ekle';
    if (submitWordBtn) submitWordBtn.textContent = 'Kaydet';
    if (submitSentenceBtn) submitSentenceBtn.textContent = 'Kaydet';
    if (tabs) tabs.style.display = 'flex';
  };

  closeAddModal?.addEventListener('click', hideAddModal);
  btnCancelWord?.addEventListener('click', hideAddModal);
  btnCancelSentence?.addEventListener('click', hideAddModal);
  btnCancelCat?.addEventListener('click', hideAddModal);

  tabWordBtn?.addEventListener('click', () => {
    tabWordBtn.classList.add('active');
    tabSentenceBtn?.classList.remove('active');
    tabCatBtn?.classList.remove('active');
    formWord?.classList.remove('hidden');
    formSentence?.classList.add('hidden');
    formCat?.classList.add('hidden');
  });

  tabSentenceBtn?.addEventListener('click', () => {
    tabSentenceBtn.classList.add('active');
    tabWordBtn?.classList.remove('active');
    tabCatBtn?.classList.remove('active');
    formSentence?.classList.remove('hidden');
    formWord?.classList.add('hidden');
    formCat?.classList.add('hidden');
  });

  tabCatBtn?.addEventListener('click', () => {
    tabCatBtn.classList.add('active');
    tabWordBtn?.classList.remove('active');
    tabSentenceBtn?.classList.remove('active');
    formCat?.classList.remove('hidden');
    formWord?.classList.add('hidden');
    formSentence?.classList.add('hidden');
  });

  // Kelime Kaydet / Güncelle
  formWord?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const wordInput = document.getElementById('word-input');
    const catInput = document.getElementById('word-category');
    const ytInput = document.getElementById('word-yt');
    const notesInput = document.getElementById('word-notes');

    if (editingItemId && editingItemType === 'word') {
      const existing = state.words.find(w => w.id === editingItemId);
      if (existing) {
        if (!state.currentUser) {
          hideAddModal();
          openAuthModal('login', 'Kelimeleri düzenlemek için lütfen ücretsiz üye olun veya giriş yapın.');
          return;
        }

        existing.word = wordInput.value.trim();
        existing.category = catInput.value;
        existing.week = existing.week || 1;
        existing.ytUrl = ytInput.value.trim();
        existing.notes = notesInput.value.trim();

        try {
          await supabase.from('words').update({
            word: existing.word,
            category: existing.category,
            week: existing.week,
            yt_url: existing.ytUrl,
            notes: existing.notes
          }).eq('id', existing.id);
          showToast('Kelime başarıyla güncellendi.');
        } catch (err) {
          console.warn('DB update error:', err);
          showToast('Kelime güncellendi.');
        }
      }
    } else {
      // Yeni Kelime Ekleme (Giriş yapılmış olmalı)
      if (!state.currentUser) {
        hideAddModal();
        openAuthModal('login', 'Özel kelimelerinizi bulutta saklamak ve eklemek için lütfen ücretsiz üye olun veya giriş yapın.');
        return;
      }

      const newId = 'w-u-' + Date.now();
      const newWord = {
        id: newId,
        word: wordInput.value.trim(),
        category: catInput.value,
        week: 1,
        ytUrl: ytInput.value.trim(),
        notes: notesInput.value.trim(),
        userId: state.currentUser.id,
        clickCount: 0,
        status: 'learning'
      };
      state.words.unshift(newWord);

      try {
        await supabase.from('words').insert([{
          id: newId,
          word: newWord.word,
          category: newWord.category,
          week: newWord.week,
          yt_url: newWord.ytUrl,
          notes: newWord.notes,
          user_id: state.currentUser.id
        }]);
        showToast('Kelime buluta başarıyla kaydedildi!');
      } catch (err) {
        showToast('Kelime eklendi, bulut senkronizasyonunda sorun oluştu.');
      }
    }

    saveState();
    renderFilterChips();
    renderWordsList();
    loadRandomFlashcard();
    hideAddModal();
  });

  // Cümle Kaydet / Güncelle
  formSentence?.addEventListener('submit', (e) => {
    e.preventDefault();
    const trInput = document.getElementById('sentence-turkish');
    const tidInput = document.getElementById('sentence-tid');
    const catInput = document.getElementById('sentence-category');
    const ytInput = document.getElementById('sentence-yt');
    const notesInput = document.getElementById('sentence-notes');

    const tidTokens = tidInput.value
      .split(',')
      .map(t => t.trim().toUpperCase())
      .filter(Boolean);

    if (editingItemId && editingItemType === 'sentence') {
      const existing = state.sentences.find(s => s.id === editingItemId);
      if (existing) {
        existing.turkish = trInput.value.trim();
        existing.tidOrder = tidTokens;
        existing.category = catInput.value;
        existing.week = existing.week || 1;
        existing.ytUrl = ytInput.value.trim();
        existing.notes = notesInput.value.trim();
      }
    } else {
      const newSentence = {
        id: 's-' + Date.now(),
        turkish: trInput.value.trim(),
        tidOrder: tidTokens,
        category: catInput.value,
        week: 1,
        ytUrl: ytInput.value.trim(),
        notes: notesInput.value.trim(),
        clickCount: 0
      };
      state.sentences.unshift(newSentence);
    }

    saveState();
    renderSentencesList();
    hideAddModal();
  });

  // Yeni Kategori Kaydet (Hızlı Ekleme Modalı)
  formCat?.addEventListener('submit', (e) => {
    e.preventDefault();
    const catNameInput = document.getElementById('category-name-input');
    const name = catNameInput.value.trim();
    if (!name) return;

    if (state.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
      alert('Bu isimde bir kategori zaten var!');
      return;
    }

    const id = 'cat-' + Date.now();
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2', '#475569', '#ca8a04', '#0d9488'];
    const randomColor = colors[state.categories.length % colors.length];

    const newCat = {
      id: id,
      name: name,
      color: randomColor
    };

    state.categories.push(newCat);
    saveState();
    renderFilterChips();
    populateCategorySelects();
    renderManageCategoriesList();
    hideAddModal();
  });

  // Dışa Aktarma
  const exportModal = document.getElementById('export-modal');
  const btnExport = document.getElementById('btn-export-data');
  const closeExport = document.getElementById('close-export-modal');
  const exportCodeArea = document.getElementById('export-code-area');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnDownloadJson = document.getElementById('btn-download-json');

  btnExport?.addEventListener('click', () => {
    const codeOutput = `// Güncel data.js Dosyanız:\n` +
      `export const initialCategories = ${JSON.stringify(state.categories, null, 2)};\n\n` +
      `export const initialWords = ${JSON.stringify(state.words, null, 2)};\n\n` +
      `export const initialSentences = ${JSON.stringify(state.sentences, null, 2)};\n`;

    if (exportCodeArea) exportCodeArea.value = codeOutput;
    if (exportModal) exportModal.classList.add('active');
  });

  closeExport?.addEventListener('click', () => {
    if (exportModal) exportModal.classList.remove('active');
  });

  btnCopyCode?.addEventListener('click', () => {
    if (!exportCodeArea) return;
    navigator.clipboard.writeText(exportCodeArea.value).then(() => {
      btnCopyCode.textContent = 'Kopyalandı!';
      setTimeout(() => { btnCopyCode.textContent = 'Kodu Kopyala'; }, 2000);
    });
  });

  btnDownloadJson?.addEventListener('click', () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      categories: state.categories,
      words: state.words,
      sentences: state.sentences
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `isaret_dili_yedek_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  document.getElementById('close-video-sheet')?.addEventListener('click', closeVideoBottomSheet);
  document.getElementById('video-bottom-sheet')?.addEventListener('click', (e) => {
    if (e.target.id === 'video-bottom-sheet') closeVideoBottomSheet();
  });

  // Onay Modalı Dinleyicileri
  const confirmModal = document.getElementById('confirm-modal');
  const btnConfirmCancel = document.getElementById('btn-confirm-cancel');
  const btnConfirmOk = document.getElementById('btn-confirm-ok');
  const closeConfirmModal = document.getElementById('close-confirm-modal');

  const closeConfirm = () => {
    confirmModal?.classList.remove('active');
    pendingConfirmCallback = null;
  };

  btnConfirmCancel?.addEventListener('click', closeConfirm);
  closeConfirmModal?.addEventListener('click', closeConfirm);
  confirmModal?.addEventListener('click', (e) => {
    if (e.target.id === 'confirm-modal') closeConfirm();
  });

  btnConfirmOk?.addEventListener('click', () => {
    if (typeof pendingConfirmCallback === 'function') {
      pendingConfirmCallback();
    }
    closeConfirm();
  });

  // Video Penceresi İçindeki Sil Butonu
  const btnSheetDelete = document.getElementById('btn-sheet-delete-item');
  btnSheetDelete?.addEventListener('click', () => {
    if (!state.activeVideoItem) return;
    const { item, type } = state.activeVideoItem;
    const name = type === 'word' ? `"${item.word}" kelimesini` : `"${item.turkish}" cümlesini`;

    showConfirmDialog('Kaydı Sil', `${name} tamamen silmek istediğinize emin misiniz?`, () => {
      if (type === 'word') {
        state.words = state.words.filter(w => w.id !== item.id);
        saveState();
        renderFilterChips();
        renderWordsList();
        renderTopForgottenList();
        loadRandomFlashcard();
      } else {
        state.sentences = state.sentences.filter(s => s.id !== item.id);
        saveState();
        renderSentencesList();
      }
      closeVideoBottomSheet();
    });
  });

  // Video Penceresi İçindeki Düzenle Butonu
  const btnSheetEdit = document.getElementById('btn-sheet-edit-item');
  btnSheetEdit?.addEventListener('click', () => {
    if (!state.activeVideoItem) return;
    const { item, type } = state.activeVideoItem;
    closeVideoBottomSheet();
    if (type === 'word') {
      openEditWordModal(item);
    } else {
      openEditSentenceModal(item);
    }
  });

  // Cümle Akış Oynatıcı (Flow Player) Dinleyicileri
  const closeFlowModalBtn = document.getElementById('close-flow-modal');
  const btnFlowPrev = document.getElementById('btn-flow-prev');
  const btnFlowNext = document.getElementById('btn-flow-next');
  const btnFlowPlayPause = document.getElementById('btn-flow-play-pause');

  closeFlowModalBtn?.addEventListener('click', closeSentenceFlowModal);
  btnFlowPrev?.addEventListener('click', prevFlowStep);
  btnFlowNext?.addEventListener('click', nextFlowStep);
  btnFlowPlayPause?.addEventListener('click', toggleFlowPlayPause);

  document.getElementById('sentence-flow-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'sentence-flow-modal') closeSentenceFlowModal();
  });
}

function initNavigationTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const sections = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.getAttribute('data-tab');
      state.activeTab = targetTab;

      tabs.forEach(t => t.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active'));

      tab.classList.add('active');
      const targetSection = document.getElementById(`section-${targetTab}`);
      if (targetSection) targetSection.classList.add('active');

      if (targetTab === 'practice') {
        populatePracticeFilters();
        loadRandomFlashcard();
        renderTopForgottenList();
      }
    });
  });
}

function initSearchAndFilters() {
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('clear-search');
  const sentenceSearch = document.getElementById('search-sentence-input');

  searchInput?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', state.searchQuery === '');
    }
    renderWordsList();
  });

  clearBtn?.addEventListener('click', () => {
    state.searchQuery = '';
    if (searchInput) searchInput.value = '';
    clearBtn.classList.add('hidden');
    renderWordsList();
  });

  sentenceSearch?.addEventListener('input', (e) => {
    state.sentenceSearchQuery = e.target.value;
    renderSentencesList();
  });

  // Kategori İçi Arama Dinleyicileri
  const btnToggleCatSearch = document.getElementById('btn-toggle-cat-search');
  const catSearchBar = document.getElementById('cat-search-bar');
  const catSearchInput = document.getElementById('cat-search-input');
  const btnClearCatSearch = document.getElementById('btn-clear-cat-search');

  btnToggleCatSearch?.addEventListener('click', () => {
    const isHidden = catSearchBar?.classList.toggle('hidden');
    btnToggleCatSearch.classList.toggle('active', !isHidden);
    if (!isHidden) {
      catSearchInput?.focus();
    } else {
      state.categorySearchQuery = '';
      if (catSearchInput) catSearchInput.value = '';
      renderFilterChips();
    }
  });

  catSearchInput?.addEventListener('input', (e) => {
    state.categorySearchQuery = e.target.value;
    renderFilterChips();
  });

  btnClearCatSearch?.addEventListener('click', () => {
    state.categorySearchQuery = '';
    if (catSearchInput) catSearchInput.value = '';
    catSearchBar?.classList.add('hidden');
    btnToggleCatSearch?.classList.remove('active');
    renderFilterChips();
  });

  document.querySelectorAll('.pill-toggle').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill-toggle').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeSort = pill.getAttribute('data-sort');
      renderWordsList();
    });
  });

  // Pratik / Test Kategori Filtresi
  const practiceCatSelect = document.getElementById('practice-category-select');

  practiceCatSelect?.addEventListener('change', (e) => {
    state.practiceCategory = e.target.value;
    loadRandomFlashcard();
  });

  document.getElementById('btn-fc-check')?.addEventListener('click', () => {
    if (state.currentFlashcard) {
      state.currentFlashcard.status = 'mastered';
      saveState();
      syncWordProgress(state.currentFlashcard);
      renderWordsList();
    }
    loadRandomFlashcard();
  });

  document.getElementById('btn-fc-watch')?.addEventListener('click', () => {
    if (state.currentFlashcard) {
      if (state.currentFlashcard.ytUrl) {
        openVideoBottomSheet(state.currentFlashcard, 'word');
      } else {
        alert(`"${state.currentFlashcard.word}" için henüz video veya GIF linki eklenmemiş. Kelimeler sekmesinden düzenleyerek ekleyebilirsiniz.`);
      }
    }
  });

  document.getElementById('btn-fc-next')?.addEventListener('click', () => {
    loadRandomFlashcard();
  });

  // Pratik Modu Geçişleri (Tek Kelime vs Akıcı Cümle)
  const btnModeWord = document.getElementById('btn-mode-word');
  const btnModeSentence = document.getElementById('btn-mode-sentence');
  const wordContainer = document.getElementById('practice-word-container');
  const sentenceContainer = document.getElementById('practice-sentence-generator-container');

  const setPracticeMode = (mode) => {
    state.practiceMode = mode;
    if (mode === 'word') {
      btnModeWord?.classList.add('active');
      btnModeSentence?.classList.remove('active');
      if (wordContainer) wordContainer.style.display = 'block';
      if (sentenceContainer) sentenceContainer.style.display = 'none';
      loadRandomFlashcard();
    } else {
      btnModeSentence?.classList.add('active');
      btnModeWord?.classList.remove('active');
      if (wordContainer) wordContainer.style.display = 'none';
      if (sentenceContainer) sentenceContainer.style.display = 'block';
      populatePracticeFilters();
      if (!state.currentGeneratedSentence || state.currentGeneratedSentence.length === 0) {
        generateRandomSentence();
      }
    }
  };

  btnModeWord?.addEventListener('click', () => setPracticeMode('word'));
  btnModeSentence?.addEventListener('click', () => setPracticeMode('sentence-generator'));

  // Cümleler sekmesinden doğrudan geçiş butonu
  document.getElementById('btn-goto-sentence-gen')?.addEventListener('click', () => {
    document.getElementById('tab-practice-btn')?.click();
    setPracticeMode('sentence-generator');
  });

  // Cümle Uzunluğu Hapları (2, 3, 4, 5, 6 kelime)
  document.querySelectorAll('#gen-length-pills .length-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('#gen-length-pills .length-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.genSentenceLength = parseInt(pill.getAttribute('data-len'), 10) || 3;
      generateRandomSentence();
    });
  });

  // Cümle Üreteci Kategori Filtresi
  const genCatSelect = document.getElementById('gen-category-select');

  genCatSelect?.addEventListener('change', (e) => {
    state.genCategory = e.target.value;
    generateRandomSentence();
  });

  // Cümle Üreteci Aksiyon Butonları
  document.getElementById('btn-gen-new-sentence')?.addEventListener('click', generateRandomSentence);

  const btnGenDone = document.getElementById('btn-gen-done');
  btnGenDone?.addEventListener('click', () => {
    btnGenDone.textContent = '✓ Harika! Yenisi Geliyor...';
    setTimeout(() => {
      btnGenDone.textContent = '✓ Akıcı İşaretledim';
      generateRandomSentence();
    }, 450);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function startApp() {
  initNavigationTabs();
  initSearchAndFilters();
  initModals();

  // 1. Önce anında yerel verileri ekrana çiz (0 milisaniye gecikme)
  loadInitialCache();

  // 2. Ardından Supabase'den en güncel verileri ve kullanıcı ilerlemesini yükle
  await loadDataFromSupabaseOrLocal();

  // 3. Supabase Oturum Değişikliklerini Dinle
  supabase.auth.onAuthStateChange(async (event, session) => {
    const prevUserId = state.currentUser?.id;
    state.currentUser = session?.user || null;
    updateAuthUI();
    if (state.currentUser?.id !== prevUserId) {
      await loadDataFromSupabaseOrLocal();
    }
  });
}

// Belge hazırsa doğrudan başlat, yükleniyorsa DOMContentLoaded bekle
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
