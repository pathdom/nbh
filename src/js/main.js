import { products } from './products.js';
import { initTheme, toggleTheme } from './theme.js';

// --- STATE MANAGEMENT ---
let currentCategory = 'all';
let searchQuery = '';
let currentPage = 1;
const productsPerPage = 6;
let selectedColor = 'Matte Black';
let selectedSize = 'M';

// --- DOM ELEMENTS ---
let productsContainer, paginationContainer, activeFiltersContainer;
let drawerOverlay, mobileDrawer, searchModal;
let quickviewOverlay, quickviewModal;
let toastContainer;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  // Khởi tạo các phần tử DOM chính
  productsContainer = document.getElementById('products-grid');
  paginationContainer = document.getElementById('pagination');
  activeFiltersContainer = document.getElementById('active-filters');
  
  drawerOverlay = document.getElementById('drawer-overlay');
  mobileDrawer = document.getElementById('mobile-drawer');
  searchModal = document.getElementById('search-modal');
  
  quickviewOverlay = document.getElementById('quickview-overlay');
  quickviewModal = document.getElementById('quickview-modal');
  toastContainer = document.getElementById('toast-container');

  // Khởi tạo theme
  initTheme();
  setupEventListeners();

  // Render sản phẩm ban đầu
  renderProducts();
});

// --- SYNC CATEGORY FILTERS CONTROLLER ---
function syncCategoryFilters(category) {
  currentCategory = category;
  currentPage = 1;

  // Sync mobile filter drawer radios
  const mobileRadios = document.querySelectorAll('input[name="category-filter"]');
  mobileRadios.forEach(radio => {
    radio.checked = (radio.value === category);
  });

  // Sync desktop sidebar radios
  const desktopRadios = document.querySelectorAll('input[name="sidebar-category-filter"]');
  desktopRadios.forEach(radio => {
    radio.checked = (radio.value === category);
  });

  renderProducts();
  updateFilterTags();
}

// --- EVENT LISTENERS SETUP ---
function setupEventListeners() {
  // Theme Toggle
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // Hamburger Menu
  const menuBtn = document.getElementById('menu-btn');
  const drawerCloseBtn = document.getElementById('drawer-close-btn');
  if (menuBtn) {
    menuBtn.addEventListener('click', openMobileDrawer);
  }
  if (drawerCloseBtn) {
    drawerCloseBtn.addEventListener('click', closeMobileDrawer);
  }
  if (drawerOverlay) {
    drawerOverlay.addEventListener('click', () => {
      closeMobileDrawer();
      closeFilterDrawer();
    });
  }

  // Mobile Drawer Links (smooth scroll & close)
  const drawerLinks = document.querySelectorAll('.drawer-link');
  drawerLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // Search Modal
  const searchBtn = document.getElementById('search-btn');
  const searchCloseBtn = document.getElementById('search-close-btn');
  const searchInput = document.getElementById('search-input');
  if (searchBtn) {
    searchBtn.addEventListener('click', openSearchModal);
  }
  if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', closeSearchModal);
  }
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      currentPage = 1;
      renderProducts();
    });
  }

  // Filter Button and Drawer
  const filterBtn = document.getElementById('filter-btn');
  const filterDrawer = document.getElementById('filter-drawer');
  const filterCloseBtn = document.getElementById('filter-close-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', openFilterDrawer);
  }
  if (filterCloseBtn) {
    filterCloseBtn.addEventListener('click', closeFilterDrawer);
  }

  // Category filter checkboxes inside Filter Drawer
  const categoryFilters = document.querySelectorAll('input[name="category-filter"]');
  categoryFilters.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        syncCategoryFilters(e.target.value);
      }
    });
  });

  // Category filter checkboxes inside Desktop Sidebar
  const sidebarCategoryFilters = document.querySelectorAll('input[name="sidebar-category-filter"]');
  sidebarCategoryFilters.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.checked) {
        syncCategoryFilters(e.target.value);
      }
    });
  });

  // Dropdown main menu filter click
  const dropdownFilters = document.querySelectorAll('.dropdown-item[data-filter]');
  dropdownFilters.forEach(link => {
    link.addEventListener('click', () => {
      const category = link.getAttribute('data-filter');
      syncCategoryFilters(category);
    });
  });

  // Close Quick View Modal
  const quickviewCloseBtn = document.getElementById('quickview-close-btn');
  if (quickviewCloseBtn) {
    quickviewCloseBtn.addEventListener('click', closeQuickView);
  }
  if (quickviewOverlay) {
    quickviewOverlay.addEventListener('click', (e) => {
      if (e.target === quickviewOverlay) {
        closeQuickView();
      }
    });
  }

  // Right Float actions: Scroll to top
  const totopBtn = document.getElementById('totop-btn');
  if (totopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        totopBtn.classList.add('visible');
      } else {
        totopBtn.classList.remove('visible');
      }
    });
    totopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Right Float actions: Info dialog
  const infoBtn = document.getElementById('info-btn');
  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      showToast("NBH Helmet - Thương hiệu nón dẫn đầu về chất lượng và an toàn!", "success");
    });
  }

  // Newsletter Signup Form
  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }
}

