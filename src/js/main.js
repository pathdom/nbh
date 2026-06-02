import { products as initialProducts } from './products.js';
import { initTheme, toggleTheme } from './theme.js';

// --- STATE MANAGEMENT ---
// Khởi tạo dữ liệu sản phẩm động từ localStorage hoặc dữ liệu tĩnh ban đầu
let products = JSON.parse(localStorage.getItem('poc_products')) || [...initialProducts];

// Hàm đồng bộ lưu trữ sản phẩm vào LocalStorage
function saveProductsToStorage() {
  localStorage.setItem('poc_products', JSON.stringify(products));
}

let selectedCategories = []; // Danh mục lọc được chọn (sport, urban, kids, accessories)
let priceMin = 0;           // Giá tối thiểu lọc
let priceMax = 10000000;     // Giá tối đa lọc
let selectedColorFilter = 'plum'; // Màu sắc được chọn lọc (mặc định 'plum')
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
let homepageView, catalogView;
let adminProductOverlay, adminProductForm;

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

  homepageView = document.getElementById('homepage-view');
  catalogView = document.getElementById('catalog-view');
  
  adminProductOverlay = document.getElementById('admin-product-overlay');
  adminProductForm = document.getElementById('admin-product-form');

  // Khởi tạo theme
  initTheme();
  
  // Khởi tạo các bộ lọc bên trái (Left Filters)
  initCategoryCheckboxes();
  initPriceSliders();
  setupColorSwatches();
  
  setupEventListeners();

  // Khởi tạo logic và dữ liệu cho Trang Chủ
  initHomepage();

  // Khởi tạo biểu mẫu Quản Trị
  initAdminForm();

  // Render sản phẩm ban đầu cho Catalog
  renderProducts();
  updateFilterTags();

  // Lắng nghe sự kiện thay đổi Hash trên trình duyệt (SPA Hash Routing)
  window.addEventListener('hashchange', () => {
    handleUrlRouting();
  });

  // Tự động phân tích URL hiện tại để hiển thị Chế độ xem thích hợp lúc tải trang
  handleUrlRouting();
});

// --- HELPER FOR SOFT SWATCH BG COLORS (UX DECORATION) ---
function getSelectedColorRGBA(colorName) {
  const mapping = {
    'white': 'rgba(255, 255, 255, 0.95)',
    'red': 'rgba(229, 62, 62, 0.08)',
    'grey': 'rgba(138, 123, 128, 0.08)',
    'plum': 'rgba(94, 46, 97, 0.08)',
    'white-alt': 'rgba(248, 250, 252, 0.95)',
    'slate': 'rgba(109, 116, 145, 0.08)',
    'black': 'rgba(34, 34, 34, 0.08)',
    'yellow': 'rgba(255, 199, 0, 0.08)',
    'orange': 'rgba(255, 111, 0, 0.08)',
    'pink': 'rgba(255, 94, 230, 0.08)',
    'purple': 'rgba(189, 0, 255, 0.08)',
    'blue': 'rgba(15, 72, 218, 0.08)',
    'cyan': 'rgba(44, 229, 233, 0.08)',
    'indigo': 'rgba(91, 33, 182, 0.08)'
  };
  return mapping[colorName] || '#f5f5f7';
}

// --- SYNC CATEGORY FILTERS CONTROLLER ---
function syncCategoryFilters(category) {
  currentPage = 1;

  const desktopChecks = document.querySelectorAll('input[name="desktop-cat-filter"]');
  const mobileChecks = document.querySelectorAll('input[name="mobile-cat-filter"]');

  if (category === 'all') {
    selectedCategories = [];
    desktopChecks.forEach(chk => chk.checked = false);
    mobileChecks.forEach(chk => chk.checked = false);
  } else {
    selectedCategories = [category];
    desktopChecks.forEach(chk => chk.checked = (chk.value === category));
    mobileChecks.forEach(chk => chk.checked = (chk.value === category));
  }

  // Cập nhật URL chuyển sang giao diện cửa hàng và kích hoạt view Catalog
  navigateTo('/san-pham');

  renderProducts();
  updateFilterTags();
}

