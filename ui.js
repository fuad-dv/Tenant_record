/* =====================================================
   UI / UX layer — navigation state, toasts, animations.
   Loaded before app.js. Contains no data logic.
   ===================================================== */
(function () {
    const $ = (sel, root = document) => root.querySelector(sel);
    const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

    /* ---------- Toast notifications (replace window.alert) ---------- */
    const ICONS = { success: '✓', error: '!', warning: '!', info: 'i' };

    function detectType(msg) {
        const m = String(msg).toLowerCase();
        if (/(fail|error|cannot|invalid|not found)/.test(m)) return 'error';
        if (/(guest|disabled|please)/.test(m)) return 'warning';
        if (/(success|saved|updated|registered)/.test(m)) return 'success';
        return 'info';
    }

    function toast(message, type, duration) {
        const stack = $('#toast-stack');
        if (!stack) return;
        type = type || detectType(message);
        duration = duration || (type === 'error' ? 5200 : 3800);

        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.setAttribute('role', type === 'error' ? 'alert' : 'status');
        el.innerHTML = `
            <span class="toast-icon">${ICONS[type]}</span>
            <div class="toast-body"></div>
            <button class="toast-close" aria-label="Dismiss">&times;</button>
            <span class="toast-bar" style="animation-duration:${duration}ms"></span>`;
        el.querySelector('.toast-body').textContent = message;

        const remove = () => {
            if (el.classList.contains('out')) return;
            el.classList.add('out');
            setTimeout(() => el.remove(), 350);
        };
        el.querySelector('.toast-close').addEventListener('click', remove);
        const timer = setTimeout(remove, duration);
        el.addEventListener('mouseenter', () => clearTimeout(timer), { once: true });
        el.addEventListener('mouseleave', () => setTimeout(remove, 1500), { once: true });

        stack.appendChild(el);
        // keep the stack short
        const items = $$('.toast', stack);
        if (items.length > 4) items[0].remove();
    }

    window.alert = (msg) => toast(msg);

    /* ---------- Public helpers used by app.js ---------- */
    window.UI = {
        toast,
        setMode(isGuest) {
            document.body.dataset.mode = isGuest ? 'guest' : 'admin';
            const role = $('#user-role'), mode = $('#user-mode'), avatar = $('#user-avatar');
            if (role) role.textContent = isGuest ? 'Guest' : 'Admin';
            if (mode) mode.textContent = isGuest ? 'Read-only demo' : 'Full access';
            if (avatar) avatar.textContent = isGuest ? 'G' : 'A';
        },
        setProperty(name) {
            const el = $('#brand-property');
            if (el && name) el.textContent = name;
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        /* ---------- Date + greeting ---------- */
        const now = new Date();
        const dateEl = $('#today-date');
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
        const g = $('#greeting');
        if (g) {
            const h = now.getHours();
            g.textContent = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
        }

        /* ---------- Navigation active state + title ---------- */
        const title = $('#page-title');
        $$('.nav-link[data-title]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                $$('.nav-link').forEach(l => l.classList.remove('nav-active'));
                link.classList.add('nav-active');
                if (title) title.textContent = link.dataset.title;
                document.body.classList.remove('nav-open');
                const main = $('.main-content');
                if (main) main.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Quick action buttons route through the sidebar links
        $$('[data-go]').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = document.getElementById(btn.dataset.go);
                if (target) target.click();
            });
        });

        /* ---------- Mobile drawer ---------- */
        const toggle = $('#menu-toggle');
        const scrim = $('#sidebar-scrim');
        if (toggle) toggle.addEventListener('click', () => document.body.classList.toggle('nav-open'));
        if (scrim) scrim.addEventListener('click', () => document.body.classList.remove('nav-open'));

        // Mobile top-bar logout reuses the sidebar logout (handled in app.js)
        const mLogout = $('#mobile-logout');
        if (mLogout) mLogout.addEventListener('click', () => {
            document.body.classList.remove('nav-open');
            const real = document.getElementById('btn-logout');
            if (real) real.click();
        });

        /* ---------- Modals: close on backdrop click / Escape ---------- */
        $$('.modal').forEach(modal => {
            modal.addEventListener('mousedown', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape') return;
            const open = $$('.modal').filter(m => !m.classList.contains('hidden'));
            if (open.length) open[open.length - 1].classList.add('hidden');
            document.body.classList.remove('nav-open');
        });

        /* ---------- Animated counters on dashboard ---------- */
        const fmt = (n) => Math.round(n).toLocaleString('en-IN');
        const parse = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0;

        function animateTo(el, target) {
            const from = Number(el.dataset.val || 0);
            el.dataset.val = target;
            if (from === target) { el.dataset.busy = '1'; el.textContent = fmt(target); el.dataset.busy = ''; return; }
            const start = performance.now();
            const dur = 1100;
            el.dataset.busy = '1';
            const step = (t) => {
                const p = Math.min(1, (t - start) / dur);
                const eased = 1 - Math.pow(1 - p, 4);
                el.textContent = fmt(from + (target - from) * eased);
                if (p < 1) requestAnimationFrame(step);
                else setTimeout(() => { el.dataset.busy = ''; }, 0);
            };
            requestAnimationFrame(step);
        }

        const tenantsEl = $('#total-tenants');
        const rentEl = $('#total-rent');
        const avgEl = $('#avg-rent');

        function updateAverage() {
            if (!avgEl) return;
            const t = Number(tenantsEl.dataset.val || 0);
            const r = Number(rentEl.dataset.val || 0);
            animateTo(avgEl, t > 0 ? Math.round(r / t) : 0);
        }

        [tenantsEl, rentEl].forEach(el => {
            if (!el) return;
            new MutationObserver(() => {
                if (el.dataset.busy) return;
                const target = parse(el.textContent);
                if (target === Number(el.dataset.val || 0) && el.textContent === fmt(target)) return;
                animateTo(el, target);
                updateAverage();
            }).observe(el, { childList: true, characterData: true, subtree: true });
        });

    });
})();
