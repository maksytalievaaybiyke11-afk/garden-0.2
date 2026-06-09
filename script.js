const products = [
  { id: 1, name: "Розовая нежность", price: 2490, mark: "✿" },
  { id: 2, name: "Пудровый сон", price: 3190, mark: "❀" },
  { id: 3, name: "Персиковое утро", price: 2790, mark: "✽" },
  { id: 4, name: "Сад любви", price: 4290, mark: "✾" },
  { id: 5, name: "Кремовая симфония", price: 3490, mark: "✿" },
  { id: 6, name: "Малиновый шёпот", price: 3890, mark: "❀" },
  { id: 7, name: "Воздушная пионерия", price: 4590, mark: "✽" },
  { id: 8, name: "Лунная роза", price: 2990, mark: "✾" }
];

const CART_KEY = "gardenDreamsCart";
const USERS_KEY = "gardenDreamsUsers";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function formatPrice(price) {
  return new Intl.NumberFormat("ru-RU").format(price) + " ₽";
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll(".cart-count").forEach((element) => {
    element.textContent = count;
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function addToCart(productId) {
  const product = products.find((item) => item.id === productId);
  if (!product) return;
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, mark: product.mark, quantity: 1 });
  }

  saveCart(cart);
  showToast("Букет добавлен в корзину");
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function renderProducts() {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;

  productsGrid.innerHTML = products.map((product, index) => `
    <article class="product-card reveal" style="animation-delay: ${index * 0.05}s">
      <button class="favorite" type="button" aria-label="Добавить ${product.name} в избранное">❤️</button>
      <div class="product-media">
        <div class="product-placeholder" aria-hidden="true">${product.mark}</div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="product-meta">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-to-cart" type="button" data-product-id="${product.id}">В корзину</button>
        </div>
      </div>
    </article>
  `).join("");

  productsGrid.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.productId)));
  });
}

function renderCart() {
  const cartItems = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  if (!cartItems || !cartTotal) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatPrice(total);

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-state reveal">
        <h2>Корзина пока пуста</h2>
        <p>Добавьте нежный букет из каталога, и он появится здесь.</p>
        <a class="btn btn-primary" href="catalog.html">Перейти в каталог</a>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map((item, index) => `
    <article class="cart-item reveal" style="animation-delay: ${index * 0.05}s">
      <div class="cart-thumb" aria-hidden="true">${item.mark}</div>
      <div>
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)} × ${item.quantity}</p>
      </div>
      <button class="remove-item" type="button" data-product-id="${item.id}">Удалить</button>
    </article>
  `).join("");

  cartItems.querySelectorAll(".remove-item").forEach((button) => {
    button.addEventListener("click", () => removeFromCart(Number(button.dataset.productId)));
  });
}

function setupCheckout() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  if (!checkoutBtn) return;

  checkoutBtn.addEventListener("click", () => {
    const cart = getCart();
    if (cart.length === 0) {
      showToast("Добавьте букет перед оформлением");
      return;
    }
    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
    showToast("Заказ оформлен");
  });
}

function setupAuth() {
  const form = document.getElementById("authForm");
  if (!form) return;

  const tabs = document.querySelectorAll(".auth-tab");
  const title = document.getElementById("authTitle");
  const nameField = document.getElementById("nameField");
  const submit = document.getElementById("authSubmit");
  const message = document.getElementById("authMessage");
  const nameInput = document.getElementById("userName");
  const emailInput = document.getElementById("userEmail");
  const passwordInput = document.getElementById("userPassword");
  let mode = "register";

  function setMode(nextMode) {
    mode = nextMode;
    tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.authMode === mode));
    title.textContent = mode === "register" ? "Создать аккаунт" : "Войти в аккаунт";
    submit.textContent = mode === "register" ? "Зарегистрироваться" : "Войти";
    nameField.style.display = mode === "register" ? "grid" : "none";
    nameInput.required = mode === "register";
    message.textContent = "";
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setMode(tab.dataset.authMode));
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value.trim();
    const users = getUsers();

    if (password.length < 4) {
      message.textContent = "Пароль должен содержать минимум 4 символа.";
      return;
    }

    if (mode === "register") {
      if (!name) {
        message.textContent = "Введите имя.";
        return;
      }
      if (users.some((user) => user.email === email)) {
        message.textContent = "Пользователь с таким email уже существует.";
        return;
      }
      users.push({ name, email, password });
      saveUsers(users);
      message.textContent = "Регистрация успешна. Теперь можно войти.";
      form.reset();
      setMode("login");
      return;
    }

    const user = users.find((item) => item.email === email && item.password === password);
    if (!user) {
      message.textContent = "Неверный email или пароль.";
      return;
    }
    message.textContent = `Добро пожаловать, ${user.name}!`;
    form.reset();
  });
}

function setupMenu() {
  const button = document.querySelector(".menu-toggle");
  if (!button) return;
  button.addEventListener("click", () => document.body.classList.toggle("menu-open"));
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => document.body.classList.remove("menu-open"));
  });
}

function init() {
  updateCartCount();
  setupMenu();
  renderProducts();
  renderCart();
  setupCheckout();
  setupAuth();
}

document.addEventListener("DOMContentLoaded", init);
