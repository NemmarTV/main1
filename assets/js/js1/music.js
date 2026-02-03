/* =========================
   🎵 BFN MUSIC SYSTEM (FULL + MINIMIZE)
   - Volume slider
   - Shuffle button
   - Next/Prev
   - Song name
   - Remember last track + volume + shuffle + play state across pages
   - Autoplay on first user interaction
   - Minimize/Expand (PC + phone)
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

/* 🎶 PLAYLIST */
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

/* 💾 LOCAL STORAGE KEYS */
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
if (Number.isNaN(currentIndex) || currentIndex < 0 || currentIndex >= playlist.length) {
  currentIndex = 0;
}

let shuffleOn = (localStorage.getItem(LS.shuffle) ?? "0") === "1";
let wantPlaying = (localStorage.getItem(LS.playing) ?? "0") === "1";
let startedOnce = false;

/* 🔊 VOLUME RESTORE */
let savedVol = parseFloat(localStorage.getItem(LS.volume) ?? "0.5");
if (Number.isNaN(savedVol) || savedVol < 0 || savedVol > 1) savedVol = 0.5;

bgm.volume = savedVol;
volRange.value = String(Math.round(savedVol * 100));

function updateMiniBar(){
  miniStatus.textContent =
    (bgm.paused ? "⏸️ " : "▶️ ") + playlist[currentIndex].name;
}

function setSongUI(){
  songName.textContent = "🎵 " + playlist[currentIndex].name;
  trackPill.textContent = `Track: ${currentIndex + 1}/${playlist.length}`;
  modePill.textContent = shuffleOn ? "Mode: Shuffle" : "Mode: Loop";
  shuffleBtn.style.opacity = shuffleOn ? "1" : ".6";
  updateMiniBar();
}

function setStatusUI(){
  const paused = bgm.paused;
  songStatus.textContent =
    musicEnabled === "off" ? "Off" : paused ? "Paused" : "Playing";
  playBtn.textContent =
    musicEnabled === "off" ? "▶️" : paused ? "▶️" : "⏸️";
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

function pickRandomIndex(except){
  let i = Math.floor(Math.random() * playlist.length);
  if (i === except) i = (i + 1) % playlist.length;
  return i;
}

async function safePlay(){
  if (musicEnabled === "off") return;
  try {
    await bgm.play();
    startedOnce = true;
    localStorage.setItem(LS.playing, "1");
  } catch(e){}
  setStatusUI();
}

function pauseMusic(){
  bgm.pause();
  localStorage.setItem(LS.playing, "0");
  setStatusUI();
}

function nextTrack(){
  const i = shuffleOn
    ? pickRandomIndex(currentIndex)
    : (currentIndex + 1) % playlist.length;
  loadTrack(i);
  safePlay();
}

function prevTrack(){
  const i = shuffleOn
    ? pickRandomIndex(currentIndex)
    : (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(i);
  safePlay();
}

/* 🔽 MINIMIZE */
function setMinimized(min){
  if(min){
    musicWidget.classList.add("minimized");
    localStorage.setItem(LS.minimized, "1");
  }else{
    musicWidget.classList.remove("minimized");
    localStorage.setItem(LS.minimized, "0");
  }
}

minBtn.onclick = e => {
  e.preventDefault();
  e.stopPropagation();
  setMinimized(true);
};

expandBtn.onclick = e => {
  e.preventDefault();
  e.stopPropagation();
  setMinimized(false);
};

/* 🎛 CONTROLS */
playBtn.onclick = async e => {
  e.preventDefault();
  if(musicEnabled === "off"){
    musicEnabled = "on";
    localStorage.setItem(LS.enabled, "on");
    await safePlay();
    return;
  }
  bgm.paused ? safePlay() : pauseMusic();
};

nextBtn.onclick = nextTrack;
prevBtn.onclick = prevTrack;

shuffleBtn.onclick = () => {
  shuffleOn = !shuffleOn;
  localStorage.setItem(LS.shuffle, shuffleOn ? "1" : "0");
  setSongUI();
};

volRange.oninput = () => {
  const v = volRange.value / 100;
  bgm.volume = v;
  localStorage.setItem(LS.volume, String(v));
  updateMiniBar();
};

/* ▶️ AUTOPLAY AFTER FIRST USER ACTION */
function shouldTriggerBGM(target){
  return target.closest("a,button,.logo,.nav,.music-widget");
}

async function firstUserStart(e){
  if(!shouldTriggerBGM(e.target)) return;
  if(!startedOnce && wantPlaying && musicEnabled !== "off"){
    await safePlay();
  }
  document.removeEventListener("pointerdown", firstUserStart);
  document.removeEventListener("click", firstUserStart);
}

document.addEventListener("pointerdown", firstUserStart, { passive:true });
document.addEventListener("click", firstUserStart);

/* ⏹ TRACK END */
bgm.addEventListener("ended", nextTrack);

/* 💾 SAVE ON LEAVE */
window.addEventListener("beforeunload", () => {
  localStorage.setItem(LS.enabled, musicEnabled);
  localStorage.setItem(LS.index, currentIndex);
  localStorage.setItem(LS.shuffle, shuffleOn ? "1" : "0");
  localStorage.setItem(LS.volume, bgm.volume);
  localStorage.setItem(LS.playing, bgm.paused ? "0" : "1");
  localStorage.setItem(
    LS.minimized,
    musicWidget.classList.contains("minimized") ? "1" : "0"
  );
});

/* 🚀 INIT */
loadTrack(currentIndex);

if((localStorage.getItem(LS.minimized) ?? "0") === "1"){
  setMinimized(true);
}

if(musicEnabled === "off"){
  pauseMusic();
  songStatus.textContent = "Off";
}else{
  setStatusUI();
}

/* 🛠 SERVICE WORKER */
if("serviceWorker" in navigator){
  navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
