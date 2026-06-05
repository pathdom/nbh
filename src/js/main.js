import { products as initialProducts } from './products.js';
import { initTheme, toggleTheme } from './theme.js';

// --- STATE MANAGEMENT ---
// Khởi tạo dữ liệu sản phẩm động từ localStorage hoặc dữ liệu tĩnh ban đầu
let products = JSON.parse(localStorage.getItem('azoma_products')) || 
               JSON.parse(localStorage.getItem('poc_products')) || 
               [...initialProducts];

// Tự động dọn dẹp và đồng bộ nếu đang lưu trữ cấu trúc dữ liệu cũ (NBH Pxx) hoặc ảnh placeholder cũ
if (products.some(p => p.name && p.name.startsWith('NBH ')) || (products.length > 0 && products[0].image === 'helmet_sport_black.png')) {
  products = [...initialProducts];
  localStorage.setItem('azoma_products', JSON.stringify(products));
}

// Hàm đồng bộ lưu trữ sản phẩm vào LocalStorage
function saveProductsToStorage() {
  localStorage.setItem('azoma_products', JSON.stringify(products));
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

// --- NEWS DATABASE ---
const newsArticles = [
  {
    id: "news-1",
    title: "[Top 20+] mũ bảo hiểm đẹp đúng chất",
    category: "info",
    categoryLabel: "Thông tin nón bảo hiểm",
    date: "02/06/2026",
    image: "news_top20_beautiful.png",
    description: "Khám phá danh sách hơn 20 mẫu mũ bảo hiểm thời trang siêu đẹp, đúng chất dân chơi xe thứ thiệt đang làm mưa làm gió trên thị trường hiện nay.",
    fullContent: `
      <p><strong>Chọn một chiếc mũ bảo hiểm vừa an toàn vừa hợp thời trang là điều mà bất kỳ biker hay người đi xe máy nào cũng mong muốn.</strong> Mũ bảo hiểm ngày nay không chỉ đơn thuần là vật dụng bảo vệ phần đầu mà còn là một món phụ kiện thể hiện cá tính riêng, gu thẩm mỹ thời thượng của người đội trên mọi hành trình.</p>
      <p>Trong bài viết này, AZOMA Helmet xin chia sẻ bộ sưu tập hơn 20 mẫu mũ bảo hiểm siêu đẹp, siêu ngầu, đúng chất "bụi bặm" và phong cách cho cả nam và nữ đang cực kỳ được ưa chuộng hiện nay:</p>
      <h3>1. Dòng mũ bảo hiểm 1/2 cổ điển (Classic Half Helmet)</h3>
      <p>Với phom tròn mềm mại, nước sơn mịn chống trầy xước và lớp lót êm ái, dòng nón 1/2 classic cực kỳ phù hợp cho những ai di chuyển trong đô thị, yêu thích phong cách tối giản thanh lịch nhưng vẫn vô cùng nổi bật.</p>
      <h3>2. Mũ bảo hiểm thể thao khí động học</h3>
      <p>Các thiết kế góc cạnh đột phá, nhiều lỗ thông gió thông minh và trọng lượng siêu nhẹ đem đến cảm giác thoải mái tối đa cho những người đam mê thể thao hay đạp xe đường dài. Thiết kế này vừa cá tính, khỏe khoắn vừa tăng tối đa tính năng bảo vệ an toàn.</p>
      <blockquote>"Một chiếc mũ bảo hiểm chất lượng không chỉ bảo vệ bạn khỏi các va chạm vật lý mà còn là tấm lá chắn tinh thần, đem lại sự tự tin bứt phá trên mọi nẻo đường."</blockquote>
      <h3>3. Cách phối đồ cực chất cùng mũ bảo hiểm</h3>
      <ul>
        <li><strong>Tone-sur-tone:</strong> Phối màu mũ trùng với màu xe hoặc trang phục chính để tạo sự đồng bộ thanh lịch.</li>
        <li><strong>Color block:</strong> Sử dụng chiếc mũ có gam màu neon nổi bật (cam, vàng, đỏ hồng) làm điểm nhấn độc đáo cho bộ đồ tối giản.</li>
        <li><strong>Phong cách đường phố (Streetwear):</strong> Kết hợp nón màu đen nhám với áo khoác da, quần jeans và giày boots bụi bặm.</li>
      </ul>
      <p>Tất cả các dòng sản phẩm của AZOMA đều được kiểm định chất lượng nghiêm ngặt và đạt tiêu chuẩn an toàn quốc gia. Hãy đến ngay showroom gần nhất của chúng tôi để trải nghiệm thực tế và chọn cho mình chiếc nón bảo hiểm phù hợp nhất!</p>
    `
  },
  {
    id: "news-2",
    title: "Top 5 nón bảo hiểm phù hợp đi phượt",
    category: "info",
    categoryLabel: "Thông tin nón bảo hiểm",
    date: "28/05/2026",
    image: "news_top5_phuot.png",
    description: "Nếu bạn là một tín đồ của những cung đường dài, hãy xem ngay top 5 chiếc mũ bảo hiểm bền bỉ, thông gió cực tốt được thiết kế riêng cho dân phượt.",
    fullContent: `
      <p><strong>Những chuyến đi phượt xa bằng xe máy luôn tràn đầy hào hứng nhưng cũng tiềm ẩn nhiều thử thách trên đường đi.</strong> Để có một hành trình trọn vẹn và an toàn, việc trang bị một chiếc mũ bảo hiểm chất lượng cao, bền bỉ, ôm khít đầu và có khả năng chống ồn, chống gió bụi tuyệt vời là vô cùng cần thiết.</p>
      <p>Dưới đây là 5 mẫu mũ bảo hiểm được các phượt thủ chuyên nghiệp đánh giá cao nhất về độ an toàn và sự thoải mái cho các hành trình dài:</p>
      <h3>1. Mũ bảo hiểm thể thao có kính chắn gió</h3>
      <p>Đặc trưng với phần kính chắn gió rộng, chống tia UV và chống lóa hiệu quả. Thiết kế này giúp bảo vệ mắt của bạn khỏi bụi bẩn, côn trùng và nước mưa chói thẳng vào mặt, đồng thời giúp giữ tầm nhìn luôn thông thoáng.</p>
      <h3>2. Mũ bảo hiểm cào cào thể thao địa hình</h3>
      <p>Thiết kế gai góc với lưỡi trai rộng phía trước để che nắng và đất cát bắn từ xe phía trước. Dòng mũ này thường siêu nhẹ, trang bị khe gió lớn thông thoáng, cực tốt cho những cung đường đồi núi hay trekking gồ ghề.</p>
      <h3>3. Mũ bảo hiểm 3/4 ôm đầu</h3>
      <p>Sự cân bằng hoàn hảo giữa bảo vệ tối đa vùng thái dương, sau gáy và sự thông thoáng tiện lợi. Lớp đệm má dày êm ái chống ồn hiệu quả từ tiếng gió rít khi di chuyển tốc độ cao.</p>
      <h3>Tiêu chí chọn mũ đi phượt không thể bỏ qua:</h3>
      <ul>
        <li><strong>Trọng lượng:</strong> Nên chọn các nón có trọng lượng dưới 1.2kg để tránh mỏi cổ khi chạy xe liên tục từ 4-6 tiếng.</li>
        <li><strong>Đệm lót kháng khuẩn:</strong> Khả năng thấm hút mồ hôi và tháo rời đệm lót để giặt giũ là yếu tố quyết định để tránh ẩm mốc, ngứa ngáy da đầu.</li>
        <li><strong>Tiêu chuẩn an toàn:</strong> Mũ phải đạt tiêu chuẩn CR Việt Nam hoặc các chứng nhận quốc tế CE EN1078, DOT.</li>
      </ul>
      <p>Hy vọng qua bài viết này, bạn sẽ chọn được người bạn đồng hành tin cậy trên các cung đường phượt đầy cảm hứng sắp tới!</p>
    `
  },
  {
    id: "news-3",
    title: "AZOMA Creation 1 – Nón bảo hiểm thời thượng",
    category: "info",
    categoryLabel: "Thông tin nón bảo hiểm",
    date: "15/05/2026",
    image: "news_creation1.png",
    description: "Đánh giá chi tiết siêu phẩm AZOMA Creation 1: Ngôn ngữ thiết kế tối giản châu Âu, công nghệ khóa nam châm Fidlock Đức độc bản.",
    fullContent: `
      <p><strong>Siêu phẩm nón bảo hiểm đô thị AZOMA Creation 1 vừa ra mắt đã lập tức định hình một tiêu chuẩn mới cho phân khúc mũ bảo hiểm cao cấp tại thị trường Việt Nam.</strong> Sở hữu ngôn ngữ thiết kế tối giản đặc trưng của vùng Scandinavia và các tính năng công nghệ hàng đầu thế giới, đây là chiếc mũ bảo hiểm được săn đón nhất bởi giới thượng lưu và giới mộ điệu thời trang.</p>
      <p>Cùng chúng tôi đi sâu vào đánh giá chi tiết các điểm đắt giá tạo nên danh tiếng cho AZOMA Creation 1:</p>
      <h3>1. Thiết kế liền mạch không tì vết</h3>
      <p>Vỏ nón Polycarbonate được liên kết nhiệt trực tiếp với lõi xốp hấp thụ lực EPS cao cấp nhờ công nghệ In-Mold liền khối. Không một đường ráp nối thô ráp, nón tạo nên một tổng thể bóng bẩy, thanh thoát hoàn mỹ đến từng chi tiết nhỏ nhất.</p>
      <h3>2. Đột phá công nghệ khóa nam châm Fidlock từ Đức</h3>
      <p>Thay vì các loại khóa bấm nhựa thông thường dễ kẹt và khó sử dụng, AZOMA Creation 1 trang bị khóa thông minh Fidlock của Đức. Cơ chế hút nam châm cực mạnh giúp bạn có thể đóng mở khóa chỉ bằng một tay trong vòng 0.5 giây vô cùng dễ dàng mà vẫn đảm bảo tải trọng kéo giật lên tới hàng trăm kg.</p>
      <blockquote>"Sự tinh tế của một thiết kế nằm ở chỗ nó giải quyết những thao tác nhỏ nhặt nhất của người dùng một cách đơn giản và thanh lịch nhất."</blockquote>
      <h3>3. Lớp sơn mờ độc bản chống bám bẩn</h3>
      <p>Nước sơn mịn lì cao cấp ứng dụng công nghệ Nano chống trầy xước nhẹ, chống bám vân tay và bụi bẩn cực kỳ tốt. Mũ giữ được vẻ đẹp như mới dù sử dụng hàng ngày trong thời tiết mưa nắng thất thường tại đô thị.</p>
      <p>Với mức giá hợp lý đi cùng chất lượng đỉnh cao, AZOMA Creation 1 xứng đáng là biểu tượng phong cách dẫn đầu xu hướng sống hiện đại, năng động và an toàn của bạn!</p>
    `
  },
  {
    id: "news-4",
    title: "Trẻ em dưới 2 tuổi có nên đội mũ bảo hiểm?",
    category: "event",
    categoryLabel: "Thông tin sự kiện",
    date: "05/05/2026",
    image: "news_kids_safety.png",
    description: "Các bác sĩ chấn thương chỉnh hình chia sẻ lời khuyên y học quý báu về việc sử dụng mũ bảo hiểm bảo vệ an toàn cho trẻ em khi ngồi xe máy.",
    fullContent: `
      <p><strong>Nhiều bậc phụ huynh khi chở con nhỏ trên xe máy thường băn khoăn không biết có nên cho con đội mũ bảo hiểm hay không, và độ tuổi nào là an toàn nhất để bắt đầu đội.</strong> Theo các khuyến cáo y khoa và quy định pháp luật hiện hành, an toàn của trẻ em cần phải được đặt lên hàng đầu nhưng cần thực hiện một cách khoa học.</p>
      <p>Các chuyên gia chấn thương chỉnh hình và nhi khoa đã đưa ra những lời khuyên y học vô cùng quan trọng như sau:</p>
      <h3>1. Đối với trẻ em dưới 2 tuổi</h3>
      <p><strong>Cảnh báo y tế quan trọng:</strong> Trẻ em dưới 2 tuổi KHÔNG nên đội các loại mũ bảo hiểm thông thường. Lý do là vì ở độ tuổi này, các đốt sống cổ của bé còn rất non nớt và cơ cổ chưa đủ khỏe để đỡ thêm trọng lượng của chiếc nón bảo hiểm. Việc đội mũ quá nặng có thể gây chấn thương đốt sống cổ của bé khi xe đi qua những chỗ xóc nảy.</p>
      <p>Thay vào đó, phụ huynh nên che chắn cho bé bằng mũ vải mềm bảo vệ đầu nhẹ nhàng, sử dụng đai xe máy chắc chắn và di chuyển với tốc độ rất chậm dưới 30km/h để đảm bảo an toàn tối đa.</p>
      <h3>2. Đối với trẻ em từ 2 tuổi đến 6 tuổi</h3>
      <p>Ở độ tuổi này, hệ xương cổ của trẻ đã tương đối ổn định. Phụ huynh nên bắt đầu tập cho bé thói quen đội mũ bảo hiểm siêu nhẹ chuyên dụng cho trẻ em khi tham gia giao thông cùng cha mẹ. Việc này vừa bảo vệ bé khỏi các chấn thương nguy hiểm vừa xây dựng ý thức chấp hành luật giao thông từ sớm.</p>
      <h3>Các nguyên tắc vàng khi chọn mũ bảo hiểm cho trẻ em:</h3>
      <ul>
        <li><strong>Trọng lượng siêu nhẹ:</strong> Mũ cho trẻ em bắt buộc phải có trọng lượng dưới 300g (mũ của AZOMA Kids chỉ nặng 220g) để không gây áp lực lên cổ của bé.</li>
        <li><strong>Độ ôm khít vừa vặn:</strong> Nón không được quá rộng hoặc quá chật, quai nón vừa vặn ôm dưới cằm trẻ (đút vừa 2 ngón tay).</li>
        <li><strong>Chất liệu an toàn:</strong> Lõi EPS mềm hấp thụ chấn động và vỏ nón không chứa các hóa chất độc hại gây dị ứng cho da đầu mỏng manh của trẻ.</li>
      </ul>
      <p>Hãy là những bậc cha mẹ thông thái, bảo vệ con yêu một cách an toàn và khoa học nhất trên mọi nẻo đường đời!</p>
    `
  }
];

// --- DOM ELEMENTS ---
let productsContainer, paginationContainer, activeFiltersContainer;
let drawerOverlay, mobileDrawer, searchModal;
let quickviewOverlay, quickviewModal;
let toastContainer;
let homepageView, catalogView, contactView, newsView;
let adminProductOverlay, adminProductForm, adminLoginView, adminLoginForm, adminLogoutBtn;
let newsGridContainer, newsDetailOverlay;

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
  contactView = document.getElementById('contact-view');
  newsView = document.getElementById('news-view');
  newsGridContainer = document.getElementById('news-grid-container');
  newsDetailOverlay = document.getElementById('news-detail-overlay');
  
  adminProductOverlay = document.getElementById('admin-product-overlay');
  adminProductForm = document.getElementById('admin-product-form');
  adminLoginView = document.getElementById('admin-login-view');
  adminLoginForm = document.getElementById('admin-login-form');
  adminLogoutBtn = document.getElementById('admin-logout-btn');

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

  // Render sản phẩm ban đầu cho Catalog và Mega Menu
  renderProducts();
  updateFilterTags();
  renderMegaMenuProducts('sport');

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
      showToast("AZOMA Helmet - Thương hiệu nón dẫn đầu về chất lượng và an toàn!", "success");
    });
  }

  // View Switchers click events using Client-side SPA Router
  const navHome = document.getElementById('nav-home');
  const mobNavHome = document.getElementById('mob-nav-home');
  const brandLogo = document.getElementById('nbh-brand-logo');
  const navCatalog = document.getElementById('nav-catalog-main');
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
      navigateTo('/ve-azoma');
      const target = document.getElementById('lien-he');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }

  // Trình bắt sự kiện click cho các mục con trong danh mục sổ xuống "Về AZOMA"
  const navAboutDino = document.getElementById('nav-about-dino');
  const navAboutGeneral = document.getElementById('nav-about-general');
  const navAboutHistory = document.getElementById('nav-about-history');
  const navAboutContact = document.getElementById('nav-about-contact');

  const dinoDetailOverlay = document.getElementById('dino-detail-overlay');
  const dinoDetailCloseBtn = document.getElementById('dino-detail-close-btn');

  const openDinoModal = () => {
    if (dinoDetailOverlay) {
      dinoDetailOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  if (dinoDetailCloseBtn) {
    dinoDetailCloseBtn.addEventListener('click', () => {
      dinoDetailOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (dinoDetailOverlay) {
    dinoDetailOverlay.addEventListener('click', (e) => {
      if (e.target === dinoDetailOverlay) {
        dinoDetailOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  const dinoQuickForm = document.getElementById('dino-quick-form');
  if (dinoQuickForm) {
    dinoQuickForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('dino-form-name');
      const telInput = document.getElementById('dino-form-tel');
      const nameVal = nameInput ? nameInput.value.trim() : '';
      const telVal = telInput ? telInput.value.trim() : '';

      if (!nameVal || nameVal.length < 2) {
        showToast("Vui lòng nhập tên hợp lệ!", "error");
        return;
      }
      if (!telVal || !/^(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})$/.test(telVal)) {
        showToast("Số điện thoại không đúng định dạng (VD: 0987654321)!", "error");
        return;
      }

      showToast(`Cảm ơn anh/chị ${nameVal}! Yêu cầu nhận Catalogue & báo giá in logo đại lý đã được gửi thành công!`, "success");
      if (dinoDetailOverlay) {
        dinoDetailOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
      dinoQuickForm.reset();
    });
  }

  if (navAboutDino) {
    navAboutDino.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/ve-azoma');
      openDinoModal();
    });
  }
  const aboutDetailOverlay = document.getElementById('about-detail-overlay');
  const aboutDetailCloseBtn = document.getElementById('about-detail-close-btn');
  const homeIntroAbout = document.getElementById('home-intro-about');

  const openAboutModal = () => {
    if (aboutDetailOverlay) {
      aboutDetailOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  if (aboutDetailCloseBtn) {
    aboutDetailCloseBtn.addEventListener('click', () => {
      aboutDetailOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  if (aboutDetailOverlay) {
    aboutDetailOverlay.addEventListener('click', (e) => {
      if (e.target === aboutDetailOverlay) {
        aboutDetailOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  if (homeIntroAbout) {
    homeIntroAbout.addEventListener('click', (e) => {
      e.preventDefault();
      openAboutModal();
    });
  }

  if (navAboutGeneral) {
    navAboutGeneral.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/ve-azoma');
      const target = document.getElementById('home-intro-about');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 120, behavior: 'smooth' });
        setTimeout(() => {
          openAboutModal();
        }, 500); // Mở modal ngay sau khi cuộn hoàn tất mượt mà
      }
    });
  }
  if (navAboutHistory) {
    navAboutHistory.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/ve-azoma');
      const target = document.getElementById('home-intro-history');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 120, behavior: 'smooth' });
      }
    });
  }
  if (navAboutContact) {
    navAboutContact.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/lien-he');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  if (navContact) {
    navContact.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('/lien-he');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- MEGA DROPDOWN NÓN BẢO HIỂM DYNAMIC HOVER & CLICK HANDLERS ---
  const navCatalogCatBtns = document.querySelectorAll('.nav-catalog-cat-btn');
  navCatalogCatBtns.forEach(btn => {
    // 1. Hover event: dynamically load products and switch active style in dropdown sidebar
    btn.addEventListener('mouseenter', () => {
      const cat = btn.getAttribute('data-cat');
      
      // Update active class on dropdown buttons
      navCatalogCatBtns.forEach(b => {
        if (b.getAttribute('data-cat') === cat) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });
      
      // Render products inside dropdown
      renderMegaMenuProducts(cat);
    });

    // 2. Click event: redirect to store view /san-pham and apply category filter
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = btn.getAttribute('data-cat');
      syncCategoryFilters(cat);
      const targetSection = document.getElementById('san-pham');
      if (targetSection) {
        window.scrollTo({
          top: targetSection.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Use event delegation for product cards inside the mega-dropdown since they are rendered dynamically
  const navProductsGrid = document.getElementById('nav-catalog-products-grid');
  if (navProductsGrid) {
    navProductsGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.nav-product-card');
      if (card) {
        e.preventDefault();
        const id = card.getAttribute('data-id');
        const product = products.find(p => p.id === id);
        if (product) {
          openQuickView(product);
        }
      }
    });
  }

  // --- MEGA DROPDOWN TIN TỨC CLICK HANDLERS ---
  const navNewsCatBtns = document.querySelectorAll('.nav-news-cat-btn');
  navNewsCatBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const category = btn.getAttribute('data-category');
      navigateTo('/tin-tuc');
      setTimeout(() => {
        renderNews(category);
        // Highlight active sidebar item
        const sidebarBtns = document.querySelectorAll('.news-filter-btn');
        sidebarBtns.forEach(sb => {
          if (sb.getAttribute('data-category') === category) {
            sb.classList.add('active');
            sb.style.color = 'var(--accent)';
            sb.style.fontWeight = '700';
          } else {
            sb.classList.remove('active');
            sb.style.color = 'var(--text-secondary)';
            sb.style.fontWeight = '500';
          }
        });
      }, 100);
    });
  });

  const navNewsCards = document.querySelectorAll('.nav-news-card');
  navNewsCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const idx = parseInt(card.getAttribute('data-idx'));
      const article = newsArticles[idx];
      if (article) {
        navigateTo('/tin-tuc');
        setTimeout(() => {
          openNewsDetail(article);
        }, 150);
      }
    });
  });

  // --- SIDEBAR TIN TỨC FILTER BUTTONS ---
  const newsFilterBtns = document.querySelectorAll('.news-filter-btn');
  newsFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');
      renderNews(category);
      
      newsFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.color = 'var(--text-secondary)';
        b.style.fontWeight = '500';
      });
      btn.classList.add('active');
      btn.style.color = 'var(--accent)';
      btn.style.fontWeight = '700';
    });
  });

  // --- ARTICLE CLICK OPEN DETAIL MODAL ---
  if (newsGridContainer) {
    newsGridContainer.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) {
        const id = card.getAttribute('data-id');
        const article = newsArticles.find(a => a.id === id);
        if (article) {
          openNewsDetail(article);
        }
      }
    });
  }

  const newsRelatedGrid = document.getElementById('news-related-grid');
  if (newsRelatedGrid) {
    newsRelatedGrid.addEventListener('click', (e) => {
      const card = e.target.closest('[data-id]');
      if (card) {
        const id = card.getAttribute('data-id');
        const article = newsArticles.find(a => a.id === id);
        if (article) {
          openNewsDetail(article);
        }
      }
    });
  }

  // --- CLOSE NEWS DETAIL MODAL ---
  const newsDetailCloseBtn = document.getElementById('news-detail-close-btn');
  if (newsDetailCloseBtn) {
    newsDetailCloseBtn.addEventListener('click', closeNewsDetail);
  }
  if (newsDetailOverlay) {
    newsDetailOverlay.addEventListener('click', (e) => {
      if (e.target === newsDetailOverlay) {
        closeNewsDetail();
      }
    });
  }

  // --- MOBILE DRAWER NEWS LINKS ---
  const mobNavNews = document.getElementById('mob-nav-news');
  if (mobNavNews) {
    mobNavNews.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      navigateTo('/tin-tuc');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  const mobNavAbout = document.getElementById('mob-nav-about');
  if (mobNavAbout) {
    mobNavAbout.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      navigateTo('/ve-azoma');
      const target = document.getElementById('lien-he');
      if (target) {
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
      }
    });
  }
  const mobNavContact = document.getElementById('mob-nav-contact');
  if (mobNavContact) {
    mobNavContact.addEventListener('click', (e) => {
      e.preventDefault();
      closeMobileDrawer();
      navigateTo('/lien-he');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', handleNewsletterSubmit);
  }

  // --- ADMIN LOGIN FORM SUBMIT ---
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const usernameInput = document.getElementById('login-username');
      const passwordInput = document.getElementById('login-password');
      const username = usernameInput ? usernameInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';

      if (username === 'admin' && password === 'admin123') {
        sessionStorage.setItem('nbh_admin_logged_in', 'true');
        showToast('Đăng nhập quản trị thành công!', 'success');
        
        // Clear form
        adminLoginForm.reset();
        
        // Chuyển hướng sang giao diện admin
        navigateTo('/admin');
      } else {
        showToast('Tên đăng nhập hoặc mật khẩu không chính xác!', 'error');
        if (passwordInput) {
          passwordInput.value = '';
          passwordInput.focus();
        }
      }
    });
  }

  // --- ADMIN LOGOUT BUTTON CLICK ---
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('nbh_admin_logged_in');
      showToast('Đã đăng xuất tài khoản quản trị.', 'success');
      
      // Chuyển hướng về trang chủ
      navigateTo('/trang-chu');
    });
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
  const contactView = document.getElementById('contact-view');
  const newsView = document.getElementById('news-view');
  const adminLoginView = document.getElementById('admin-login-view');
  const navHome = document.getElementById('nav-home');
  const navCatalog = document.getElementById('nav-catalog-main');
  const navNews = document.getElementById('nav-news-main');
  const adminAddBtn = document.getElementById('admin-add-product-btn');
  const adminLogoutBtn = document.getElementById('admin-logout-btn');
  const mainTitle = document.getElementById('catalog-main-title');
  const header = document.querySelector('.header');
  const footer = document.querySelector('.footer');

  if (!homepageView || !catalogView) return;

  // Show or hide header/footer based on admin-login view
  if (viewName === 'admin-login') {
    if (header) header.style.display = 'none';
    if (footer) footer.style.display = 'none';
  } else {
    if (header) header.style.display = '';
    if (footer) footer.style.display = '';
  }

  if (viewName === 'home') {
    homepageView.style.display = 'block';
    catalogView.style.display = 'none';
    if (contactView) contactView.style.display = 'none';
    if (newsView) newsView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'none';
    catalogView.classList.remove('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
    if (mainTitle) mainTitle.textContent = 'Nón Bảo Hiểm';

    // Đánh dấu active navigation pill
    if (navHome) navHome.classList.add('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
    if (navNews) navNews.classList.remove('active-nav-pill');
  } else if (viewName === 'catalog') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'block';
    if (contactView) contactView.style.display = 'none';
    if (newsView) newsView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'none';
    catalogView.classList.remove('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';
    if (mainTitle) mainTitle.textContent = 'Nón Bảo Hiểm';

    // Đánh dấu active navigation pill
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.add('active-nav-pill');
    if (navNews) navNews.classList.remove('active-nav-pill');
    
    renderProducts();
  } else if (viewName === 'admin') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'block';
    if (contactView) contactView.style.display = 'none';
    if (newsView) newsView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'none';
    catalogView.classList.add('admin-mode');
    if (adminAddBtn) adminAddBtn.style.display = 'inline-flex';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'inline-flex';
    if (mainTitle) mainTitle.textContent = 'QUẢN LÝ SẢN PHẨM';

    // Xoá active navigation pill vì đây là chế độ admin quản trị riêng
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
    if (navNews) navNews.classList.remove('active-nav-pill');

    renderProducts();
  } else if (viewName === 'contact') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'none';
    if (contactView) contactView.style.display = 'block';
    if (newsView) newsView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'none';
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';

    // Xoá active navigation pill
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
    if (navNews) navNews.classList.remove('active-nav-pill');
  } else if (viewName === 'news') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'none';
    if (contactView) contactView.style.display = 'none';
    if (newsView) newsView.style.display = 'block';
    if (adminLoginView) adminLoginView.style.display = 'none';
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';

    // Đánh dấu active navigation pill
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
    if (navNews) navNews.classList.add('active-nav-pill');

    renderNews('all');
  } else if (viewName === 'admin-login') {
    homepageView.style.display = 'none';
    catalogView.style.display = 'none';
    if (contactView) contactView.style.display = 'none';
    if (newsView) newsView.style.display = 'none';
    if (adminLoginView) adminLoginView.style.display = 'block';
    if (adminAddBtn) adminAddBtn.style.display = 'none';
    if (adminLogoutBtn) adminLogoutBtn.style.display = 'none';

    // Xoá active navigation pill
    if (navHome) navHome.classList.remove('active-nav-pill');
    if (navCatalog) navCatalog.classList.remove('active-nav-pill');
    if (navNews) navNews.classList.remove('active-nav-pill');
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
  const isAdmin = sessionStorage.getItem('nbh_admin_logged_in') === 'true';
  let targetPath = path;
  
  if (isAdmin) {
    // Nếu là admin, đảm bảo đường dẫn luôn bắt đầu bằng /admin
    if (!path.startsWith('/admin')) {
      targetPath = '/admin' + (path === '/' ? '' : path);
    }
  } else {
    // Nếu không phải admin, loại bỏ tiền tố /admin nếu có
    if (path.startsWith('/admin')) {
      targetPath = path.replace(/^\/admin/, '');
      if (targetPath === '') targetPath = '/trang-chu';
    }
  }

  if (window.location.hash !== '#' + targetPath) {
    window.location.hash = targetPath;
  }
}

