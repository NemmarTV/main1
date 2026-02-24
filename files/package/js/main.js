// Download Modal + Password System
// Password: cfphlu2026
// File path: from data-file on .card-inner

(() => {
  const PASSWORD = "cfphlu2026";

  const btnDownload = document.getElementById("btnDownload");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const btnClose = document.getElementById("btnClose");

  const pctText = document.getElementById("pctText");
  const barFill = document.getElementById("barFill");
  const statusText = document.getElementById("statusText");
  const btnProceed = document.getElementById("btnProceed");

  const passwordWrap = document.getElementById("passwordWrap");
  const pwInput = document.getElementById("pwInput");
  const btnConfirm = document.getElementById("btnConfirm");
  const pwError = document.getElementById("pwError");

  const cardInner = document.querySelector("#dlCard .card-inner");

  let progress = 0;
  let timer = null;

  function openModal() {
    modalBackdrop.style.display = "flex";
    modalBackdrop.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modalBackdrop.style.display = "none";
    modalBackdrop.setAttribute("aria-hidden", "true");
    stopProgress();
    resetUI();
  }

  function resetUI() {
    progress = 0;
    pctText.textContent = "0";
    barFill.style.width = "0%";
    statusText.textContent = "Starting…";
    btnProceed.disabled = true;

    passwordWrap.style.display = "none";
    pwInput.value = "";
    pwError.style.display = "none";
  }

  function stopProgress() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function simulateProgress() {
    stopProgress();
    timer = setInterval(() => {
      progress += 1;
      if (progress > 100) progress = 100;

      pctText.textContent = String(progress);
      barFill.style.width = progress + "%";

      if (progress < 30) statusText.textContent = "Preparing…";
      else if (progress < 70) statusText.textContent = "Loading files…";
      else if (progress < 100) statusText.textContent = "Finalizing…";

      if (progress >= 100) {
        stopProgress();
        statusText.textContent = "Ready to download";
        btnProceed.disabled = false;
      }
    }, 20);
  }

  function proceedToPassword() {
    passwordWrap.style.display = "block";
    pwInput.focus();
  }

  function startDownload(filePath) {
    // Create a hidden <a> to trigger browser download
    const a = document.createElement("a");
    a.href = filePath;
    a.download = ""; // lets browser decide filename
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    closeModal();
  }

  function getFilePath() {
    // from data-file="files/package/CF-PH.rar"
    const file = cardInner?.dataset?.file || "";
    return file.trim();
  }

  // Events
  btnDownload?.addEventListener("click", () => {
    resetUI();
    openModal();
    simulateProgress();
  });

  btnClose?.addEventListener("click", closeModal);

  // close on backdrop click (optional)
  modalBackdrop?.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  btnProceed?.addEventListener("click", proceedToPassword);

  btnConfirm?.addEventListener("click", () => {
    const entered = pwInput.value.trim();

    if (entered !== PASSWORD) {
      pwError.style.display = "block";
      pwInput.focus();
      pwInput.select();
      return;
    }

    pwError.style.display = "none";

    const filePath = getFilePath();
    if (!filePath) {
      statusText.textContent = "Error: File path missing.";
      return;
    }

    startDownload(filePath);
  });

  // Press Enter to confirm password
  pwInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnConfirm.click();
  });
})();



// Show password
// Show password
// Show password
// Show password
// Show password
// Show password
// Show password

    const pwInput = document.getElementById("pwInput");
    const togglePassword = document.getElementById("togglePassword");

    togglePassword.addEventListener("click", function () {
      if (pwInput.type === "password") {
        pwInput.type = "text";
        this.textContent = "🙈"; // change icon when visible
      } else {
        pwInput.type = "password";
        this.textContent = "👁";
      }
    });