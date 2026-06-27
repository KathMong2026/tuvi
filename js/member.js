/**
 * Huyền Cơ Đường — Member Module
 * ===============================
 * Các hàm UI dùng chung cho thành viên:
 * - Nav auth button (Đăng Nhập / Avatar + dropdown)
 * - Auto-fill form từ profile đã lưu
 * - Lưu lá số từ kết quả Bát Tự / Tử Vi
 *
 * Cần load trước: firebase-app-compat.js, firebase-auth-compat.js, firebase-firestore-compat.js, js/firebase.js
 */
(function() {
  'use strict';

  var t = function(k) { return (typeof I18N !== 'undefined' ? I18N.t(k) : null) || k; };

  // ─── CSS injection for member UI ───
  function injectCSS() {
    if (document.getElementById('hcd-member-css')) return;
    var style = document.createElement('style');
    style.id = 'hcd-member-css';
    style.textContent = ''
      + '.hcd-user-area{display:flex;align-items:center;gap:8px;position:relative}'
      + '.hcd-avatar{width:34px;height:34px;border-radius:50%;background:var(--seal,#9c2a1c);color:var(--surface,#f6efd9);display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;flex-shrink:0}'
      + '.hcd-uname{font-size:15px;color:var(--ink-2,#3f372b);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '.hcd-dropdown{position:absolute;top:100%;right:0;margin-top:8px;background:var(--surface,#f6efd9);border:1px solid var(--line,rgba(33,29,24,.13));border-radius:6px;box-shadow:0 12px 32px rgba(33,29,24,.15);min-width:180px;overflow:hidden;display:none;z-index:50}'
      + '.hcd-dropdown.show{display:block}'
      + '.hcd-dropdown a,.hcd-dropdown button{display:block;width:100%;text-align:left;padding:11px 16px;font-size:14px;color:var(--ink-2,#3f372b);transition:background .12s;background:none;border:none;cursor:pointer;font-family:inherit}'
      + '.hcd-dropdown a:hover,.hcd-dropdown button:hover{background:rgba(156,42,28,.06);color:var(--seal,#9c2a1c)}'
      + '.hcd-login-btn{padding:6px 16px;border-radius:3px;border:1px solid var(--seal,#9c2a1c);color:var(--seal,#9c2a1c);background:transparent;font-size:14px;cursor:pointer;font-family:inherit;transition:background .15s,color .15s}'
      + '.hcd-login-btn:hover{background:var(--seal,#9c2a1c);color:var(--surface,#f6efd9)}'
      + '.hcd-save-btn-wrap{margin-top:16px;text-align:center}'
      + '.hcd-save-btn{padding:12px 28px;border-radius:3px;background:var(--dark,#211d18);color:var(--surface,#f6efd9);border:none;font-size:15px;font-family:\'Noto Serif TC\',serif;letter-spacing:.08em;cursor:pointer;box-shadow:0 3px 0 rgba(0,0,0,.2);transition:background .15s}'
      + '.hcd-save-btn:hover{background:var(--seal,#9c2a1c)}'
      + '.hcd-save-btn:disabled{opacity:.6;cursor:not-allowed}'
      + '.hcd-save-btn.saved{background:var(--moc,#4a6741);box-shadow:0 3px 0 #2e4a2a}'
      + '.hcd-saved-label{display:inline-flex;align-items:center;gap:6px;font-size:14px;color:var(--moc,#4a6741);margin-top:8px}';
    document.head.appendChild(style);
  }

  // ─── Render nav auth button ───
  // Gọi trong mỗi trang sau khi load firebase:
  //   HCD.member.renderNavAuth('.kd-nav');
  function renderNavAuth(navSelector) {
    injectCSS();
    var nav = typeof navSelector === 'string' ? document.querySelector(navSelector) : navSelector;
    if (!nav) return;

    // Xóa cũ nếu có
    var old = nav.querySelector('.hcd-user-area');
    if (old) old.remove();

    var container = document.createElement('span');
    container.className = 'hcd-user-area';
    container.id = 'hcdNavAuth';
    nav.appendChild(container);

    HCD.firebase.waitForAuth().then(function(user) {
      if (!HCD.firebase.isConfigured || !HCD.firebase.isConfigured()) {
        renderAuthUI(container, null);
        return;
      }
      renderAuthUI(container, user);
    });
  }

  function renderAuthUI(container, user) {
    container.innerHTML = '';
    if (user) {
      var name = (user.displayName || user.email || 'User').split(' ')[0].split('@')[0];
      var initial = (name.charAt(0) || 'U').toUpperCase();

      var avatar = document.createElement('span');
      avatar.className = 'hcd-avatar';
      avatar.textContent = initial;
      avatar.title = user.email || '';
      container.appendChild(avatar);

      var nameSpan = document.createElement('span');
      nameSpan.className = 'hcd-uname';
      nameSpan.textContent = name;
      container.appendChild(nameSpan);

      var dropdown = document.createElement('div');
      dropdown.className = 'hcd-dropdown';
      dropdown.innerHTML = ''
        + '<a href="profile.html">' + t('nav.profile') + '</a>'
        + '<button onclick="HCD.member.logout()">' + t('nav.logout') + '</button>';
      container.appendChild(dropdown);

      avatar.addEventListener('click', function(e) { e.stopPropagation(); dropdown.classList.toggle('show'); });
      nameSpan.addEventListener('click', function(e) { e.stopPropagation(); dropdown.classList.toggle('show'); });

      document.addEventListener('click', function() { dropdown.classList.remove('show'); });
    } else {
      var btn = document.createElement('button');
      btn.className = 'hcd-login-btn';
      btn.textContent = t('nav.login');
      btn.onclick = function() {
        sessionStorage.setItem('hcd-redirect', window.location.href);
        window.location.href = 'login.html';
      };
      container.appendChild(btn);
    }
  }

  // ─── Auto-fill form từ profile ───
  // HCD.member.autoFill('#fy','#fm','#fd','#fh','#fg','#ftz');
  function autoFill(yearId, monthId, dayId, hourId, genderId, locationId) {
    var user = HCD.firebase.currentUser();
    if (!user) return Promise.resolve(false);

    return HCD.firebase.getProfile().then(function(profile) {
      if (!profile.birthYear) return false;

      var fy = document.querySelector(yearId);
      var fm = document.querySelector(monthId);
      var fd = document.querySelector(dayId);
      var fh = document.querySelector(hourId);
      var fg = document.querySelector(genderId);
      var ftz = document.querySelector(locationId);

      if (fy && profile.birthYear) fy.value = profile.birthYear;
      if (fm && profile.birthMonth) fm.value = profile.birthMonth;
      if (fd && profile.birthDay) fd.value = profile.birthDay;
      if (fh && profile.birthHour !== undefined && profile.birthHour !== null) fh.value = profile.birthHour;

      if (fg) {
        var btns = fg.querySelectorAll('button');
        btns.forEach(function(b) {
          var g = b.dataset.g;
          b.classList.toggle('on', g === (profile.gender || 'nam'));
        });
      }

      if (ftz) {
        var loc = String(profile.longitude || '105.85');
        var known = ['105.85','106.70','108.22','116.38'];
        if (known.indexOf(loc) >= 0) {
          ftz.value = loc;
        } else {
          ftz.value = 'custom';
          var customInput = document.getElementById('fcustomLon');
          if (customInput) {
            customInput.value = loc;
            customInput.style.display = 'block';
          }
        }
      }
      return true;
    }).catch(function() { return false; });
  }

  // ─── Save chart button helpers ───

  /** Render nút Lưu Lá Số vào container */
  function renderSaveButton(containerSelector, chartDataBuilder) {
    var container = typeof containerSelector === 'string'
      ? document.querySelector(containerSelector)
      : containerSelector;
    if (!container) return;

    var wrap = document.createElement('div');
    wrap.className = 'hcd-save-btn-wrap';
    wrap.id = 'hcdSaveWrap';

    var btn = document.createElement('button');
    btn.className = 'hcd-save-btn';
    btn.textContent = t('save.btn');
    btn.onclick = function() {
      handleSaveChart(btn, chartDataBuilder);
    };
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  function handleSaveChart(btn, chartDataBuilder) {
    // Kiểm tra login
    var user = HCD.firebase.currentUser();
    if (!user) {
      sessionStorage.setItem('hcd-redirect', window.location.href);
      window.location.href = 'login.html';
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-sm" style="display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px"></span>' + t('save.btn.loading');

    var data = chartDataBuilder();
    if (!data) {
      btn.disabled = false;
      btn.textContent = t('save.error');
      setTimeout(function() { btn.textContent = t('save.btn'); }, 2000);
      return;
    }

    HCD.firebase.saveChart(data).then(function() {
      btn.className = 'hcd-save-btn saved';
      btn.innerHTML = '✓ ' + t('save.btn.saved');
      setTimeout(function() {
        btn.className = 'hcd-save-btn';
        btn.textContent = t('save.btn');
        btn.disabled = false;
      }, 3000);

      // Hiển thị link tới hồ sơ
      var savedLabel = document.getElementById('hcdSavedLabel');
      if (!savedLabel) {
        savedLabel = document.createElement('div');
        savedLabel.className = 'hcd-saved-label';
        savedLabel.id = 'hcdSavedLabel';
        savedLabel.innerHTML = '✓ ' + t('save.success') + ' <a href="profile.html" style="color:var(--seal,#9c2a1c);text-decoration:underline">' + t('nav.profile') + ' →</a>';
        btn.parentNode.appendChild(savedLabel);
      }
    }).catch(function(err) {
      console.error('Save chart error:', err);
      btn.disabled = false;
      btn.textContent = t('save.error');
      setTimeout(function() { btn.textContent = t('save.btn'); }, 2000);
    });
  }

  // ─── Logout ───
  function logout() {
    HCD.firebase.signOut().then(function() {
      window.location.reload();
    });
  }

  // ─── Inject spinner keyframes ───
  function injectSpinnerKeyframes() {
    if (document.getElementById('hcd-spinner-kf')) return;
    var style = document.createElement('style');
    style.id = 'hcd-spinner-kf';
    style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(style);
  }

  // ─── Export ───
  window.HCD = window.HCD || {};
  window.HCD.member = {
    renderNavAuth: renderNavAuth,
    autoFill: autoFill,
    renderSaveButton: renderSaveButton,
    handleSaveChart: 