// --- CLIENT-SIDE ROUTER HANDLE URL ROUTING ---
function handleUrlRouting() {
  const hash = window.location.hash;
  const isLoggedIn = sessionStorage.getItem('nbh_admin_logged_in') === 'true';

  // Nếu đường dẫn chứa /admin hoặc bắt đầu bằng #/admin
  if (hash.startsWith('#/admin') || hash.includes('/admin')) {
    // 1. Kiểm tra quyền đăng nhập admin
    if (!isLoggedIn) {
      switchView('admin-login');
      return;
    }

    // 2. Nếu đã đăng nhập admin, phân tách các sub-route
    const subRoute = hash.replace(/^#\/admin\/?/, '');

    if (subRoute === '' || subRoute.includes('san-pham')) {
      switchView('admin'); // Hiển thị Catalog ở chế độ admin-mode
    } else if (subRoute.includes('trang-chu') || subRoute.includes('home')) {
      switchView('home');
    } else if (subRoute.includes('ve-poc') || subRoute.includes('ve-azoma')) {
      switchView('home');
      const target = document.getElementById('lien-he');
      if (target) {
        setTimeout(() => {
          window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }, 300);
      }
    } else if (subRoute.includes('lien-he') || subRoute.includes('contact')) {
      switchView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (subRoute.includes('tin-tuc') || subRoute.includes('news')) {
      switchView('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      switchView('admin');
    }
  } else {
    // 3. Đường dẫn người dùng thông thường (không có tiền tố /admin)
    if (hash.includes('admin-login')) {
      if (isLoggedIn) {
        navigateTo('/admin');
      } else {
        switchView('admin-login');
      }
      return;
    }

    if (hash.includes('san-pham')) {
      switchView('catalog');
    } else if (hash.includes('ve-poc') || hash.includes('ve-azoma')) {
      switchView('home');
      const target = document.getElementById('lien-he');
      if (target) {
        setTimeout(() => {
          window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }, 300);
      }
    } else if (hash.includes('lien-he')) {
      switchView('contact');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (hash.includes('tin-tuc')) {
      switchView('news');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      switchView('home');
    }
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
          id: 'azoma-prod-' + Date.now(),
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

// --- NEWS VIEW RENDERERS & DETAIL CONTROLLERS ---
function renderNews(category) {
  const container = document.getElementById('news-grid-container');
  if (!container) return;

  container.replaceChildren();

  let filtered = newsArticles;
  if (category !== 'all') {
    filtered = newsArticles.filter(a => a.category === category);
  }

  // Cập nhật nhãn đếm và tiêu đề chính
  const mainTitle = document.getElementById('news-main-title');
  const countLbl = document.getElementById('news-count-lbl');
  
  if (mainTitle) {
    mainTitle.textContent = category === 'all' ? 'Tất cả bài viết' : (category === 'info' ? 'Thông tin nón bảo hiểm' : 'Thông tin sự kiện');
  }
  if (countLbl) {
    countLbl.textContent = `${filtered.length} bài viết`;
  }

  if (filtered.length === 0) {
    const emptyMsg = document.createElement('div');
    emptyMsg.style.gridColumn = '1 / -1';
    emptyMsg.style.textAlign = 'center';
    emptyMsg.style.padding = '3rem';
    emptyMsg.style.color = 'var(--text-secondary)';
    emptyMsg.textContent = 'Hiện chưa có bài viết nào thuộc danh mục này.';
    container.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(article => {
    const card = document.createElement('article');
    card.className = 'news-list-card';
    card.setAttribute('data-id', article.id);
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';
    card.style.cursor = 'pointer';
    card.style.transition = 'transform var(--transition-normal)';

    // Image block
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'news-card-img-wrapper';
    imgWrapper.style.aspectRatio = '1.6/1';
    imgWrapper.style.borderRadius = 'var(--radius-md)';
    imgWrapper.style.overflow = 'hidden';
    imgWrapper.style.backgroundColor = 'var(--surface-hover)';
    imgWrapper.style.border = '1px solid var(--border-color)';
    imgWrapper.style.position = 'relative';

    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.transition = 'transform var(--transition-fast)';
    img.className = 'news-card-img';
    imgWrapper.appendChild(img);

    const catBadge = document.createElement('span');
    catBadge.style.position = 'absolute';
    catBadge.style.top = '1rem';
    catBadge.style.left = '1rem';
    catBadge.style.backgroundColor = 'var(--accent)';
    catBadge.style.color = 'black';
    catBadge.style.fontSize = '0.75rem';
    catBadge.style.fontWeight = '700';
    catBadge.style.padding = '0.3rem 0.75rem';
    catBadge.style.borderRadius = 'var(--radius-sm)';
    catBadge.style.letterSpacing = '0.05em';
    catBadge.style.textTransform = 'uppercase';
    catBadge.textContent = article.categoryLabel;
    imgWrapper.appendChild(catBadge);

    card.appendChild(imgWrapper);

    // Info block
    const info = document.createElement('div');
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '0.5rem';

    const dateRow = document.createElement('div');
    dateRow.style.fontSize = '0.8rem';
    dateRow.style.color = 'var(--text-secondary)';
    dateRow.style.fontWeight = '600';
    dateRow.style.display = 'flex';
    dateRow.style.alignItems = 'center';
    dateRow.style.gap = '0.4rem';
    dateRow.innerHTML = `<i class="ri-calendar-line"></i> ${article.date}`;
    info.appendChild(dateRow);

    const title = document.createElement('h3');
    title.className = 'news-card-title';
    title.style.fontSize = '1.25rem';
    title.style.fontWeight = '800';
    title.style.color = 'var(--text-primary)';
    title.style.margin = '0';
    title.style.lineHeight = '1.3';
    title.style.transition = 'color var(--transition-fast)';
    title.textContent = article.title;
    info.appendChild(title);

    const desc = document.createElement('p');
    desc.style.fontSize = '0.9rem';
    desc.style.color = 'var(--text-secondary)';
    desc.style.lineHeight = '1.6';
    desc.style.margin = '0';
    desc.style.display = '-webkit-box';
    desc.style.webkitLineClamp = '2';
    desc.style.webkitBoxOrient = 'vertical';
    desc.style.overflow = 'hidden';
    desc.style.textOverflow = 'ellipsis';
    desc.style.height = '3.2em';
    desc.textContent = article.description;
    info.appendChild(desc);

    const readBtn = document.createElement('button');
    readBtn.className = 'btn-read-more';
    readBtn.style.alignSelf = 'flex-start';
    readBtn.style.background = 'none';
    readBtn.style.border = 'none';
    readBtn.style.color = 'var(--accent)';
    readBtn.style.fontWeight = '700';
    readBtn.style.fontSize = '0.88rem';
    readBtn.style.display = 'flex';
    readBtn.style.alignItems = 'center';
    readBtn.style.gap = '0.25rem';
    readBtn.style.cursor = 'pointer';
    readBtn.style.padding = '0';
    readBtn.style.marginTop = '0.5rem';
    readBtn.style.transition = 'color var(--transition-fast)';
    readBtn.innerHTML = `Đọc tiếp <i class="ri-arrow-right-line"></i>`;
    info.appendChild(readBtn);

    card.appendChild(info);
    container.appendChild(card);
  });
}

function openNewsDetail(article) {
  const detailCat = document.getElementById('news-detail-cat');
  const detailTitle = document.getElementById('news-detail-title');
  const detailDate = document.getElementById('news-detail-date');
  const detailImg = document.getElementById('news-detail-img');
  const detailContent = document.getElementById('news-detail-content');

  if (detailCat) detailCat.textContent = article.categoryLabel;
  if (detailTitle) detailTitle.textContent = article.title;
  if (detailDate) detailDate.textContent = article.date;
  if (detailImg) {
    detailImg.src = article.image;
    detailImg.alt = article.title;
  }
  if (detailContent) {
    detailContent.innerHTML = article.fullContent;
  }

  // Render bài viết liên quan
  renderRelatedNews(article.id);

  if (newsDetailOverlay) {
    newsDetailOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeNewsDetail() {
  if (newsDetailOverlay) {
    newsDetailOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function renderRelatedNews(currentId) {
  const relatedGrid = document.getElementById('news-related-grid');
  if (!relatedGrid) return;

  relatedGrid.replaceChildren();

  // Lọc lấy 3 bài viết khác làm bài viết liên quan
  const related = newsArticles.filter(a => a.id !== currentId).slice(0, 3);

  related.forEach(article => {
    const card = document.createElement('div');
    card.className = 'related-news-card';
    card.setAttribute('data-id', article.id);
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.5rem';
    card.style.cursor = 'pointer';

    const imgWrapper = document.createElement('div');
    imgWrapper.style.aspectRatio = '1.6/1';
    imgWrapper.style.borderRadius = 'var(--radius-sm)';
    imgWrapper.style.overflow = 'hidden';
    imgWrapper.style.border = '1px solid var(--border-color)';

    const img = document.createElement('img');
    img.src = article.image;
    img.alt = article.title;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    const title = document.createElement('h4');
    title.style.fontSize = '0.85rem';
    title.style.fontWeight = '700';
    title.style.color = 'var(--text-primary)';
    title.style.margin = '0';
    title.style.display = '-webkit-box';
    title.style.webkitLineClamp = '2';
    title.style.webkitBoxOrient = 'vertical';
    title.style.overflow = 'hidden';
    title.style.lineHeight = '1.4';
    title.style.height = '2.8em';
    title.textContent = article.title;
    card.appendChild(title);

    relatedGrid.appendChild(card);
  });
}

// --- RENDER PRODUCTS IN MEGA DROPDOWN MENU ---
function renderMegaMenuProducts(category) {
  const grid = document.getElementById('nav-catalog-products-grid');
  if (!grid) return;

  grid.replaceChildren();

  // Lọc lấy các sản phẩm thuộc danh mục được chọn
  const filtered = products.filter(p => p.category === category);
  
  // Hiển thị tối đa 4 sản phẩm khớp với 4 cột trên giao diện
  const itemsToShow = filtered.slice(0, 4);

  itemsToShow.forEach(product => {
    const card = document.createElement('a');
    card.href = '#';
    card.className = 'nav-product-card';
    card.setAttribute('data-id', product.id);
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '0.5rem';
    card.style.textDecoration = 'none';

    const title = document.createElement('h4');
    title.style.fontSize = '0.85rem';
    title.style.fontWeight = '700';
    title.style.color = 'var(--text-primary)';
    title.style.margin = '0';
    title.style.textTransform = 'uppercase';
    title.textContent = product.name;

    const imgWrapper = document.createElement('div');
    imgWrapper.style.aspectRatio = '1.15/1';
    imgWrapper.style.display = 'flex';
    imgWrapper.style.alignItems = 'center';
    imgWrapper.style.justifyContent = 'center';
    imgWrapper.style.backgroundColor = 'transparent';

    const img = document.createElement('img');
    img.src = product.image;
    img.alt = product.name;
    img.style.maxHeight = '100px';
    img.style.objectFit = 'contain';
    img.style.filter = 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))';
    img.style.transition = 'transform var(--transition-fast)';

    imgWrapper.appendChild(img);
    card.appendChild(title);
    card.appendChild(imgWrapper);
    grid.appendChild(card);
  });
}
