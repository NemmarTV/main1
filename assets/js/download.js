    // THEME
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

    // SERVICE WORKER
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }

    // POPUP + DISABLED BUTTON CLICK (SHAKE + GLOW)
    const popup = document.getElementById("soonPopup");
    const closePopup = document.getElementById("closePopup");

    function openSoonPopup(){
      popup.classList.add("show");
      popup.setAttribute("aria-hidden", "false");
    }
    function closeSoonPopup(){
      popup.classList.remove("show");
      popup.setAttribute("aria-hidden", "true");
    }

    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".download-btn.disabled");
      if(!btn) return;

      e.preventDefault();

      btn.classList.remove("clicked");
      void btn.offsetWidth;
      btn.classList.add("clicked");

      openSoonPopup();
    });

    closePopup.addEventListener("click", closeSoonPopup);

    popup.addEventListener("click", (e) => {
      if(e.target === popup) closeSoonPopup();
    });

    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape") closeSoonPopup();
    });