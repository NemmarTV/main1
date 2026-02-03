const imgModal = document.getElementById("imgModal");
const imgModalPic = document.getElementById("imgModalPic");
const imgBackdrop = document.getElementById("imgBackdrop");

const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const resetBtn = document.getElementById("resetBtn");
const closeBtn = document.getElementById("closeBtn");
const imgStage = document.getElementById("imgStage");

let scale = 1;
let posX = 0;
let posY = 0;
let dragging = false;
let startX = 0;
let startY = 0;

function applyTransform(){
  imgModalPic.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
}

function resetView(){
  scale = 1;
  posX = 0;
  posY = 0;
  applyTransform();
}

window.openImg = function(src){
  imgModalPic.src = src;
  resetView();
  imgModal.classList.add("show");
  document.body.style.overflow = "hidden";
};

function closeImg(){
  imgModal.classList.remove("show");
  imgModalPic.src = "";
  document.body.style.overflow = "";
}

closeBtn.onclick = closeImg;
imgBackdrop.onclick = closeImg;

zoomInBtn.onclick = () => {
  scale = Math.min(6, scale + 0.25);
  applyTransform();
};

zoomOutBtn.onclick = () => {
  scale = Math.max(1, scale - 0.25);
  if(scale === 1) resetView();
  applyTransform();
};

resetBtn.onclick = resetView;

// Drag pan
imgModalPic.addEventListener("pointerdown", e => {
  if(scale <= 1) return;
  dragging = true;
  startX = e.clientX - posX;
  startY = e.clientY - posY;
  imgModalPic.classList.add("dragging");
});

window.addEventListener("pointermove", e => {
  if(!dragging) return;
  posX = e.clientX - startX;
  posY = e.clientY - startY;
  applyTransform();
});

window.addEventListener("pointerup", () => {
  dragging = false;
  imgModalPic.classList.remove("dragging");
});

// Wheel zoom
imgStage.addEventListener("wheel", e => {
  e.preventDefault();
  scale += e.deltaY > 0 ? -0.15 : 0.15;
  scale = Math.min(6, Math.max(1, scale));
  applyTransform();
}, { passive:false });

// ESC close
window.addEventListener("keydown", e => {
  if(e.key === "Escape" && imgModal.classList.contains("show")) closeImg();
});
