    /* PROFILE MODAL */
    const profileModal = document.getElementById("profileModal");
    const profileName  = document.getElementById("profileName");
    const profileRole  = document.getElementById("profileRole");
    const profileDesc  = document.getElementById("profileDesc");

    function openProfile(name, role, desc){
      profileName.textContent = name;
      profileRole.textContent = "Role: " + role;
      profileDesc.textContent = desc;
      profileModal.style.display = "flex";
    }
    function closeProfile(){
      profileModal.style.display = "none";
    }

    /* ✅ SAFE THEME TOGGLE */
    const toggle = document.getElementById("themeToggle");
    const root = document.documentElement;

    const savedTheme = localStorage.getItem("theme");
    const startTheme = savedTheme ? savedTheme : "light";

    root.setAttribute("data-theme", startTheme);
    toggle.textContent = startTheme === "light" ? "☀️" : "🌙";

    toggle.addEventListener("click", () => {
      const current = root.getAttribute("data-theme");
      const newTheme = current === "light" ? "dark" : "light";
      root.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      toggle.textContent = newTheme === "light" ? "☀️" : "🌙";
    });

    /* ===============================
       SIDEBAR TOGGLE
    ============================== */
    function toggleSidebarLinks(){
      const links = document.getElementById("sidebarLinks");
      const arrow = document.getElementById("sidebarArrow");
      links.classList.toggle("closed");
      arrow.classList.toggle("rotated");
    }

    /* ===============================
       READ MORE (EXPAND / COLLAPSE)
       - All posts start collapsed
       - Button toggles max-height
    ============================== */
    function setupReadMore(){
      const posts = document.querySelectorAll(".post.fb");
      posts.forEach(post => {
        const btn = post.querySelector(".readmore-btn");
        const body = post.querySelector(".post-body");
        if(!btn || !body) return;

        const collapsedHeight = parseInt(post.getAttribute("data-collapsed-height") || "170", 10);

        // start collapsed
        post.classList.add("collapsed");
        body.style.maxHeight = collapsedHeight + "px";
        btn.textContent = "Read more";

        btn.addEventListener("click", () => {
          const expanded = post.classList.contains("expanded");

          if(expanded){
            post.classList.remove("expanded");
            post.classList.add("collapsed");
            body.style.maxHeight = collapsedHeight + "px";
            btn.textContent = "Read more";
            post.scrollIntoView({ behavior:"smooth", block:"start" });
          }else{
            post.classList.add("expanded");
            post.classList.remove("collapsed");
            body.style.maxHeight = body.scrollHeight + "px";
            btn.textContent = "Show less";
          }
        });

        // Recalculate expanded height on resize
        window.addEventListener("resize", () => {
          if(post.classList.contains("expanded")){
            body.style.maxHeight = body.scrollHeight + "px";
          }
        });
      });
    }
    setupReadMore();

    /* =========================
       🎵 BFN MUSIC SYSTEM (YOUR ORIGINAL)
    ========================= */
    const bgm = document.getElementById("bgm");

    const songName = document.getElementById("songName");
    const songStatus = document.getElementById("songStatus");
    const trackPill = document.getElementById("trackPill");
    const modePill = document.getElementById("modePill");
    const miniStatus = document.getElementById("miniStatus");

    const prevBtn = document.getElementById("prevBtn");
    const playBtn = document.getElementById("playBtn");
    const nextBtn = document.getElementById("nextBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    const volRange = document.getElementById("volRange");

    const musicWidget = document.getElementById("musicWidget");
    const minBtn = document.getElementById("minBtn");
    const expandBtn = document.getElementById("expandBtn");

    const playlist = [
      { src: "sounds/bgm_0001.ogg", name: "bgm_0001.ogg" },
      { src: "sounds/bgm_0002.ogg", name: "bgm_0002.ogg" },
      { src: "sounds/bgm_0003.ogg", name: "bgm_0003.ogg" },
      { src: "sounds/bgm_0004.ogg", name: "bgm_0004.ogg" },
      { src: "sounds/bgm_0005.ogg", name: "bgm_0005.ogg" },
      { src: "sounds/bgm_0006.ogg", name: "bgm_0006.ogg" },
      { src: "sounds/bgm_0007.ogg", name: "bgm_0007.ogg" },
      { src: "sounds/bgm_0008.ogg", name: "bgm_0008.ogg" },
      { src: "sounds/bgm_0009.ogg", name: "bgm_0009.ogg" },
      { src: "sounds/bgm_0010.ogg", name: "bgm_0010.ogg" },
      { src: "sounds/bgm_0011.ogg", name: "bgm_0011.ogg" },
      { src: "sounds/bgm_0012.ogg", name: "bgm_0012.ogg" },
      { src: "sounds/bgm_0013.ogg", name: "bgm_0013.ogg" },
      { src: "sounds/bgm_0014.ogg", name: "bgm_0014.ogg" },
      { src: "sounds/bgm_0015.ogg", name: "bgm_0015.ogg" },
      { src: "sounds/bgm_0016.ogg", name: "bgm_0016.ogg" },
      { src: "sounds/bgm_0017.ogg", name: "bgm_0017.ogg" },
      { src: "sounds/bgm_0018.ogg", name: "bgm_0018.ogg" },
      { src: "sounds/bgm_0019.ogg", name: "bgm_0019.ogg" },
      { src: "sounds/bgm_0020.ogg", name: "bgm_0020.ogg" }
    ];

    const LS = {
      enabled: "bfn_music_enabled",
      index: "bfn_music_index",
      volume: "bfn_music_volume",
      shuffle: "bfn_music_shuffle",
      playing: "bfn_music_playing",
      minimized: "bfn_music_minimized"
    };

    let musicEnabled = localStorage.getItem(LS.enabled) ?? "on";
    let currentIndex = parseInt(localStorage.getItem(LS.index) ?? "0", 10);
    if (Number.isNaN(currentIndex) || currentIndex < 0 || currentIndex >= playlist.length) currentIndex = 0;

    let shuffleOn = (localStorage.getItem(LS.shuffle) ?? "0") === "1";
    let wantPlaying = (localStorage.getItem(LS.playing) ?? "0") === "1";
    let startedOnce = false;

    let savedVol = parseFloat(localStorage.getItem(LS.volume) ?? "0.5");
    if (Number.isNaN(savedVol) || savedVol < 0 || savedVol > 1) savedVol = 0.5;
    bgm.volume = savedVol;
    volRange.value = String(Math.round(savedVol * 100));

    function updateMiniBar(){
      miniStatus.textContent = (bgm.paused ? "⏸️ " : "▶️ ") + playlist[currentIndex].name;
    }
    function setSongUI(){
      songName.textContent = "🎵 " + playlist[currentIndex].name;
      trackPill.textContent = `Track: ${currentIndex + 1}/${playlist.length}`;
      modePill.textContent = shuffleOn ? "Mode: Shuffle" : "Mode: Loop";
      shuffleBtn.style.opacity = shuffleOn ? "1" : ".65";
      updateMiniBar();
    }
    function setStatusUI(){
      const isPaused = bgm.paused;
      songStatus.textContent = (musicEnabled === "off") ? "Off" : (isPaused ? "Paused" : "Playing");
      playBtn.textContent = (musicEnabled === "off") ? "▶️" : (isPaused ? "▶️" : "⏸️");
      playBtn.title = isPaused ? "Play" : "Pause";
      updateMiniBar();
    }
    function loadTrack(index){
      currentIndex = index;
      localStorage.setItem(LS.index, String(currentIndex));
      bgm.src = playlist[currentIndex].src;
      bgm.load();
      setSongUI();
      setStatusUI();
    }
    function pickRandomIndex(exceptIndex){
      if (playlist.length <= 1) return 0;
      let idx = Math.floor(Math.random() * playlist.length);
      if (idx === exceptIndex) idx = (idx + 1) % playlist.length;
      return idx;
    }
    async function safePlay(){
      if (musicEnabled === "off") return;
      try{
        await bgm.play();
        startedOnce = true;
        localStorage.setItem(LS.playing, "1");
      }catch(e){}
      setStatusUI();
    }
    function pauseMusic(){
      bgm.pause();
      localStorage.setItem(LS.playing, "0");
      setStatusUI();
    }
    function nextTrack(){
      const nextIndex = shuffleOn ? pickRandomIndex(currentIndex)
                                 : (currentIndex + 1) % playlist.length;
      loadTrack(nextIndex);
      safePlay();
    }
    function prevTrack(){
      const prevIndex = shuffleOn ? pickRandomIndex(currentIndex)
                                 : (currentIndex - 1 + playlist.length) % playlist.length;
      loadTrack(prevIndex);
      safePlay();
    }

    function setMinimized(min){
      if (min){
        musicWidget.classList.add("minimized");
        localStorage.setItem(LS.minimized, "1");
      }else{
        musicWidget.classList.remove("minimized");
        localStorage.setItem(LS.minimized, "0");
      }
    }

    minBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setMinimized(true); });
    expandBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); setMinimized(false); });

    bgm.addEventListener("ended", nextTrack);

    playBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (musicEnabled === "off"){
        musicEnabled = "on";
        localStorage.setItem(LS.enabled, "on");
        await safePlay();
        return;
      }
      if (bgm.paused) await safePlay();
      else pauseMusic();
    });

    nextBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); nextTrack(); });
    prevBtn.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); prevTrack(); });

    shuffleBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      shuffleOn = !shuffleOn;
      localStorage.setItem(LS.shuffle, shuffleOn ? "1" : "0");
      setSongUI();
    });

    volRange.addEventListener("input", () => {
      const v = Number(volRange.value) / 100;
      bgm.volume = v;
      localStorage.setItem(LS.volume, String(v));
      updateMiniBar();
    });

    function shouldTriggerBGM(target){
      return target.closest("a, button, .btn, .poster, .logo, .nav, .sidebar, .music-widget");
    }

    async function firstUserStart(e){
      if (!shouldTriggerBGM(e.target)) return;
      if (!startedOnce && wantPlaying && musicEnabled !== "off"){
        await safePlay();
      }
      document.removeEventListener("pointerdown", firstUserStart);
      document.removeEventListener("click", firstUserStart);
    }
    document.addEventListener("pointerdown", firstUserStart, { passive:true });
    document.addEventListener("click", firstUserStart);

    window.addEventListener("beforeunload", () => {
      localStorage.setItem(LS.enabled, musicEnabled);
      localStorage.setItem(LS.index, String(currentIndex));
      localStorage.setItem(LS.shuffle, shuffleOn ? "1" : "0");
      localStorage.setItem(LS.volume, String(bgm.volume));
      localStorage.setItem(LS.playing, bgm.paused ? "0" : "1");
      localStorage.setItem(LS.minimized, musicWidget.classList.contains("minimized") ? "1" : "0");
    });

    loadTrack(currentIndex);

    const wasMin = (localStorage.getItem(LS.minimized) ?? "0") === "1";
    if (wasMin) setMinimized(true);

    if (musicEnabled === "off"){
      pauseMusic();
      songStatus.textContent = "Off";
    } else {
      setStatusUI();
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }