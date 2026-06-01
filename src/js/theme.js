// Logic quản lý giao diện Light/Dark Mode an toàn
export function initTheme() {
  const savedTheme = localStorage.getItem("nbh-theme");
  
  // Mặc định sử dụng light theme để khớp với ảnh mẫu cảm hứng ban đầu
  const theme = savedTheme || "light";
  
  document.documentElement.setAttribute("data-theme", theme);
  updateThemeIcon(theme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("nbh-theme", newTheme);
  updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
  const themeBtn = document.getElementById("theme-toggle-btn");
  if (!themeBtn) return;
  
  const icon = themeBtn.querySelector("i");
  if (!icon) return;
  
  if (theme === "dark") {
    icon.className = "ri-sun-line"; // Biểu tượng mặt trời để quay lại light mode
    themeBtn.setAttribute("aria-label", "Chuyển sang chế độ sáng");
  } else {
    icon.className = "ri-moon-line"; // Biểu tượng mặt trăng để chuyển sang dark mode
    themeBtn.setAttribute("aria-label", "Chuyển sang chế độ tối");
  }
}
