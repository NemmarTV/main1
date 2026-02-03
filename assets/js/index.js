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
       ✅ FACEBOOK-LIKE IMAGE VIEWER (Zoom + Drag + Pinch + Double Tap)
    ============================== */
    const imgViewer = document.getElementById("imgViewer");
    const viewerImg = document.getElementById("viewerImg");
    const viewerCaption = document.getElementById("viewerCaption");
    const closeViewerBtn = document.getElementById("closeViewerBtn");
    const prevImgBtn = document.getElementById("prevImgBtn");
    const nextImgBtn = document.getElementById("nextImgBtn");

    const zoomInBtn = document.getElementById("zoomInBtn");
    const zoomOutBtn = document.getElementById("zoomOutBtn");
    const resetZoomBtn = document.getElementById("resetZoomBtn");

    const postImages = Array.from(document.querySelectorAll(".post-img"));
    let currentImgIndex = 0;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    let dragging = false;
    let startX = 0, startY = 0;

    let pinching = false;
    let pinchStartDist = 0;
    let pinchStartScale = 1;
    let pinchMidX = 0, pinchMidY = 0;

    let lastTapTime = 0;
    let lastTapX = 0, lastTapY = 0;

    function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

    function applyTransform(){
      viewerImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    function resetTransform(){
      scale = 1;
      translateX = 0;
      translateY = 0;
      applyTransform();
    }

    function setScale(newScale, originX = null, originY = null){
      // Zoom towards a point (origin) if provided
      const oldScale = scale;
      scale = clamp(newScale, 1, 5);

      if(originX !== null && originY !== null && viewerImg){
        // Adjust translation so zoom feels like it focuses around the cursor/touch point
        const rect = viewerImg.getBoundingClientRect();
        const cx = originX - rect.left - rect.width / 2;
        const cy = originY - rect.top  - rect.height / 2;

        const ratio = scale / oldScale;
        translateX = translateX - cx * (ratio - 1);
        translateY = translateY - cy * (ratio - 1);
      }

      applyTransform();
    }

    function openViewer(index){
      if(!postImages.length) return;

      currentImgIndex = clamp(index, 0, postImages.length - 1);

      const img = postImages[currentImgIndex];
      viewerImg.src = img.getAttribute("src");
      viewerImg.alt = img.getAttribute("alt") || "Image";
      viewerCaption.textContent = "📷 " + (img.dataset.caption || img.alt || `Image ${currentImgIndex+1}`);

      imgViewer.classList.add("show");
      imgViewer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      resetTransform();
      setTimeout(() => viewerImg.focus?.(), 0);
    }

    function closeViewer(){
      imgViewer.classList.remove("show");
      imgViewer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      viewerImg.src = "";
      resetTransform();
    }

    function showPrev(){
      openViewer((currentImgIndex - 1 + postImages.length) % postImages.length);
    }

    function showNext(){
      openViewer((currentImgIndex + 1) % postImages.length);
    }

    // Click thumbnails -> open
    postImages.forEach((img, idx) => {
      img.addEventListener("click", () => openViewer(idx));
    });

    // Buttons
    closeViewerBtn.addEventListener("click", closeViewer);
    prevImgBtn.addEventListener("click", showPrev);
    nextImgBtn.addEventListener("click", showNext);

    zoomInBtn.addEventListener("click", () => setScale(scale + 0.25));
    zoomOutBtn.addEventListener("click", () => setScale(scale - 0.25));
    resetZoomBtn.addEventListener("click", resetTransform);

    // Click outside image to close
    imgViewer.addEventListener("click", (e) => {
      if(e.target === imgViewer) closeViewer();
    });

    // Keyboard
    document.addEventListener("keydown", (e) => {
      if(!imgViewer.classList.contains("show")) return;

      if(e.key === "Escape") closeViewer();
      if(e.key === "ArrowLeft") showPrev();
      if(e.key === "ArrowRight") showNext();
      if(e.key === "+"
        || (e.key === "=" && (e.ctrlKey || e.metaKey))
      ){
        setScale(scale + 0.25);
      }
      if(e.key === "-" && (e.ctrlKey || e.metaKey)){
        setScale(scale - 0.25);
      }
    });

    // Wheel zoom (desktop)
    viewerImg.addEventListener("wheel", (e) => {
      if(!imgViewer.classList.contains("show")) return;
      e.preventDefault();
      const delta = Math.sign(e.deltaY);
      const step = 0.18;
      const next = delta > 0 ? scale - step : scale + step;
      setScale(next, e.clientX, e.clientY);
    }, { passive:false });

    // Drag (mouse + touch single finger)
    function startDrag(x, y){
      dragging = true;
      startX = x - translateX;
      startY = y - translateY;
    }
    function moveDrag(x, y){
      if(!dragging) return;
      translateX = x - startX;
      translateY = y - startY;
      applyTransform();
    }
    function endDrag(){ dragging = false; }

    viewerImg.addEventListener("mousedown", (e) => {
      if(!imgViewer.classList.contains("show")) return;
      e.preventDefault();
      startDrag(e.clientX, e.clientY);
    });
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener("mouseup", endDrag);

    // Touch: drag + pinch + double tap zoom
    function getDist(t1, t2){
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      return Math.hypot(dx, dy);
    }
    function getMid(t1, t2){
      return {
        x: (t1.clientX + t2.clientX)/2,
        y: (t1.clientY + t2.clientY)/2
      };
    }

    viewerImg.addEventListener("touchstart", (e) => {
      if(!imgViewer.classList.contains("show")) return;

      if(e.touches.length === 1){
        const t = e.touches[0];

        // Double tap
        const now = Date.now();
        const dt = now - lastTapTime;
        const dx = Math.abs(t.clientX - lastTapX);
        const dy = Math.abs(t.clientY - lastTapY);

        if(dt < 300 && dx < 30 && dy < 30){
          // Toggle zoom
          const target = scale > 1 ? 1 : 2.2;
          setScale(target, t.clientX, t.clientY);
          lastTapTime = 0;
        } else {
          lastTapTime = now;
          lastTapX = t.clientX;
          lastTapY = t.clientY;
          startDrag(t.clientX, t.clientY);
        }
      }

      if(e.touches.length === 2){
        pinching = true;
        dragging = false;

        pinchStartDist = getDist(e.touches[0], e.touches[1]);
        pinchStartScale = scale;

        const mid = getMid(e.touches[0], e.touches[1]);
        pinchMidX = mid.x;
        pinchMidY = mid.y;
      }
    }, { passive:true });

    viewerImg.addEventListener("touchmove", (e) => {
      if(!imgViewer.classList.contains("show")) return;

      if(pinching && e.touches.length === 2){
        const dist = getDist(e.touches[0], e.touches[1]);
        const ratio = dist / pinchStartDist;
        const next = pinchStartScale * ratio;
        setScale(next, pinchMidX, pinchMidY);
      } else if(!pinching && e.touches.length === 1){
        const t = e.touches[0];
        moveDrag(t.clientX, t.clientY);
      }
    }, { passive:true });

    viewerImg.addEventListener("touchend", (e) => {
      if(e.touches.length === 0){
        endDrag();
        pinching = false;
      }
      if(e.touches.length === 1){
        // if pinch ended but one touch remains, re-init drag anchor
        pinching = false;
        const t = e.touches[0];
        startDrag(t.clientX, t.clientY);
      }
    });

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