// --- CATEGORY CHECKBOXES SYNC & FILTER LOGIC ---
function initCategoryCheckboxes() {
  const desktopChecks = document.querySelectorAll('input[name="desktop-cat-filter"]');
  const mobileChecks = document.querySelectorAll('input[name="mobile-cat-filter"]');

  function syncAndFilter() {
    const activeCats = [];
    desktopChecks.forEach(chk => {
      if (chk.checked) activeCats.push(chk.value);
    });

    selectedCategories = activeCats;
    currentPage = 1;
    renderProducts();
    updateFilterTags();
  }

  desktopChecks.forEach(chk => {
    chk.addEventListener('change', (e) => {
      const mobMatch = document.querySelector(`input[name="mobile-cat-filter"][value="${e.target.value}"]`);
      if (mobMatch) mobMatch.checked = e.target.checked;
      syncAndFilter();
    });
  });

  mobileChecks.forEach(chk => {
    chk.addEventListener('change', (e) => {
      const deskMatch = document.querySelector(`input[name="desktop-cat-filter"][value="${e.target.value}"]`);
      if (deskMatch) deskMatch.checked = e.target.checked;
      syncAndFilter();
    });
  });
}

// --- PRICE SLIDER SYNC & FILTER LOGIC ---
function initPriceSliders() {
  const desktopMin = document.getElementById('desktop-price-min');
  const desktopMax = document.getElementById('desktop-price-max');
  const mobileMin = document.getElementById('mobile-price-min');
  const mobileMax = document.getElementById('mobile-price-max');

  function updateSlider(minInput, maxInput, minLbl, maxLbl, track) {
    let minVal = parseInt(minInput.value);
    let maxVal = parseInt(maxInput.value);

    // Giới hạn không chồng lấn (khoảng cách tối thiểu 500.000đ)
    const gap = 500000;
    if (maxVal - minVal < gap) {
      if (document.activeElement === minInput) {
        minInput.value = maxVal - gap;
        minVal = maxVal - gap;
      } else {
        maxInput.value = minVal + gap;
        maxVal = minVal + gap;
      }
    }

    priceMin = minVal;
    priceMax = maxVal;

    // Định dạng nhãn hiển thị tiền tệ
    minLbl.textContent = minVal === 0 ? "0đ" : (minVal / 1000000) + "Mđ";
    maxLbl.textContent = maxVal === 10000000 ? "10.000.000đ" : (maxVal / 1000000) + "Mđ";

    // Cập nhật thanh ray màu vàng nằm giữa 2 nút trượt
    const minPercent = (minVal / 10000000) * 100;
    const maxPercent = (maxVal / 10000000) * 100;
    track.style.left = minPercent + "%";
    track.style.width = (maxPercent - minPercent) + "%";
  }

  function syncAndRender(sourceMin, sourceMax, destMin, destMax, minLbl, maxLbl, track) {
    updateSlider(sourceMin, sourceMax, minLbl, maxLbl, track);
    
    // Đồng bộ sang slider đối ứng
    destMin.value = sourceMin.value;
    destMax.value = sourceMax.value;
    
    // Cập nhật nhãn & thanh ray của slider đối ứng
    const destMinLbl = document.getElementById(destMin.id === 'desktop-price-min' ? 'desktop-price-min-lbl' : 'mobile-price-min-lbl');
    const destMaxLbl = document.getElementById(destMax.id === 'desktop-price-max' ? 'desktop-price-max-lbl' : 'mobile-price-max-lbl');
    const destTrack = document.getElementById(destMin.id === 'desktop-price-min' ? 'desktop-slider-track' : 'mobile-slider-track');
    
    const minVal = parseInt(destMin.value);
    const maxVal = parseInt(destMax.value);
    destMinLbl.textContent = minVal === 0 ? "0đ" : (minVal / 1000000) + "Mđ";
    destMaxLbl.textContent = maxVal === 10000000 ? "10.000.000đ" : (maxVal / 1000000) + "Mđ";
    
    const minPercent = (minVal / 10000000) * 100;
    const maxPercent = (maxVal / 10000000) * 100;
    destTrack.style.left = minPercent + "%";
    destTrack.style.width = (maxPercent - minPercent) + "%";

    currentPage = 1;
    renderProducts();
    updateFilterTags();
  }

  if (desktopMin && desktopMax) {
    const desktopMinLbl = document.getElementById('desktop-price-min-lbl');
    const desktopMaxLbl = document.getElementById('desktop-price-max-lbl');
    const desktopTrack = document.getElementById('desktop-slider-track');

    desktopMin.addEventListener('input', () => syncAndRender(desktopMin, desktopMax, mobileMin, mobileMax, desktopMinLbl, desktopMaxLbl, desktopTrack));
    desktopMax.addEventListener('input', () => syncAndRender(desktopMin, desktopMax, mobileMin, mobileMax, desktopMinLbl, desktopMaxLbl, desktopTrack));
  }

  if (mobileMin && mobileMax) {
    const mobileMinLbl = document.getElementById('mobile-price-min-lbl');
    const mobileMaxLbl = document.getElementById('mobile-price-max-lbl');
    const mobileTrack = document.getElementById('mobile-slider-track');

    mobileMin.addEventListener('input', () => syncAndRender(mobileMin, mobileMax, desktopMin, desktopMax, mobileMinLbl, mobileMaxLbl, mobileTrack));
    mobileMax.addEventListener('input', () => syncAndRender(mobileMin, mobileMax, desktopMin, desktopMax, mobileMinLbl, mobileMaxLbl, mobileTrack));
  }
}

