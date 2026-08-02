(function () {
  'use strict';

  const TOTAL = QUESTIONS.length;

  const state = {
    index: 0,
    answers: {},
  };

  const screens = {
    landing: document.getElementById('screen-landing'),
    quiz: document.getElementById('screen-quiz'),
    loading: document.getElementById('screen-loading'),
    thankyou: document.getElementById('screen-thankyou'),
  };

  const btnStart = document.getElementById('btn-start');
  const form = document.getElementById('question-form');
  const questionCard = document.getElementById('question-card');
  const questionEyebrow = document.getElementById('question-eyebrow');
  const questionLabel = document.getElementById('question-label');
  const inputWrapper = document.getElementById('input-wrapper');
  const questionError = document.getElementById('question-error');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');

  const progressFill = document.getElementById('progress-fill');
  const progressBead = document.getElementById('progress-bead');
  const progressBar = document.getElementById('progress-bar');
  const progressCount = document.getElementById('progress-count');

  const submitError = document.getElementById('submit-error');

  function showScreen(name) {
    Object.entries(screens).forEach(([key, el]) => {
      el.hidden = key !== name;
    });
    window.scrollTo(0, 0);
  }

  function renderQuestion() {
    const q = QUESTIONS[state.index];

    questionEyebrow.textContent = `Question ${state.index + 1}`;
    questionLabel.textContent = q.label;
    questionLabel.setAttribute('for', 'question-field');
    questionError.textContent = '';

    inputWrapper.innerHTML = '';
    let field;
    if (q.type === 'textarea') {
      field = document.createElement('textarea');
      field.className = 'question-textarea';
      field.rows = 4;
    } else {
      field = document.createElement('input');
      field.type = 'text';
      field.className = 'question-input';
    }
    field.id = 'question-field';
    field.name = q.id;
    field.placeholder = q.placeholder || '';
    field.value = state.answers[q.id] || '';
    field.autocomplete = q.id === 'name' ? 'name' : 'off';
    field.required = true;
    inputWrapper.appendChild(field);

    questionCard.classList.remove('fade-enter');
    void questionCard.offsetWidth;
    questionCard.classList.add('fade-enter');

    btnPrev.disabled = state.index === 0;
    btnNext.textContent = state.index === TOTAL - 1 ? 'Submit' : 'Next';

    const percent = ((state.index + 1) / TOTAL) * 100;
    progressFill.style.width = percent + '%';
    progressBead.style.left = percent + '%';
    progressBar.setAttribute('aria-valuenow', String(state.index + 1));
    progressCount.textContent = String(state.index + 1);

    field.focus({ preventScroll: true });
  }

  function currentFieldValue() {
    const field = document.getElementById('question-field');
    return field ? field.value.trim() : '';
  }

  function saveCurrentAnswer() {
    const q = QUESTIONS[state.index];
    state.answers[q.id] = currentFieldValue();
  }

  function goNext() {
    const value = currentFieldValue();
    if (!value) {
      questionError.textContent = 'Please share an answer before continuing.';
      const field = document.getElementById('question-field');
      if (field) field.focus();
      return;
    }
    saveCurrentAnswer();

    if (state.index === TOTAL - 1) {
      submitAnswers();
      return;
    }
    state.index += 1;
    renderQuestion();
  }

  function goPrev() {
    if (state.index === 0) return;
    saveCurrentAnswer();
    state.index -= 1;
    renderQuestion();
  }

  async function submitAnswers() {
    showScreen('loading');
    submitError.classList.add('visually-hidden');
    submitError.textContent = '';

    const payload = {
      name: state.answers.name || 'Anonymous',
      answers: { ...state.answers },
      submittedAt: (window.firebase && firebase.firestore)
        ? firebase.firestore.FieldValue.serverTimestamp()
        : new Date().toISOString(),
      submittedAtLocal: new Date().toISOString(),
    };

    try {
      if (!window.firebase || !firebase.apps || !firebase.apps.length) {
        throw new Error('Firebase is not configured yet. Add your project keys to firebase-config.js.');
      }
      const db = firebase.firestore();
      await db.collection('friendship_responses').add(payload);
      showScreen('thankyou');
    } catch (err) {
      console.error('Failed to submit response:', err);
      showScreen('loading');
      submitError.classList.remove('visually-hidden');
      submitError.textContent =
        'Something went wrong sending your answers. Please check your connection and try again.';
      setTimeout(() => {
        showScreen('quiz');
        renderQuestion();
      }, 2600);
    }
  }

  btnStart.addEventListener('click', () => {
    showScreen('quiz');
    renderQuestion();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    goNext();
  });

  btnPrev.addEventListener('click', goPrev);

  inputWrapper.addEventListener('input', () => {
    if (questionError.textContent) questionError.textContent = '';
  });

  (function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width, height, particles;

    function resize() {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    }

    function makeParticles() {
      const count = Math.min(60, Math.floor((window.innerWidth * window.innerHeight) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.6 + 0.4) * window.devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.12 * window.devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.12 * window.devicePixelRatio,
        alpha: Math.random() * 0.5 + 0.15,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 209, 96, ${p.alpha})`;
        ctx.shadowColor = 'rgba(244, 209, 96, 0.8)';
        ctx.shadowBlur = 6 * window.devicePixelRatio;
        ctx.fill();
      });
      if (!prefersReducedMotion) requestAnimationFrame(draw);
    }

    resize();
    makeParticles();
    draw();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        makeParticles();
        if (prefersReducedMotion) draw();
      }, 200);
    });
  })();
})();
