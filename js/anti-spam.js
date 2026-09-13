/* Prime Blog — client-side anti-spam helper
   Note: pure client checks can be bypassed by determined attackers.
   For strong protection use a backend/proxy or Discord bot rate limits.
*/
(function (global) {
  var SPAM_PATTERNS = [
    /logfree/i,
    /checklogsfree/i,
    /panel\.checklogs/i,
    /@everyone/i,
    /@here/i,
    /discord\.gg\/[a-z0-9]+/i,
    /free\s*logs?/i,
    /vip\s*services?/i,
    /checker.*log/i,
    /webhook/i,
    /bit\.ly/i,
    /tinyurl/i
  ];

  function now() { return Date.now(); }

  function get(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v == null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function set(key, val) {
    try { localStorage.setItem(key, String(val)); } catch (e) {}
  }

  function textLooksSpam() {
    var parts = [];
    for (var i = 0; i < arguments.length; i++) parts.push(String(arguments[i] || ""));
    var blob = parts.join("\n");
    for (var j = 0; j < SPAM_PATTERNS.length; j++) {
      if (SPAM_PATTERNS[j].test(blob)) return true;
    }
    // too many links
    var links = blob.match(/https?:\/\//gi);
    if (links && links.length >= 2) return true;
    return false;
  }

  /**
   * Create a form guard.
   * opts: {
   *   prefix: 'pb_support',
   *   cooldownMs: 60000,
   *   once: true,
   *   minFillMs: 2500,
   *   maxAttempts: 3,
   *   attemptWindowMs: 10 * 60 * 1000,
   *   honeypotSelector: '.pb-hp',
   *   onSpam: function(reason){},
   *   form: HTMLFormElement,
   *   startedAt: number (page load time)
   * }
   */
  function createGuard(opts) {
    opts = opts || {};
    var prefix = opts.prefix || "pb_form";
    var KEY_LAST = prefix + "_last";
    var KEY_USED = prefix + "_used";
    var KEY_ATTEMPTS = prefix + "_attempts";
    var KEY_BANNED = prefix + "_banned";
    var cooldownMs = opts.cooldownMs != null ? opts.cooldownMs : 60000;
    var once = opts.once !== false;
    var minFillMs = opts.minFillMs != null ? opts.minFillMs : 2500;
    var maxAttempts = opts.maxAttempts != null ? opts.maxAttempts : 3;
    var attemptWindowMs = opts.attemptWindowMs != null ? opts.attemptWindowMs : 10 * 60 * 1000;
    var startedAt = opts.startedAt || now();

    function isBanned() {
      return get(KEY_BANNED, "") === "1";
    }
    function ban(reason) {
      set(KEY_BANNED, "1");
      set(KEY_USED, "1");
      if (typeof opts.onSpam === "function") opts.onSpam(reason || "spam");
    }
    function hasUsedOnce() {
      return once && get(KEY_USED, "") === "1";
    }
    function remainingCooldown() {
      var last = parseInt(get(KEY_LAST, "0"), 10) || 0;
      if (!last) return 0;
      var left = cooldownMs - (now() - last);
      return left > 0 ? left : 0;
    }
    function recordAttempt() {
      var raw = get(KEY_ATTEMPTS, "[]");
      var list = [];
      try { list = JSON.parse(raw) || []; } catch (e) { list = []; }
      var t = now();
      list = list.filter(function (x) { return t - x < attemptWindowMs; });
      list.push(t);
      set(KEY_ATTEMPTS, JSON.stringify(list));
      if (list.length > maxAttempts) {
        ban("too_many_attempts");
        return false;
      }
      return true;
    }
    function checkHoneypot() {
      if (!opts.form) return true;
      var hp = opts.form.querySelector(opts.honeypotSelector || ".pb-hp");
      if (!hp) return true;
      if ((hp.value || "").trim() !== "") {
        ban("honeypot");
        return false;
      }
      return true;
    }
    function checkMinTime() {
      // Too fast = reject this try, but do NOT permanent-ban (normal users can be quick)
      if (now() - startedAt < minFillMs) {
        return false;
      }
      return true;
    }
    function isTooFast() {
      return (now() - startedAt) < minFillMs;
    }
    function markSuccess() {
      set(KEY_USED, "1");
      set(KEY_LAST, String(now()));
    }
    function formatMs(ms) {
      return Math.ceil(ms / 1000) + "s";
    }

    return {
      isBanned: isBanned,
      ban: ban,
      hasUsedOnce: hasUsedOnce,
      remainingCooldown: remainingCooldown,
      recordAttempt: recordAttempt,
      checkHoneypot: checkHoneypot,
      checkMinTime: checkMinTime,
      isTooFast: isTooFast,
      markSuccess: markSuccess,
      formatMs: formatMs,
      textLooksSpam: textLooksSpam
    };
  }

  function showSpamWall(container) {
    if (!container) return;
    var existing = document.getElementById("pbSpamWall");
    if (existing) {
      existing.style.display = "flex";
      return;
    }
    var wall = document.createElement("div");
    wall.id = "pbSpamWall";
    wall.setAttribute("role", "alert");
    wall.innerHTML =
      '<div class="pb-spam-inner">' +
        '<h2 class="pb-spam-title">Don\'t try to Spam bitch</h2>' +
        '<p class="pb-spam-sub">Spam / bypass detected. Forms are locked on this browser.</p>' +
        '<div class="pb-spam-imgs">' +
          '<img src="images/spam-1.jpg" alt="" class="pb-spam-img a1" />' +
          '<img src="images/spam-2.jpg" alt="" class="pb-spam-img a2" />' +
          '<img src="images/spam-3.gif" alt="" class="pb-spam-img a3" />' +
        '</div>' +
      '</div>';
    container.appendChild(wall);
  }

  // inject CSS once
  if (!document.getElementById("pbSpamCss")) {
    var style = document.createElement("style");
    style.id = "pbSpamCss";
    style.textContent =
      "#pbSpamWall{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(10,8,20,0.92);backdrop-filter:blur(8px);padding:20px;animation:pbSpamIn .35s ease;}" +
      ".pb-spam-inner{max-width:520px;width:100%;text-align:center;background:linear-gradient(160deg,#2c2c54,#40407a);" +
      "border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:28px 22px;box-shadow:0 20px 60px rgba(0,0,0,.5);}" +
      ".pb-spam-title{font-family:Orbitron,system-ui,sans-serif;font-size:1.35rem;color:#FF2D55;margin:0 0 10px;" +
      "animation:pbShake .5s ease infinite alternate;}" +
      ".pb-spam-sub{color:#C4C4D4;font-size:.92rem;margin:0 0 18px;line-height:1.5;}" +
      ".pb-spam-imgs{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;}" +
      ".pb-spam-img{width:120px;height:120px;object-fit:cover;border-radius:14px;border:2px solid rgba(255,255,255,.2);" +
      "background:#111;}" +
      ".pb-spam-img.a1{animation:pbBounce 1.2s ease infinite;}" +
      ".pb-spam-img.a2{animation:pbBounce 1.2s ease .2s infinite;}" +
      ".pb-spam-img.a3{animation:pbBounce 1.2s ease .4s infinite;}" +
      "@keyframes pbSpamIn{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}" +
      "@keyframes pbShake{from{transform:translateX(-2px)}to{transform:translateX(2px)}}" +
      "@keyframes pbBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}" +
      ".pb-hp{position:absolute!important;left:-9999px!important;opacity:0!important;height:0!important;width:0!important;" +
      "pointer-events:none!important;tab-index:-1;}";
    document.head.appendChild(style);
  }

  global.PB_ANTISPAM = {
    createGuard: createGuard,
    showSpamWall: showSpamWall,
    textLooksSpam: textLooksSpam
  };
})(window);