// --- COLOR SWATCH SYNC & STYLE DECORATION ---
function setupColorSwatches() {
  const swatches = document.querySelectorAll('.color-swatch');
  
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      const color = swatch.getAttribute('data-color');
      selectedColorFilter = color;
      
      // Xoá tích cũ ở toàn bộ lưới swatches (Cả desktop & mobile)
      swatches.forEach(s => {
        s.classList.remove('checked-swatch');
        s.replaceChildren(); // Xoá dấu tích cũ
      });
      
      // Đồng bộ kích hoạt dấu tích vàng cho các swatches cùng màu ở 2 vùng
      const matches = document.querySelectorAll(`.color-swatch[data-color="${color}"]`);
      matches.forEach(m => {
        m.classList.add('checked-swatch');
        const icon = document.createElement('i');
        icon.className = 'ri-check-line swatch-check';
        m.appendChild(icon);
      });
      
      const colorLabel = (c) => {
        const labels = {
          'white': 'Trắng', 'red': 'Đỏ hồng', 'grey': 'Xám', 'plum': 'Tím Mận',
          'white-alt': 'Trắng sữa', 'slate': 'Xám xanh', 'black': 'Đen nhám',
          'yellow': 'Vàng', 'orange': 'Cam', 'pink': 'Hồng phấn', 'purple': 'Tím tươi',
          'blue': 'Xanh dương', 'cyan': 'Xanh ngọc', 'indigo': 'Tím đậm'
        };
        return labels[c] || c;
      };
      
      showToast(`Đã chuyển sang phối màu: ${colorLabel(color)}!`, 'success');
      
      // Render lại sản phẩm để cập nhật màu nền mềm mại của hộp ảnh
      renderProducts();
    });
  });
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
  const filterCloseBtn = document.getElementById('filter-close-btn');
  if (filterBtn) {
    filterBtn.addEventListener('click', openFilterDrawer);
  }
  if (filterCloseBtn) {
    filterCloseBtn.addEventListener('click', closeFilterDrawer);
  }

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
      showToast("POC Helmet - Thương hiệu nón dẫn đầu về chất lượng và an toàn!", "success");
    });
  }

  // View Switchers click events using Client-side SPA Router
  const navHome = document.getElementById('nav-home');
  const mobNavHome = document.getElementById('mob-nav-home');
  const brandLogo = document.getElementById('nbh-brand-logo');
  const navCatalog = document.getElementById('nav-catalog');
  const navAbout = document.getElementById('nav-about');
  const navContact = document.getElementById('nav-contact');

  if (navHome) {
    navHome.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/trang-chu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (mobNavHome) {
    mobNavHome.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      navigateTo('/trang-chu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (brandLogo) {
    brandLogo.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/trang-chu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (navCatalog) {
    navCatalog.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/san-pham');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  if (navAbout) {
    navAbout.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/ve-poc');
      const target = document.getElementById('lien-he');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }
  if (navContact) {
    navContact.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/lien-he');
      const target = document.getElementById('lien-he');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
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

// Keep existing search modal close clean
function closeSearchModal() {
  searchModal.classList.remove('active');
  document.body.style.overflow = '';
}

// --- RENDER PRODUCTS GRID ---
function renderProducts() {
  // Lọc sản phẩm theo danh mục, khoảng giá và từ khóa tìm kiếm
  let filtered = products;
  
  // 1. Lọc theo danh mục đã chọn
  if (selectedCategories.length > 0) {
    filtered = filtered.filter(p => selectedCategories.includes(p.category));
  }
  
  // 2. Lọc theo khoảng giá tối thiểu - tối đa
  filtered = filtered.filter(p => p.price >= priceMin && p.price <= priceMax);
  
  // 3. Lọc theo từ khóa tìm kiếm nhập vào
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
  }

  // Phân trang
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / productsPerPage);
  
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
  const isAdminMode = catalogView && catalogView.classList.contains('admin-mode');
  pageItems.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('data-id', product.id);
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.admin-act-btn')) {
        openQuickView(product);
      }
    });

    // Khối hình ảnh
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-image-wrapper';
    
    // Áp dụng màu nền mềm mại phù hợp với màu swatch đang được chọn
    imgWrapper.style.backgroundColor = getSelectedColorRGBA(selectedColorFilter);

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.className = 'product-image';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    if (isAdminMode) {
      // DỰNG OVERLAY LỚP PHỦ NÚT EDIT & DELETE QUẢN TRỊ
      const actionsBar = document.createElement('div');
      actionsBar.className = 'admin-actions-bar';

      // Nút Sửa (Edit)
      const editBtn = document.createElement('button');
      editBtn.className = 'admin-act-btn edit-btn';
      editBtn.setAttribute('aria-label', `Sửa sản phẩm ${product.name}`);
      const editIcon = document.createElement('i');
      editIcon.className = 'ri-edit-line';
      editBtn.appendChild(editIcon);
      
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('admin-form-id').value = product.id;
        document.getElementById('admin-form-name').value = product.name;
        document.getElementById('admin-form-category').value = product.category;
        document.getElementById('admin-form-price').value = product.price;
        document.getElementById('admin-form-image').value = product.image;
        document.getElementById('admin-form-desc').value = product.description;
        document.getElementById('admin-modal-title').textContent = 'CẬP NHẬT SẢN PHẨM';
        adminProductOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
      });

      // Nút Xóa (Delete)
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'admin-act-btn delete-btn';
      deleteBtn.setAttribute('aria-label', `Xóa sản phẩm ${product.name}`);
      const deleteIcon = document.createElement('i');
      deleteIcon.className = 'ri-delete-bin-line';
      deleteBtn.appendChild(deleteIcon);

      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const confirmDel = confirm(`Bạn có chắc chắn muốn xóa mũ bảo hiểm "${product.name}" khỏi cơ sở dữ liệu không?`);
        if (confirmDel) {
          products = products.filter(p => p.id !== product.id);
          saveProductsToStorage();
          showToast(`Đã xóa sản phẩm "${product.name}" khỏi kho!`, "success");
          renderProducts();
          if (typeof renderHomeCategoryProducts === 'function') {
            renderHomeCategoryProducts('urban');
          }
        }
      });

      actionsBar.appendChild(editBtn);
      actionsBar.appendChild(deleteBtn);
      imgWrapper.appendChild(actionsBar);
    } else {
      // Huy hiệu Quick View nổi
      const quickviewBadge = document.createElement('div');
      quickviewBadge.className = 'quickview-badge';
      const badgeIcon = document.createElement('i');
      badgeIcon.className = 'ri-eye-line';
      quickviewBadge.appendChild(badgeIcon);
      imgWrapper.appendChild(quickviewBadge);
    }

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
  
  const tagList = [];
  
  // Category tags
  if (selectedCategories.length > 0) {
    const labels = {
      'sport': 'Thể thao',
      'urban': 'Xe máy/Đô thị',
      'kids': 'Trẻ em',
      'accessories': 'Phụ kiện'
    };
    selectedCategories.forEach(cat => {
      tagList.push({
        label: `Danh mục: ${labels[cat] || cat}`,
        clear: () => {
          const chk = document.querySelector(`input[name="desktop-cat-filter"][value="${cat}"]`);
          if (chk) {
            chk.checked = false;
            chk.dispatchEvent(new Event('change'));
          }
        }
      });
    });
  }
  
  // Price tag if not default
  if (priceMin > 0 || priceMax < 10000000) {
    const formattedMin = priceMin.toLocaleString('vi-VN') + 'đ';
    const formattedMax = priceMax.toLocaleString('vi-VN') + 'đ';
    tagList.push({
      label: `Giá: ${formattedMin} - ${formattedMax}`,
      clear: () => {
        const deskMin = document.getElementById('desktop-price-min');
        const deskMax = document.getElementById('desktop-price-max');
        if (deskMin && deskMax) {
          deskMin.value = 0;
          deskMax.value = 10000000;
          deskMin.dispatchEvent(new Event('input'));
        }
      }
    });
  }

  // Render tags
  tagList.forEach(item => {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    
    const text = document.createElement('span');
    text.textContent = item.label;
    tag.appendChild(text);

    const clearBtn = document.createElement('span');
    clearBtn.className = 'filter-tag-clear';
    clearBtn.textContent = ' ✕';
    clearBtn.style.cursor = 'pointer';
    clearBtn.addEventListener('click', item.clear);
    tag.appendChild(clearBtn);

    activeFiltersContainer.appendChild(tag);
  });
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
    form.reset();
    
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
  const colors = document.querySelectorAll('.color-option');
  colors.forEach(opt => {
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

  if (!name || name.length < 2 || name.length > 50) {
    showToast("Vui lòng nhập tên hợp lệ (từ 2 đến 50 ký tự)!", "error");
    nameInput.focus();
    return;
  }

  const phoneRegex = /^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/;
  if (!phone || !phoneRegex.test(phone)) {
    showToast("Số điện thoại không đúng định dạng (VD: 0987654321)!", "error");
    phoneInput.focus();
    return;
  }

  showToast(`Yêu cầu tư vấn mũ ${product.name} (Màu: ${selectedColor}, Size: ${selectedSize}) của quý khách ${name} đã được tiếp nhận thành công!`, "success");
  closeQuickView();
}

function handleNewsletterSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('newsletter-email');
  const agreementCheckbox = document.getElementById('agreement-checkbox');

  const email = emailInput.value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    showToast("Địa chỉ Email không đúng định dạng!", "error");
    emailInput.focus();
    return;
  }

  if (!agreementCheckbox || !agreementCheckbox.checked) {
    showToast("Bạn cần đồng ý với các điều khoản và chính sách của NBH!", "error");
    return;
  }

  showToast("Chúc mừng! Đăng ký nhận bản tin khuyến mãi của NBH thành công.", "success");
  emailInput.value = '';
  agreementCheckbox.checked = false;
}

// --- CUSTOM TOAST MESSAGE CONTROLLER ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = document.createElement('i');
  icon.className = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';
  toast.appendChild(icon);

  const text = document.createElement('span');
  text.textContent = message;
  toast.appendChild(text);

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('show');
  }, 50);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toastContainer.removeChild(toast);
    }, 300);
  }, 4000);
}

// --- GLOBAL VIEW SWITCHER ---
export function switchView(viewName) {
  const homepageView = document.getElementById('homepage-view');
  const catalogView = document.getElementById('catalog-view');
  const navHome = document.getElementById('nav-home');
  const navCatalog = document.getElementById('nav-catalog');
  const adminAddBtn = document.getElementById('admin-add-product-btn');
  const mainTitle = document.getElementById('catalog-main-title');

  if (!homepageView || !catalogView) return;

  if (viewName === 'home') {
    homepageView.style.display = 'block';
    catalogView.style.display = 'none';
    catalogView.classList.remove('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (mainTitle) mainTitle.textContent = 'Nón Bảo Hiểm';

    // Đánh dấu active navigation pill
    if (navHome) navHome.classList.add('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
  } else if (viewName === 'catalog') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'block';
    catalogView.classList.remove('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (mainTitle) mainTitle.textContent = 'Nón Bảo Hiểm';

    // Đánh dấu active navigation pill
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.add('active-nav-pill');
    
    renderProducts();
  } else if (viewName === 'admin') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'block';
    catalogView.classList.add('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'inline-flex';
    if (mainTitle) mainTitle.textContent = 'QUẢN LÝ SẢN PHẨM';

    // Xoá active navigation pill vì đây là chế độ admin quản trị riêng
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');

    renderProducts();
  }
}

// --- HOMEPAGE LOGIC & CAROUSELS ---
function initHomepage() {
  // 1. HERO SLIDER CAROUSEL LOGIC
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.carousel-indicators-bar .indicator');
  let currentHeroSlideIndex = 0;
  let heroAutoplayTimer = null;

  function showHeroSlide(index) {
    if (slides.length === 0) return;
    
    // Đảm bảo chỉ số nằm trong giới hạn
    if (index >= slides.length) index = 0;
    if (index < 0) index = slides.length - 1;
    
    currentHeroSlideIndex = index;

    // Reset classes
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(ind => ind.classList.remove('active'));

    // Kích hoạt slide hiện tại
    slides[currentHeroSlideIndex].classList.add('active');
    if (indicators[currentHeroSlideIndex]) {
      indicators[currentHeroSlideIndex].classList.add('active');
    }
  }

  function startHeroAutoplay() {
    stopHeroAutoplay();
    heroAutoplayTimer = setInterval(() => {
      showHeroSlide(currentHeroSlideIndex + 1);
    }, 5000); // Tự động trượt mỗi 5 giây
  }

  function stopHeroAutoplay() {
    if (heroAutoplayTimer) {
      clearInterval(heroAutoplayTimer);
    }
  }

  // Đăng ký sự kiện Click cho Indicators của Hero
  indicators.forEach((ind, idx) => {
    ind.addEventListener('click', () => {
      stopHeroAutoplay();
      showHeroSlide(idx);
      startHeroAutoplay();
    });
  });

  // Khởi động trượt tự động
  startHeroAutoplay();

  // 2. FEATURED PRODUCTS QUICK VIEW BINDINGS
  const featuredCards = document.querySelectorAll('.featured-product-card');
  featuredCards.forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const product = products.find(p => p.id === id);
      if (product) {
        openQuickView(product);
      }
    });
  });

  // Featured indicators click interaction
  const featIndicators = document.querySelectorAll('.feat-indicator');
  featIndicators.forEach((ind, idx) => {
    ind.addEventListener('click', () => {
      featIndicators.forEach(i => i.classList.remove('active'));
      ind.classList.add('active');
      showToast(`Đang hiển thị nhóm sản phẩm nổi bật bộ sưu tập ${idx + 1}!`, 'success');
      
      // Hiệu ứng dịch chuyển nhẹ lưới sản phẩm tạo cảm giác trượt thật
      const grid = document.getElementById('featured-products-grid');
      if (grid) {
        grid.style.transform = `translateX(${(idx * -5) % 15}px)`;
        setTimeout(() => {
          grid.style.transform = 'translateX(0)';
        }, 300);
      }
    });
  });

  // 3. CATEGORY TABS LOGIC (NỀN TỐI)
  const categoryTabs = document.querySelectorAll('.cat-tab-btn');
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');
      
      // Cập nhật class active
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      // Render các sản phẩm thuộc danh mục
      renderHomeCategoryProducts(category);
    });
  });

  // Tải danh mục mặc định ban đầu là 'urban' trên Trang Chủ
  renderHomeCategoryProducts('urban');

  // 4. CROSS-PAGE INTER-NAVIGATION
  const catalogNavButtons = document.querySelectorAll('[data-action="go-to-catalog"]');
  catalogNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCat = btn.getAttribute('data-cat');
      
      if (targetCat) {
        syncCategoryFilters(targetCat);
      } else {
        navigateTo('/san-pham');
      }

      // Cuộn lên vị trí danh sách sản phẩm
      const targetSection = document.getElementById('san-pham');
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
}

