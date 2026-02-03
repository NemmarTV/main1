// Auto post date
const postDate = document.getElementById("postDate");
if(postDate){
  postDate.textContent = new Date().toLocaleDateString("en-US", {
    year:"numeric", month:"long", day:"numeric"
  });
}

// Theme toggle
const toggle = document.getElementById("themeToggle");
const root = document.documentElement;

if(toggle){
  const saved = localStorage.getItem("theme") || "light";
  root.setAttribute("data-theme", saved);
  toggle.textContent = saved === "light" ? "☀️" : "🌙";

  toggle.onclick = () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    toggle.textContent = next === "light" ? "☀️" : "🌙";
  };
}