// --- DRAWER CONTROLLERS ---
function openMobileDrawer() {
  mobileDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileDrawer() {
  mobileDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function openFilterDrawer() {
  const filterDrawer = document.getElementById('filter-drawer');
  filterDrawer.classList.add('active');
  drawerOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeFilterDrawer() {
  const filterDrawer = document.getElementById('filter-drawer');
  filterDrawer.classList.remove('active');
  drawerOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// --- SEARCH CONTROLLERS ---
function openSearchModal() {
  searchModal.classList.add('active');
  document.getElementById('search-input').focus();
  document.body.style.overflow = 'hidden';
}

function closeSearchModal() {
  searchModal.classList.remove('active');
  document.body.style.overflow = '';
}

// --- RENDER PRODUCTS GRID ---
function renderProducts() {
  // Lọc sản phẩm theo danh mục và từ khóa tìm kiếm
  let filtered = products;
  
  if (currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === currentCategory);
  }
  
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  // Phân trang
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / productsPerPage);
  
  // Ràng buộc trang hiện tại không vượt quá tổng số trang
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = Math.min(startIndex + productsPerPage, totalItems);
  const pageItems = filtered.slice(startIndex, endIndex);

  // Clear container trước khi render mới (XSS Safe)
  productsContainer.replaceChildren();

  if (pageItems.length === 0) {
    const noProductMsg = document.createElement('div');
    noProductMsg.style.gridColumn = '1 / -1';
    noProductMsg.style.textAlign = 'center';
    noProductMsg.style.padding = '3rem';
    noProductMsg.style.color = 'var(--text-secondary)';
    noProductMsg.textContent = 'Không tìm thấy mũ bảo hiểm nào phù hợp.';
    productsContainer.appendChild(noProductMsg);
    paginationContainer.replaceChildren();
    return;
  }

  // Tạo các thẻ sản phẩm động bằng createElement (XSS Safe)
  pageItems.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.addEventListener('click', () => openQuickView(product));

    // Khối hình ảnh
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-image-wrapper';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.className = 'product-image';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    // Huy hiệu Quick View nổi
    const quickviewBadge = document.createElement('div');
    quickviewBadge.className = 'quickview-badge';
    const badgeIcon = document.createElement('i');
    badgeIcon.className = 'ri-eye-line';
    quickviewBadge.appendChild(badgeIcon);
    imgWrapper.appendChild(quickviewBadge);

    card.appendChild(imgWrapper);

    // Khối thông tin
    const info = document.createElement('div');
    info.className = 'product-info';

    // Nhãn danh mục
    const catLbl = document.createElement('span');
    catLbl.className = 'product-category-lbl';
    catLbl.textContent = product.categoryLabel;
    info.appendChild(catLbl);

    // Dòng thông số sản phẩm & giá tiền
    const metaRow = document.createElement('div');
    metaRow.className = 'product-meta-row';

    const title = document.createElement('h3');
    title.className = 'product-title';
    title.textContent = product.name;
    metaRow.appendChild(title);

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.priceStr;
    metaRow.appendChild(price);

    info.appendChild(metaRow);
    card.appendChild(info);

    productsContainer.appendChild(card);
  });

  // Render phân trang
  renderPagination(totalPages);
}

// --- RENDER PAGINATION ---
function renderPagination(totalPages) {
  paginationContainer.replaceChildren();
  if (totalPages <= 1) return;

  // Nút lùi trang (<)
  const prevBtn = document.createElement('button');
  prevBtn.className = `page-btn ${currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.setAttribute('aria-label', 'Trang trước');
  const prevIcon = document.createElement('i');
  prevIcon.className = 'ri-arrow-left-s-line';
  prevBtn.appendChild(prevIcon);
  if (currentPage > 1) {
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderProducts();
      window.scrollTo({ top: productsContainer.offsetTop - 100, behavior: 'smooth' });
    });
  }
  paginationContainer.appendChild(prevBtn);

  // Các nút số trang
  for (let i = 1; i <= totalPages; i++) {
    const pageNumBtn = document.createElement('button');
    pageNumBtn.className = `page-btn ${currentPage === i ? 'active' : ''}`;
    pageNumBtn.textContent = i.toString();
    pageNumBtn.addEventListener('click', () => {
      currentPage = i;
      renderProducts();
      window.scrollTo({ top: productsContainer.offsetTop - 100, behavior: 'smooth' });
    });
    paginationContainer.appendChild(pageNumBtn);
  }

  // Nút tiến trang (>)
  const nextBtn = document.createElement('button');
  nextBtn.className = `page-btn ${currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.setAttribute('aria-label', 'Trang tiếp theo');
  const nextIcon = document.createElement('i');
  nextIcon.className = 'ri-arrow-right-s-line';
  nextBtn.appendChild(nextIcon);
  if (currentPage < totalPages) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderProducts();
      window.scrollTo({ top: productsContainer.offsetTop - 100, behavior: 'smooth' });
    });
  }
  paginationContainer.appendChild(nextBtn);
}