// --- RENDER PRODUCTS GRID IN DARK CATEGORY TAB ---
function renderHomeCategoryProducts(category) {
  const container = document.getElementById('home-categories-products');
  if (!container) return;

  // Xóa nội dung cũ an toàn (XSS Safe)
  container.replaceChildren();

  // Lọc sản phẩm thuộc danh mục được chọn, lấy tối đa 3 sản phẩm để hiển thị lưới 3 cột
  const filteredProducts = products.filter(p => p.category === category).slice(0, 3);

  if (filteredProducts.length === 0) {
    const noMsg = document.createElement('div');
    noMsg.style.gridColumn = '1 / -1';
    noMsg.style.textAlign = 'center';
    noMsg.style.padding = '3rem';
    noMsg.style.color = 'rgba(255, 255, 255, 0.4)';
    noMsg.textContent = 'Hiện chưa có sản phẩm nào thuộc nhóm danh mục này.';
    container.appendChild(noMsg);
    return;
  }

  // Khởi tạo thẻ sản phẩm động bằng createElement (XSS Safe)
  filteredProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'featured-product-card';
    card.addEventListener('click', () => openQuickView(product));

    // Khối hình ảnh
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'featured-img-wrapper';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.className = 'featured-img';
    img.loading = 'lazy';
    imgWrapper.appendChild(img);

    card.appendChild(imgWrapper);

    // Khối thông tin
    const info = document.createElement('div');
    info.className = 'featured-product-info';

    const catLbl = document.createElement('span');
    catLbl.className = 'featured-product-cat';
    catLbl.textContent = product.categoryLabel;
    info.appendChild(catLbl);

    const title = document.createElement('h3');
    title.className = 'featured-product-title';
    title.textContent = product.name;
    info.appendChild(title);

    const price = document.createElement('span');
    price.className = 'featured-product-price';
    price.textContent = product.priceStr;
    info.appendChild(price);

    card.appendChild(info);
    container.appendChild(card);
  });
}

