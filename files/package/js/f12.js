  // 🔐 Password before ENTER SERVER + 10s countdown
  const enterBtn = document.getElementById("enterBtn");
  const passwordInput = document.getElementById("serverPassword");
  const countdownEl = document.getElementById("countdown");
  const scanStatus = document.getElementById("scanStatus");
  const correctPassword = "2000"; // change this to your real password

  let countdown = 8;
  const timer = setInterval(() => {
    countdown--;
    countdownEl.textContent = `Wait ${countdown}s to activate button...`;
    if (countdown <= 0) {
      clearInterval(timer);
      countdownEl.textContent = "Button is now active.";
      enterBtn.disabled = false;
    }
  }, 1000);

  // Fake scanning animation
  let dots = 0;
  setInterval(() => {
    dots = (dots + 1) % 4;
    scanStatus.textContent = "Anti-Cheat Scanning" + ".".repeat(dots);
  }, 500);

  // Enter button click
  enterBtn.addEventListener("click", () => {
    if (passwordInput.value === correctPassword) {
      document.getElementById("serverLock").style.display = "none";
    } else {
      alert("Incorrect password! Access denied.");
    }
  });

  // 🚫 Disable right-click + F12
  document.addEventListener("contextmenu", e => e.preventDefault());
  document.addEventListener("keydown", e => {
    if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i")) {
      e.preventDefault();
    }
  });