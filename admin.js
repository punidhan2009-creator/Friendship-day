(function () {
  'use strict';

  const QUESTION_MAP = Object.fromEntries(QUESTIONS.map((q) => [q.id, q.label]));

  const screenLogin = document.getElementById('admin-login');
  const screenDashboard = document.getElementById('admin-dashboard');

  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');

  const btnLogout = document.getElementById('btn-logout');
  const adminSummary = document.getElementById('admin-summary');
  const adminList = document.getElementById('admin-list');
  const adminEmpty = document.getElementById('admin-empty');
  const adminSearch = document.getElementById('admin-search');
  const cardTemplate = document.getElementById('response-card-template');

  let allResponses = [];

  function showLogin() {
    screenLogin.hidden = false;
    screenDashboard.hidden = true;
  }

  function showDashboard() {
    screenLogin.hidden = true;
    screenDashboard.hidden = false;
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.textContent = '';
    try {
      await firebase.auth().signInWithEmailAndPassword(
        loginEmail.value.trim(),
        loginPassword.value
      );
    } catch (err) {
      console.error('Sign-in failed:', err);
      loginError.textContent = 'Could not sign in. Check your email and password.';
    }
  });

  btnLogout.addEventListener('click', () => {
    firebase.auth().signOut();
  });

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      showDashboard();
      loadResponses();
    } else {
      showLogin();
    }
  });

  async function loadResponses() {
    adminSummary.textContent = 'Loading…';
    try {
      const db = firebase.firestore();
      const snapshot = await db
        .collection('friendship_responses')
        .orderBy('submittedAt', 'desc')
        .get();

      allResponses = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      adminSummary.textContent = `${allResponses.length} response${allResponses.length === 1 ? '' : 's'} collected`;
      renderList(allResponses);
    } catch (err) {
      console.error('Failed to load responses:', err);
      adminSummary.textContent = 'Could not load responses. Check your Firestore rules and connection.';
    }
  }

  function formatDate(entry) {
    try {
      if (entry.submittedAt && typeof entry.submittedAt.toDate === 'function') {
        return entry.submittedAt.toDate().toLocaleString();
      }
      if (entry.submittedAtLocal) {
        return new Date(entry.submittedAtLocal).toLocaleString();
      }
    } catch (err) {
      /* fall through */
    }
    return 'Date unavailable';
  }

  function renderList(responses) {
    adminList.innerHTML = '';
    adminEmpty.hidden = responses.length !== 0;

    responses.forEach((entry) => {
      const node = cardTemplate.content.cloneNode(true);
      const card = node.querySelector('.response-card');
      const header = node.querySelector('.response-card-header');
      const nameEl = node.querySelector('.response-name');
      const dateEl = node.querySelector('.response-date');
      const bodyEl = node.querySelector('.response-body');

      nameEl.textContent = entry.name || 'Anonymous';
      dateEl.textContent = formatDate(entry);

      const answers = entry.answers || {};
      QUESTIONS.forEach((q) => {
        const value = answers[q.id];
        if (!value) return;
        const qa = document.createElement('div');
        qa.className = 'response-qa';

        const qEl = document.createElement('p');
        qEl.className = 'response-q';
        qEl.textContent = QUESTION_MAP[q.id] || q.id;

        const aEl = document.createElement('p');
        aEl.className = 'response-a';
        aEl.textContent = value;

        qa.appendChild(qEl);
        qa.appendChild(aEl);
        bodyEl.appendChild(qa);
      });

      header.addEventListener('click', () => {
        card.classList.toggle('open');
      });

      adminList.appendChild(node);
    });
  }

  adminSearch.addEventListener('input', () => {
    const term = adminSearch.value.trim().toLowerCase();
    if (!term) {
      renderList(allResponses);
      return;
    }
    const filtered = allResponses.filter((entry) =>
      (entry.name || '').toLowerCase().includes(term)
    );
    renderList(filtered);
  });
})();
