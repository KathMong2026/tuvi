/**
 * Huyền Cơ Đường — Firebase Module
 * ==================================
 * Firebase Auth (email/password + Google) + Firestore
 *
 * === HƯỚNG DẪN THIẾT LẬP ===
 * 1. Vào https://console.firebase.google.com/ tạo project mới
 * 2. Authentication → Sign-in method → Thêm Email/Password + Google
 * 3. Firestore Database → Tạo database (chế độ test)
 * 4. Project Settings → General → Web app → Copy config
 * 5. Dán config vào biến FIREBASE_CONFIG ở dưới
 * ============================
 *
 * === CHẾ ĐỘ FAIL-SAFE ===
 * Khi config chưa được thiết lập (giá trị mặc định), module sẽ:
 * - Không crash trang
 * - Trả về Promise.reject với thông báo rõ ràng cho mọi thao tác auth/firestore
 * - Cho phép tất cả các trang hoạt động bình thường
 * - Hiển thị nút "Đăng Nhập" nhưng thông báo cần cấu hình khi click
 */
(function() {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  //  THAY THẾ BẰNG CONFIG THẬT TỪ FIREBASE CONSOLE
  // ═══════════════════════════════════════════════════════════
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyBfPKL9A5yzmtFuQyHU392RyXBt_I-q5AU",
    authDomain: "tu-vi-d211c.firebaseapp.com",
    projectId: "tu-vi-d211c",
    storageBucket: "tu-vi-d211c.firebasestorage.app",
    messagingSenderId: "152056276949",
    appId: "1:152056276949:web:8e314ff4ba38aafcb2ff5c",
    measurementId: "G-P823DXDBFR"
  };
  // ═══════════════════════════════════════════════════════════

  var app = null, auth = null, db = null;
  var initialized = false;
  var _isConfigured = false;
  var _currentUser = null;
  var _listeners = [];

  // ─── Kiểm tra config đã được thay thế chưa ───
  function _checkConfig() {
    if (!FIREBASE_CONFIG) return false;
    if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf('XXX') >= 0) return false;
    if (FIREBASE_CONFIG.projectId === 'your-project-id') return false;
    return true;
  }

  // ─── Thông báo lỗi khi chưa cấu hình ───
  function _notConfiguredError() {
    return Promise.reject(new Error('Firebase chưa được cấu hình. Vui lòng cập nhật FIREBASE_CONFIG trong js/firebase.js.'));
  }

  function onAuthChange(fn) {
    _listeners.push(fn);
    if (_currentUser !== null) fn(_currentUser);
  }

  function _notify(user) {
    _currentUser = user;
    _listeners.forEach(function(fn) { fn(user); });
  }

  // ─── Safe wrapper cho các hàm auth ───
  function _safeAuth(fn) {
    return function() {
      if (!_isConfigured || !auth) return _notConfiguredError();
      try {
        return fn.apply(this, arguments);
      } catch(e) {
        return Promise.reject(e);
      }
    };
  }

  // ─── Safe wrapper cho các hàm firestore ───
  function _safeFS(fn) {
    return function() {
      if (!_isConfigured || !db) return _notConfiguredError();
      try {
        return fn.apply(this, arguments);
      } catch(e) {
        return Promise.reject(e);
      }
    };
  }

  function init() {
    if (initialized) return Promise.resolve(true);
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK not loaded. Auth features unavailable.');
      return Promise.resolve(false);
    }

    _isConfigured = _checkConfig();
    if (!_isConfigured) {
      console.warn('Firebase config not set. Using fail-safe mode. Auth & Firestore features disabled.');
      console.warn('Update FIREBASE_CONFIG in js/firebase.js with your real Firebase project credentials.');
      initialized = true;
      return Promise.resolve(false);
    }

    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      app = firebase.app();
      auth = firebase.auth();
      db = firebase.firestore();
      // Bỏ dòng db.settings vì Firestore 9.x compat có thể không cần
      initialized = true;

      if (auth) {
        auth.onAuthStateChanged(function(user) {
          _notify(user);
        });
      }

      console.log('Firebase initialized OK');
      return Promise.resolve(true);
    } catch(e) {
      console.error('Firebase init error:', e.message);
      _isConfigured = false;
      initialized = true;
      return Promise.resolve(false);
    }
  }

  // ─── Auth helpers (fail-safe) ───

  function registerWithEmail(email, password) {
    if (!_isConfigured || !auth) return _notConfiguredError();
    return auth.createUserWithEmailAndPassword(email, password);
  }

  function loginWithEmail(email, password) {
    if (!_isConfigured || !auth) return _notConfiguredError();
    return auth.signInWithEmailAndPassword(email, password);
  }

  function loginWithGoogle() {
    if (!_isConfigured || !auth) return _notConfiguredError();
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return auth.signInWithPopup(provider);
  }

  function resetPassword(email) {
    if (!_isConfigured || !auth) return _notConfiguredError();
    return auth.sendPasswordResetEmail(email);
  }

  function signOut() {
    if (!_isConfigured || !auth) return Promise.resolve();
    return auth.signOut();
  }

  function currentUser() {
    if (!_isConfigured || !auth) return null;
    return auth.currentUser;
  }

  function waitForAuth() {
    if (!_isConfigured || !auth) {
      return Promise.resolve(null);
    }
    return new Promise(function(resolve) {
      var called = false;
      var timeout = setTimeout(function() {
        if (!called) { called = true; resolve(auth.currentUser || null); }
      }, 3000);
      try {
        var unsub = auth.onAuthStateChanged(function(user) {
          if (!called) { called = true; clearTimeout(timeout); unsub(); resolve(user); }
        });
      } catch(e) {
        clearTimeout(timeout);
        if (!called) { called = true; resolve(null); }
      }
    });
  }

  // ─── Firestore: Hồ sơ người dùng ───

  var PROFILES = 'profiles';

  function getProfile() {
    if (!_isConfigured || !db || !auth) return _notConfiguredError();
    var user = auth.currentUser;
    if (!user) return Promise.reject(new Error('Chưa đăng nhập'));
    var ref = db.collection(PROFILES).doc(user.uid);
    return ref.get().then(function(doc) {
      if (doc.exists) return doc.data();
      var defaults = {
        displayName: user.displayName || '',
        email: user.email || '',
        birthYear: null, birthMonth: null, birthDay: null, birthHour: 0,
        gender: 'nam', longitude: '105.85', timezone: 'Asia/Ho_Chi_Minh',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      return ref.set(defaults).then(function() { return defaults; });
    }).catch(function(e) {
      console.error('getProfile error:', e);
      throw e;
    });
  }

  function updateProfile(data) {
    if (!_isConfigured || !db || !auth) return _notConfiguredError();
    var user = auth.currentUser;
    if (!user) return Promise.reject(new Error('Chưa đăng nhập'));
    var safe = {};
    if (data.displayName !== undefined) safe.displayName = (typeof data.displayName === 'string' ? data.displayName : '').substring(0, 80);
    if (data.email !== undefined) safe.email = (typeof data.email === 'string' ? data.email : '').substring(0, 254);
    if (data.birthYear !== undefined) safe.birthYear = data.birthYear ? Math.max(1900, Math.min(2100, parseInt(data.birthYear) || null)) : null;
    if (data.birthMonth !== undefined) s