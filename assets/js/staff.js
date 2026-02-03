/* =========================
   ✅ THEME TOGGLE (ONE ONLY)
========================= */
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

const savedTheme = localStorage.getItem("theme") || "light";
root.setAttribute("data-theme", savedTheme);
toggle.textContent = savedTheme === "light" ? "☀️" : "🌙";

toggle.addEventListener("click", () => {
  const newTheme = root.getAttribute("data-theme") === "light" ? "dark" : "light";
  root.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  toggle.textContent = newTheme === "light" ? "☀️" : "🌙";
});

/* =========================
   AVATAR SETTINGS
========================= */
const PROFILE_PATH = "images/profile/";
const defaultAvatar = "https://img.icons8.com/?size=100&id=7819&format=png&color=000000";

function localAvatar(filename){ return PROFILE_PATH + filename; }

function setAvatar(imgEl, src){
  imgEl.src = src || defaultAvatar;
  imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = defaultAvatar; };
}

/* =========================
   PROFILE MODAL (ONE ONLY)
========================= */
const profileModal = document.getElementById("profileModal");
const modalBox = document.getElementById("modalBox");
const modalBadge = document.getElementById("modalBadge");
const profileName = document.getElementById("profileName");
const profileRole = document.getElementById("profileRole");
const profileRoles = document.getElementById("profileRoles");
const profileDesc = document.getElementById("profileDesc");
const profileAvatar = document.getElementById("profileAvatar");

function openProfile(member, style){
  profileName.textContent = member.name;

  const primaryRole = (member.roles && member.roles.length) ? member.roles[0] : "Member";
  profileRole.textContent = "Role: " + primaryRole;

  const rolesLine = (member.roles && member.roles.length)
    ? ("All Roles: " + member.roles.join(" • "))
    : "";
  profileRoles.textContent = rolesLine;

  profileDesc.textContent = member.desc || "";
  setAvatar(profileAvatar, member.avatar);

  modalBox.className = "modal-box " + (style.cls || "") + (style.glow ? " glow-booster" : "");
  modalBadge.textContent = style.badge || "";

  profileModal.style.display = "flex";
}
function closeProfile(){ profileModal.style.display = "none"; }

// ESC to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeProfile();
});

/* =========================
   RAW STAFF DATA (can contain duplicates)
========================= */
const rawStaffData = [
  { name:"CMNems[LU]™", role:"Clan Master", rank:"cm", desc:"Founder and leader of Bisaya Fire Nation.", avatar: localAvatar("cmnems.jpg") },
];

/* =========================
   MERGE DUPLICATES (by normalized name)
========================= */
function normalizeName(n){
  return String(n || "")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\|/g, " | ")
    .replace(/\s+\|\s+/g, " | ")
    .toLowerCase();
}

function mergeStaff(list){
  const map = new Map();

  for(const item of list){
    const key = normalizeName(item.name);
    if(!key) continue;

    if(!map.has(key)){
      map.set(key, {
        name: item.name,
        avatar: item.avatar,
        desc: item.desc || "",
        roles: item.role ? [item.role] : [],
        ranks: item.rank ? [item.rank] : [],
      });
      continue;
    }

    const existing = map.get(key);

    if(String(item.name || "").length > String(existing.name || "").length){
      existing.name = item.name;
    }

    if(!existing.avatar && item.avatar) existing.avatar = item.avatar;

    const a = String(existing.desc || "");
    const b = String(item.desc || "");
    if(b.length > a.length) existing.desc = b;

    if(item.role && !existing.roles.includes(item.role)) existing.roles.push(item.role);
    if(item.rank && !existing.ranks.includes(item.rank)) existing.ranks.push(item.rank);
  }

  return Array.from(map.values());
}

let staffData = mergeStaff(rawStaffData);