// --- FILTER TAGS CONTROLLER ---
function updateFilterTags() {
  activeFiltersContainer.replaceChildren();
  if (currentCategory === 'all') return;

  const tag = document.createElement('div');
  tag.className = 'filter-tag';
  
  const text = document.createElement('span');
  text.textContent = currentCategory === 'urban' ? 'Danh mục: Nón Đô Thị' : 'Danh mục: Nón Thể Thao';
  tag.appendChild(text);

  const clearBtn = document.createElement('span');
  clearBtn.className = 'filter-tag-clear';
  clearBtn.textContent = ' ✕';
  clearBtn.addEventListener('click', () => {
    syncCategoryFilters('all');
  });
  tag.appendChild(clearBtn);

  activeFiltersContainer.appendChild(tag);
}

// --- QUICK VIEW MODAL CONTROLLERS ---
function openQuickView(product) {
  // Gán thông tin sản phẩm (XSS Safe)
  document.getElementById('modal-img').src = product.image;
  document.getElementById('modal-img').alt = product.name;
  document.getElementById('modal-title').textContent = product.name;
  document.getElementById('modal-category').textContent = product.categoryLabel;
  document.getElementById('modal-price').textContent = product.priceStr;
  document.getElementById('modal-desc').textContent = product.description;

  // Thiết lập các option mặc định
  selectedColor = 'Matte Black';
  selectedSize = 'M';
  setupOptionSelectors();

  // Thiết lập form liên hệ trong modal
  const form = document.getElementById('modal-consultation-form');
  if (form) {
    // Reset form cũ
    form.reset();
    
    // Gỡ event listener cũ bằng cách clone node
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    
    newForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleConsultationSubmit(product, newForm);
    });
  }

  quickviewOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeQuickView() {
  quickviewOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

function setupOptionSelectors() {
  // Màu sắc
  const colors = document.querySelectorAll('.color-option');
  colors.forEach(opt => {
    // Đặt class active dựa theo màu sắc mặc định
    const colorName = opt.getAttribute('data-color');
    if (colorName === selectedColor) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }

    opt.onclick = () => {
      colors.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedColor = opt.getAttribute('data-color');
    };
  });

  // Kích cỡ
  const sizes = document.querySelectorAll('.size-option');
  sizes.forEach(opt => {
    const sizeName = opt.getAttribute('data-size');
    if (sizeName === selectedSize) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }

    opt.onclick = () => {
      sizes.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');
      selectedSize = opt.getAttribute('data-size');
    };
  });
}

// --- FORM HANDLING & VALIDATIONS ---
function handleConsultationSubmit(product, formElement) {
  const nameInput = formElement.querySelector('input[type="text"]');
  const phoneInput = formElement.querySelector('input[type="tel"]');

  const name = nameInput.value.trim();
  const phone = phoneInput.value.trim();

  // Validate Tên: Không rỗng, độ dài từ 2-50 ký tự
  if (!name || name.length < 2 || name.length > 50) {
    showToast("Vui lòng nhập tên hợp lệ (từ 2 đến 50 ký tự)!", "error");
    nameInput.focus();
    return;
  }

  // Validate Số điện thoại: Định dạng số điện thoại Việt Nam hợp lệ
  const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
  if (!phone || !phoneRegex.test(phone)) {
    showToast("Số điện thoại không đúng định dạng (VD: 0987654321)!", "error");
    phoneInput.focus();
    return;
  }

  // Giả lập gửi lên server thành công
  showToast(`Yêu cầu tư vấn mũ ${product.name} (Màu: ${selectedColor}, Size: ${selectedSize}) của quý khách ${name} đã được tiếp nhận thành công!`, "success");
  
  closeQuickView();
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const agreementCheckbox = document.getElementById('agreement-checkbox');

  const email = emailInput.value.trim();

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast("Địa chỉ Email không đúng định dạng!", "error");
    emailInput.focus();
    return;
  }

  // Validate Thỏa thuận chính sách
  if (!agreementCheckbox || !agreementCheckbox.checked) {
    showToast("Bạn cần đồng ý với các điều khoản và chính sách của NBH!", "error");
    return;
  }

  // Giả lập đăng ký thành công
  showToast("Chúc mừng! Đăng ký nhận bản tin khuyến mãi của NBH thành công.", "success");
  
  emailInput.value = '';
  agreementCheckbox.checked = false;
}

// --- CUSTOM TOAST MESSAGE CONTROLLER ---
function showToast(message, type = 'success') {
  // Tạo toast element động
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
  toast.appendChild(icon);

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  toastContainer.appendChild(toast);

  // Trigger animation hiện toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  // Auto remove sau 4s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 4000);
}