// --- CLIENT-SIDE ROUTER HELPER ---
function navigateTo(path) {
  if (window.location.hash !== '#' + path) {
    window.location.hash = path;
  }
}

// --- CLIENT-SIDE ROUTER HANDLE URL ROUTING ---
function handleUrlRouting() {
  const hash = window.location.hash;

  if (hash.includes('san-pham')) {
    switchView('catalog');
  } else if (hash.includes('admin')) {
    switchView('admin');
  } else if (hash.includes('ve-poc')) {
    switchView('home');
    const target = document.getElementById('lien-he');
    if (target) {
      setTimeout(() => {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }, 300);
    }
  } else if (hash.includes('lien-he')) {
    switchView('home');
    const target = document.getElementById('lien-he');
    if (target) {
      setTimeout(() => {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }, 300);
    }
  } else {
    // Mặc định hiển thị Trang Chủ cho các đường dẫn khác (ví dụ: #/trang-chu hoặc rỗng)
    switchView('home');
  }
}

// --- ADMIN PANEL CRUD FORM HANDLERS ---
function initAdminForm() {
  const adminAddBtn = document.getElementById('admin-add-product-btn');
  const adminCloseBtn = document.getElementById('admin-product-close-btn');

  if (adminAddBtn) {
    adminAddBtn.addEventListener('click', () => {
      adminProductForm.reset();
      document.getElementById('admin-form-id').value = '';
      document.getElementById('admin-modal-title').textContent = 'THÊM SẢN PHẨM MỚI';
      adminProductOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (adminCloseBtn) {
    adminCloseBtn.addEventListener('click', () => {
      adminProductOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (adminProductForm) {
    adminProductForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const idVal = document.getElementById('admin-form-id').value;
      const nameVal = document.getElementById('admin-form-name').value.trim();
      const catVal = document.getElementById('admin-form-category').value;
      const priceVal = parseInt(document.getElementById('admin-form-price').value);
      const imgVal = document.getElementById('admin-form-image').value;
      const descVal = document.getElementById('admin-form-desc').value.trim();

      const catLabels = {
        'sport': 'Nón bảo hiểm thể thao',
        'urban': 'Nón bảo hiểm 1/2 đô thị',
        'kids': 'Nón bảo hiểm trẻ em',
        'accessories': 'Phụ kiện cao cấp'
      };

      if (!nameVal || nameVal.length < 2) {
        showToast("Tên sản phẩm phải từ 2 ký tự trở lên!", "error");
        return;
      }

      if (isNaN(priceVal) || priceVal < 0) {
        showToast("Đơn giá sản phẩm không hợp lệ!", "error");
        return;
      }

      if (!descVal || descVal.length < 5) {
        showToast("Mô tả sản phẩm phải từ 5 ký tự trở lên!", "error");
        return;
      }

      if (idVal) {
        // CHẾ ĐỘ CẬP NHẬT (EDIT MODE)
        const prodIndex = products.findIndex(p => p.id === idVal);
        if (prodIndex !== -1) {
          products[prodIndex].name = nameVal;
          products[prodIndex].category = catVal;
          products[prodIndex].categoryLabel = catLabels[catVal] || catVal;
          products[prodIndex].price = priceVal;
          products[prodIndex].priceStr = priceVal.toLocaleString('vi-VN') + ' VNĐ';
          products[prodIndex].image = imgVal;
          products[prodIndex].description = descVal;

          showToast(`Đã cập nhật sản phẩm "${nameVal}" thành công!`, "success");
        }
      } else {
        // CHẾ ĐỘ THÊM MỚI (ADD MODE)
        const newProduct = {
          id: 'poc-prod-' + Date.now(),
          name: nameVal,
          category: catVal,
          categoryLabel: catLabels[catVal] || catVal,
          price: priceVal,
          priceStr: priceVal.toLocaleString('vi-VN') + ' VNĐ',
          image: imgVal,
          description: descVal
        };

        products.push(newProduct);
        showToast(`Đã thêm sản phẩm "${nameVal}" thành công!`, "success");
      }

      saveProductsToStorage();
      adminProductOverlay.classList.remove('active');
      document.body.style.overflow = '';

      // Tải lại lưới sản phẩm thống nhất
      renderProducts();
      if (typeof renderHomeCategoryProducts === 'function') {
        renderHomeCategoryProducts('urban');
      }
    });
  }
}