/* =========================
   SHUFFLE
========================= */
function shuffle(array){
  for(let i = array.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(staffData);

/* =========================
   RANK PRIORITY + STYLE
========================= */
const rankPriority = ["cm", "council", "event", "booster", "other"];

function primaryRank(member){
  const ranks = member.ranks || [];
  for(const r of rankPriority){
    if(ranks.includes(r)) return r;
  }
  return "other";
}

function getRankStyleForMember(member){
  const rank = primaryRank(member);
  const hasBooster = (member.ranks || []).includes("booster");

  if(rank === "cm") return { cls: "rank-cm", badge: "👑", glow:false };
  if(rank === "council") return { cls: "rank-council", badge: "🔥", glow:false };
  if(rank === "event") return { cls: "rank-event", badge: "🎯", glow:false };
  if(rank === "booster") return { cls: "rank-booster", badge: "🚀", glow:true };

  return { cls: "", badge: "", glow: hasBooster };
}

/* =========================
   RENDER STAFF
========================= */
const staffList = document.getElementById("staffList");

function displayRoles(member){
  const roles = member.roles || [];
  if(!roles.length) return "Member";
  if(roles.length <= 2) return roles.join(" • ");
  return roles.slice(0,2).join(" • ") + ` • +${roles.length - 2}`;
}

function matchesFilter(member, filter){
  if(filter === "all") return true;
  const ranks = member.ranks || [];
  return ranks.includes(filter);
}

function renderStaff(filter){
  staffList.innerHTML = "";

  staffData
    .filter(m => matchesFilter(m, filter))
    .forEach(member => {
      const style = getRankStyleForMember(member);

      const card = document.createElement("div");
      card.className = "staff-card " + (style.cls || "") + (style.glow ? " glow-booster" : "");

      card.innerHTML = `
        <div class="rank-badge">${style.badge || ""}</div>
        <div class="staff-avatar"><img alt="Avatar"></div>
        <div>
          <div class="staff-name">${member.name}</div>
          <div class="staff-role">${displayRoles(member)}</div>
        </div>
      `;

      const img = card.querySelector(".staff-avatar img");
      setAvatar(img, member.avatar);

      card.addEventListener("click", () => openProfile(member, style));
      staffList.appendChild(card);
    });
}
renderStaff("all");

/* FILTER BUTTONS */
const filtersWrap = document.getElementById("staffFilters");
filtersWrap.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if(!btn) return;

  const filter = btn.dataset.filter;

  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  renderStaff(filter);
});

/* =========================
   🎵 BFN MUSIC SYSTEM (FULL + MINIMIZE)
   - FIXED: removed duplicate modal/theme code
   - FIXED: removed broken localStorage key with weird quote
   - FIXED: name typo for bgm_0010.ogg
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
  { src: "sounds/bgm_0010.ogg", name: "bgm_0010.ogg" }, /* ✅ fixed name */
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
  enabled:   "bfn_music_enabled",    // "on"/"off"
  index:     "bfn_music_index",      // 0..n-1
  volume:    "bfn_music_volume",     // 0..1
  shuffle:   "bfn_music_shuffle",    // 0/1
  playing:   "bfn_music_playing",    // 0/1
  minimized: "bfn_music_minimized"   // 0/1
};

// Cleanup: remove older broken key if it exists (with weird apostrophe)
try{
  for (let i = 0; i < localStorage.length; i++){
    const k = localStorage.key(i);
    if (k && k.includes("bfn_music_play") && k !== LS.playing){
      const v = localStorage.getItem(k);
      if (localStorage.getItem(LS.playing) === null && v != null) localStorage.setItem(LS.playing, v);
      localStorage.removeItem(k);
    }
  }
}catch(_){}

let musicEnabled = localStorage.getItem(LS.enabled) ?? "on";

let currentIndex = parseInt(localStorage.getItem(LS.index) ?? "0", 10);
if (Number.isNaN(currentIndex) || currentIndex < 0 || currentIndex >= playlist.length) currentIndex = 0;

let shuffleOn = (localStorage.getItem(LS.shuffle) ?? "0") === "1";
let wantPlaying = (localStorage.getItem(LS.playing) ?? "0") === "1";
let startedOnce = false;

// Volume restore
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
  }catch(e){
    // blocked until user gesture
  }
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

/* Minimize */
function setMinimized(min){
  if (min){
    musicWidget.classList.add("minimized");
    localStorage.setItem(LS.minimized, "1");
  }else{
    musicWidget.classList.remove("minimized");
    localStorage.setItem(LS.minimized, "0");
  }
}

minBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  setMinimized(true);
});

expandBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  setMinimized(false);
});

// Track ended -> next
bgm.addEventListener("ended", nextTrack);

// Buttons
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

// Autoplay on first interaction (browser rule)
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

// Save on unload
window.addEventListener("beforeunload", () => {
  localStorage.setItem(LS.enabled, musicEnabled);
  localStorage.setItem(LS.index, String(currentIndex));
  localStorage.setItem(LS.shuffle, shuffleOn ? "1" : "0");
  localStorage.setItem(LS.volume, String(bgm.volume));
  localStorage.setItem(LS.playing, bgm.paused ? "0" : "1");
  localStorage.setItem(LS.minimized, musicWidget.classList.contains("minimized") ? "1" : "0");
});

// Init
loadTrack(currentIndex);

const wasMin = (localStorage.getItem(LS.minimized) ?? "0") === "1";
if (wasMin) setMinimized(true);

if (musicEnabled === "off"){
  pauseMusic();
  songStatus.textContent = "Off";
} else {
  setStatusUI();
}

/* ✅ SERVICE WORKER (ONE ONLY) */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch(() => {});
}