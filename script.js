console.log('script.js berhasil dimuat');

// Admin credentials
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

let isAdminMode = false;

// Data peralatan dan penyewa
let peralatan = [
    {
        id: 1,
        nama: 'Tenda Dome 4 Orang',
        harga: 50000,
        status: 'Tersedia',
        kategori: 'tenda',
        gambar: 'https://images.unsplash.com/photo-1445308394109-4ec2920981b1?w=600',
        deskripsi: 'Tenda dome kapasitas 4 orang, tahan air, dengan lapisan double layer.',
        stok: 5
    },
    {
        id: 2,
        nama: 'Carrier 60L',
        harga: 35000,
        status: 'Tersedia',
        kategori: 'carrier',
        gambar: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600',
        deskripsi: 'Tas carrier 60L dengan sistem punggung yang nyaman dan tahan air.',
        stok: 8
    },
    {
        id: 3,
        nama: 'Sleeping Bag',
        harga: 25000,
        status: 'Tersedia',
        kategori: 'other',
        gambar: 'https://images.unsplash.com/photo-1520496938502-73e942d08cc3?w=600',
        deskripsi: 'Sleeping bag dengan bahan thermal, nyaman digunakan hingga suhu 5°C.',
        stok: 10
    },
    {
        id: 4,
        nama: 'Kompor Portable',
        harga: 20000,
        status: 'Tersedia',
        kategori: 'other',
        gambar: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
        deskripsi: 'Kompor portable dengan sistem windproof, cocok untuk camping.',
        stok: 6
    },
    {
        id: 5,
        nama: 'Matras Camping',
        harga: 15000,
        status: 'Tersedia',
        kategori: 'other',
        gambar: 'https://images.unsplash.com/photo-1520496938502-73e942d08cc3?w=600',
        deskripsi: 'Matras camping tebal 10mm, ringan dan mudah dibawa.',
        stok: 12
    },
    {
        id: 6,
        nama: 'Headlamp LED',
        harga: 10000,
        status: 'Tersedia',
        kategori: 'other',
        gambar: 'https://images.unsplash.com/photo-1578269174936-2709b6aeb913?w=600',
        deskripsi: 'Headlamp LED 1000 lumens dengan 3 mode pencahayaan.',
        stok: 15
    },
    {
        id: 7,
        nama: 'Trekking Pole',
        harga: 15000,
        status: 'Tersedia',
        kategori: 'other',
        gambar: 'https://images.unsplash.com/photo-1473016370907-c2c2acd00a1b?w=600',
        deskripsi: 'Trekking pole aluminium yang dapat disesuaikan tingginya.',
        stok: 8
    },
    {
        id: 8,
        nama: 'Flysheet 3x4m',
        harga: 20000,
        status: 'Tersedia',
        kategori: 'tenda',
        gambar: 'https://images.unsplash.com/photo-1478827387698-1527781a4887?w=600',
        deskripsi: 'Flysheet waterproof ukuran 3x4 meter dengan tali dan pasak.',
        stok: 10
    }
];

let daftarPenyewa = [];
let selectedItem = null;
let cart = [];

// Cart functions
function updateCartCount() {
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
        cartCountElement.style.display = cart.length > 0 ? 'flex' : 'none';
    }
}

function addToCart(itemId) {
    if (cart.length >= 5) {
        alert('Maksimal 5 jenis item dalam keranjang!');
        return;
    }

    const item = peralatan.find(p => p.id === itemId);
    if (!item) return;

    if (item.stok <= 0) {
        alert('Maaf, stok barang habis!');
        return;
    }

    if (cart.find(p => p.id === itemId)) {
        alert('Item sudah ada di keranjang!');
        return;
    }

    // Decrease stock immediately
    item.stok -= 1;

    cart.push({
        ...item,
        quantity: 1,
        originalStok: item.stok + 1 // Save original stock for reference
    });

    // Update display
    updateCartCount();
    tampilkanPeralatan();
    alert('Item berhasil ditambahkan ke keranjang!');
}

function removeFromCart(itemId) {
    const cartItem = cart.find(item => item.id === itemId);
    if (!cartItem) return;

    // Restore stock
    const item = peralatan.find(p => p.id === itemId);
    if (item) {
        item.stok += cartItem.quantity;
    }

    // Remove from cart
    cart = cart.filter(item => item.id !== itemId);

    // Update displays
    updateCartCount();
    tampilkanPeralatan();
    showCart();
}

function updateQuantity(itemId, change) {
    const cartItem = cart.find(p => p.id === itemId);
    if (!cartItem) return;

    const item = peralatan.find(p => p.id === itemId);
    if (!item) return;

    const newQuantity = cartItem.quantity + change;
    
    // Check minimum quantity
    if (newQuantity < 1) {
        alert('Jumlah minimum adalah 1');
        return;
    }
    
    // Check stock availability
    const maxAvailable = item.stok + cartItem.quantity; // Current stock + what's in cart
    if (newQuantity > maxAvailable) {
        alert(`Stok tersedia hanya ${maxAvailable} unit`);
        return;
    }

    // Update stock
    item.stok += cartItem.quantity - newQuantity; // Restore old quantity and remove new quantity
    cartItem.quantity = newQuantity;

    // Update displays
    updateCartCount();
    tampilkanPeralatan();
    showCart();
}

function showCart(category = 'all') {
    const cartModalElement = document.getElementById('cartModal');
    let cartModal = bootstrap.Modal.getInstance(cartModalElement);
    
    // If modal doesn't exist yet, create it
    if (!cartModal) {
        cartModal = new bootstrap.Modal(cartModalElement);
    }
    const cartItemsContainer = document.getElementById('cartItems');
    const totalItemsElement = document.getElementById('totalItems');
    const totalPriceElement = document.getElementById('totalPrice');

    // Update active category button
    document.querySelectorAll('.cart-menu .btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    cartItemsContainer.innerHTML = '';

    // Filter items by category
    const filteredCart = category === 'all' ? 
        cart : 
        cart.filter(item => item.kategori === category);

    if (filteredCart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="text-center py-4 text-muted">
                ${category === 'all' ? 
                    'Keranjang masih kosong' : 
                    'Tidak ada item dalam kategori ini'}
            </div>
        `;
    } else {
        filteredCart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item d-flex align-items-center mb-3 p-3 border rounded';
            itemElement.innerHTML = `
                <img src="${item.gambar}" alt="${item.nama}" class="cart-item-image me-3" style="width: 80px; height: 80px; object-fit: cover;">
                <div class="cart-item-details flex-grow-1">
                    <h6 class="mb-1">${item.nama}</h6>
                    <p class="cart-item-price mb-2">Rp ${item.harga.toLocaleString('id-ID')}/hari</p>
                    <div class="d-flex align-items-center gap-3">
                        <div class="quantity-control d-flex align-items-center gap-2">
                            <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, -1)">-</button>
                            <span class="quantity-display px-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-primary" onclick="updateQuantity(${item.id}, 1)">+</button>
                        </div>
                        <span class="badge bg-${item.kategori === 'tenda' ? 'success' : item.kategori === 'carrier' ? 'info' : 'secondary'}">
                            ${item.kategori}
                        </span>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <p class="item-subtotal mt-2 mb-0 text-end">Subtotal: Rp ${(item.harga * item.quantity).toLocaleString('id-ID')}/hari</p>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    // Calculate totals (always from full cart, not filtered)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
    
    // Update display
    totalItemsElement.textContent = totalItems;
    totalPriceElement.textContent = totalPrice.toLocaleString('id-ID');
    
    // Add event listeners for category buttons
    document.querySelectorAll('.cart-menu .btn').forEach(btn => {
        btn.onclick = () => showCart(btn.dataset.category);
    });

    // Show modal if not already shown
    if (!document.getElementById('cartModal').classList.contains('show')) {
        cartModal.show();
    }
}

function closeCart() {
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) {
        cartModal.hide();
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }
    selectedItem = cart;
    const sewaModal = new bootstrap.Modal(document.getElementById('sewaModal'));
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    cartModal.hide();
    sewaModal.show();
}

// Fungsi untuk menampilkan peralatan
function tampilkanPeralatan() {
    const container = document.getElementById('daftarPeralatan');
    if (!container) return;

    container.innerHTML = '';

    peralatan.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-3 mb-4';

        // Create card HTML
        col.innerHTML = `
            <div class="card h-100 border-0 shadow-sm">
                <img src="${item.gambar}" class="card-img-top" alt="${item.nama}" style="height: 200px; object-fit: cover;">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.nama}</h5>
                    <p class="card-text text-muted small">${item.deskripsi}</p>
                    <div class="mt-auto">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="fw-bold text-primary">Rp ${item.harga}/hari</span>
                            <span class="stock-status ${item.stok > 0 ? 'text-success' : 'text-danger'}">
                                ${item.stok > 0 ? `Stok: ${item.stok}` : 'Stok Habis'}
                            </span>
                        </div>
                        <button onclick="addToCart(${item.id})" class="btn btn-primary w-100" ${item.stok <= 0 ? 'disabled' : ''}>
                            <i class="bi bi-cart-plus"></i> Tambah ke Keranjang
                        </button>
                    </div>
                </div>
            </div>
        `;

        container.appendChild(col);
    });

    // Save current state to localStorage
    localStorage.setItem('peralatan', JSON.stringify(peralatan));
}

// Fungsi untuk menampilkan modal sewa
function tampilkanModalSewa(item) {
    selectedItem = item;
    const modal = new bootstrap.Modal(document.getElementById('sewaModal'));
    
    // Update detail barang
    const detailBarang = document.getElementById('detailBarang');
    detailBarang.innerHTML = `
        <p><strong>${item.nama}</strong></p>
        <p>Harga: Rp ${item.harga.toLocaleString('id-ID')}/hari</p>
        <p>Stok tersedia: ${item.stok} unit</p>
    `;

    // Reset form
    document.getElementById('sewaForm').reset();
    document.getElementById('totalHarga').value = '';

    modal.show();
}

// Fungsi untuk menyewa peralatan
function sewaPeralatan(id) {
    const item = peralatan.find(p => p.id === id);
    if (item && item.stok > 0) {
        tampilkanModalSewa(item);
    }
}

// Fungsi untuk menghitung total harga
function hitungTotalHarga() {
    if (!selectedItem) return;

    const lamaSewa = parseInt(document.querySelector('input[name="lamaSewa"]').value) || 0;
    const jumlahUnit = parseInt(document.querySelector('input[name="jumlahUnit"]').value) || 0;
    const totalHarga = selectedItem.harga * lamaSewa * jumlahUnit;
    
    document.getElementById('totalHarga').value = totalHarga.toLocaleString('id-ID');
}

// Fungsi untuk menambah penyewa
function tambahPenyewa(formData) {
    const penyewa = {
        id: Date.now(),
        nama: formData.get('nama'),
        telepon: formData.get('telepon'),
        email: formData.get('email'),
        tanggalMulai: formData.get('tanggalMulai'),
        tanggalSelesai: formData.get('tanggalSelesai'),
        alamat: formData.get('alamat'),
        items: cart.map(item => ({
            id: item.id,
            nama: item.nama,
            quantity: item.quantity,
            harga: item.harga
        })),
        status: 'Aktif',
        totalHarga: cart.reduce((total, item) => total + (item.harga * item.quantity), 0)
    };

    daftarPenyewa.push(penyewa);
    tampilkanDaftarPenyewa();

    // Update stok
    cart.forEach(cartItem => {
        const item = peralatan.find(p => p.id === cartItem.id);
        if (item) {
            item.stok -= cartItem.quantity;
        }
    });

    // Reset cart
    cart = [];
    updateCartCount();
    tampilkanPeralatan();
}

// Fungsi untuk menampilkan daftar penyewa
// Format rental items list
function formatItemsList(items) {
    return items.map(item => {
        const categoryClass = item.kategori === 'tenda' ? 'success' : 
                            item.kategori === 'carrier' ? 'info' : 'secondary';
        return `<div class="mb-1">
            <span class="fw-medium">${item.nama}</span> 
            <span class="text-muted">&times; ${item.quantity}</span>
            <span class="badge bg-${categoryClass} ms-1">${item.kategori}</span>
        </div>`;
    }).join('');
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Calculate remaining days
function calculateRemainingDays(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const remainingDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return remainingDays;
}

// Update rental status
function updateRentalStatus() {
    const today = new Date();
    daftarPenyewa.forEach(penyewa => {
        const endDate = new Date(penyewa.tanggalSelesai);
        if (today > endDate && penyewa.status === 'Aktif') {
            penyewa.status = 'Selesai';
        }
    });
    // Save to localStorage
    localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));
}

// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Load saved data
    loadDataFromStorage();

    // Admin event listeners (dibuat aman)
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) adminLoginBtn.addEventListener('click', showAdminLoginModal);
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) adminLoginForm.addEventListener('submit', handleAdminLogin);
    const adminBackBtn = document.getElementById('adminBackBtn');
    if (adminBackBtn) adminBackBtn.addEventListener('click', () => {
        bootstrap.Modal.getInstance(document.getElementById('adminControlsModal')).hide();
    });
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) addProductBtn.addEventListener('click', () => showProductForm());
    const productForm = document.getElementById('productForm');
    if (productForm) productForm.addEventListener('submit', handleProductForm);

    // Rental form event listeners (dibuat aman)
    const sewaForm = document.getElementById('sewaForm');
    if (sewaForm) {
        sewaForm.addEventListener('submit', tambahPenyewa);
        const lamaSewa = sewaForm.querySelector('input[name="lamaSewa"]');
        if (lamaSewa) {
            lamaSewa.addEventListener('input', function() {
                const days = parseInt(this.value) || 0;
                const totalPerDay = cart.reduce((sum, item) => sum + (item.harga * item.quantity), 0);
                const totalHarga = totalPerDay * days;
                const totalHargaInput = document.getElementById('totalHarga');
                if (totalHargaInput) totalHargaInput.value = totalHarga.toLocaleString('id-ID');
            });
        }
    }

    // Initialize displays
    if (typeof tampilkanPeralatan === 'function') tampilkanPeralatan();

    // Initialize cart button (dibuat aman)
    const cartButton = document.getElementById('cartButton');
    if (cartButton) cartButton.addEventListener('click', function(e) {
        e.preventDefault();
        showCart();
    });

    // Initialize daftar penyewa button (dibuat aman)
    const daftarPenyewaButton = document.getElementById('daftarPenyewaButton');
    if (daftarPenyewaButton) daftarPenyewaButton.addEventListener('click', function(e) {
        e.preventDefault();
        tampilkanSemuaPenyewa();
    });

    // Image dropdown & preview
    const imageSelect = document.getElementById('productImage');
    const imagePreview = document.getElementById('productImagePreview');
    if (imageSelect && imagePreview) {
        imageSelect.addEventListener('change', function() {
            const val = imageSelect.value;
            if (val) {
                imagePreview.src = val;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.src = '#';
                imagePreview.style.display = 'none';
            }
        });
    }
    populateImageDropdown();
});

// Display all rentals
function tampilkanDaftarPenyewa() {
    const tbody = document.getElementById('daftarPenyewa');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    daftarPenyewa.forEach(penyewa => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${penyewa.nama || '-'}</td>
            <td>${penyewa.noKtp || '-'}</td>
            <td>${penyewa.noHp || '-'}</td>
            <td>${formatItemsList(penyewa.items)}</td>
            <td>${formatDate(penyewa.tanggalMulai)}</td>
            <td>${penyewa.lamaSewa} hari</td>
            <td>Rp ${penyewa.totalHarga.toLocaleString('id-ID')}</td>
            <td>
                <span class="badge ${penyewa.status === 'Aktif' ? 'bg-success' : 'bg-secondary'}">
                    ${penyewa.status}
                </span>
            </td>
            <td>
                ${penyewa.status === 'Aktif' ? 
                    `<button class="btn btn-sm btn-success" onclick="selesaikanPenyewaan(${penyewa.id})">
                        <i class="bi bi-check-circle"></i>
                    </button>` : 
                    ''
                }
                <button class="btn btn-sm btn-danger d-none" onclick="deleteRenter(${penyewa.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Update last update time
    const lastUpdateElement = document.querySelector('#daftarPenyewaModal .modal-footer small');
    if (lastUpdateElement) {
        lastUpdateElement.textContent = `Updated: ${new Date().toLocaleString('id-ID')}`;
    }
}

// Display active rentals
function tampilkanPenyewaAktif() {
    const container = document.getElementById('daftarPenyewaAktif');
    if (!container) return;

    updateRentalStatus();
    container.innerHTML = '';

    const activePenyewa = daftarPenyewa.filter(p => p.status === 'Aktif');

    if (activePenyewa.length === 0) {
        container.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-muted">
                    <i>Tidak ada penyewaan aktif saat ini</i>
                </td>
            </tr>
        `;
        return;
    }

    activePenyewa.forEach(penyewa => {
        const row = document.createElement('tr');
        const remainingDays = calculateRemainingDays(penyewa.tanggalSelesai);
        const statusClass = remainingDays <= 2 ? 'warning' : 'success';
        
        row.innerHTML = `
            <td class="fw-medium px-4">${penyewa.nama}</td>
            <td>${formatItemsList(penyewa.items)}</td>
            <td>${formatDate(penyewa.tanggalMulai)}</td>
            <td class="text-center">
                <span class="badge bg-${statusClass}">${remainingDays} hari</span>
            </td>
            <td class="text-end px-4 fw-medium">Rp ${penyewa.totalHarga.toLocaleString('id-ID')}</td>
            <td class="text-center">
                <span class="badge bg-success px-3">Aktif</span>
            </td>
            <td class="text-center">
                <button class="btn btn-sm btn-outline-success" onclick="selesaikanPenyewaan('${penyewa.id}')">Selesai</button>
            </td>
        `;
        container.appendChild(row);
    });
}

// Show all rentals modal
function tampilkanSemuaPenyewa() {
    // Update rental statuses
    updateRentalStatus();
    
    // Update both tabs
    tampilkanPenyewaAktif();
    tampilkanDaftarPenyewa();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('daftarPenyewaModal'));
    modal.show();
}

// Mark rental as complete
function selesaikanPenyewaan(id) {
    if (confirm('Apakah Anda yakin ingin menyelesaikan penyewaan ini?')) {
        const penyewa = daftarPenyewa.find(p => p.id === id);
        if (penyewa) {
            penyewa.status = 'Selesai';
            penyewa.tanggalSelesai = new Date().toISOString().split('T')[0];
            localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));
            tampilkanPenyewaAktif();
        }
    }
}

// Load data from localStorage
function loadDataFromStorage() {
    const savedPeralatan = localStorage.getItem('peralatan');
    const savedPenyewa = localStorage.getItem('daftarPenyewa');
    
    if (savedPeralatan) {
        peralatan = JSON.parse(savedPeralatan);
        // Ensure all IDs are numbers
        peralatan = peralatan.map(item => ({
            ...item,
            id: parseInt(item.id),
            harga: parseInt(item.harga),
            stok: parseInt(item.stok)
        }));
    }
    
    if (savedPenyewa) {
        daftarPenyewa = JSON.parse(savedPenyewa);
        updateRentalStatus(); // Update status after loading
        tampilkanPenyewaAktif(); // Display active rentals
    }
}

// Event listeners
// Admin Functions
function showAdminLoginModal() {
    const modal = new bootstrap.Modal(document.getElementById('adminLoginModal'));
    modal.show();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        isAdminMode = true;
        bootstrap.Modal.getInstance(document.getElementById('adminLoginModal')).hide();
        showAdminControls();
        // Show delete buttons in customer list
        document.getElementById('deleteRenterBtn').classList.remove('d-none');
    } else {
        alert('Invalid credentials!');
    }
}

function showAdminControls() {
    const modal = new bootstrap.Modal(document.getElementById('adminControlsModal'));
    updateAdminProductsList();
    modal.show();
}

function updateAdminProductsList() {
    const tbody = document.getElementById('adminProductsList');
    tbody.innerHTML = '';

    peralatan.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.nama}</td>
            <td>Rp ${item.harga}</td>
            <td>${item.stok}</td>
            <td>
                <button class="btn btn-sm btn-primary me-1" onclick="editProduct(${item.id})">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct(${item.id})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function showProductForm(product = null) {
    const modal = new bootstrap.Modal(document.getElementById('productFormModal'));
    const form = document.getElementById('productForm');
    const title = document.getElementById('productFormTitle');

    title.textContent = product ? 'Edit Product' : 'Add New Product';

    if (product) {
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.nama;
        document.getElementById('productPrice').value = product.harga;
        document.getElementById('productCategory').value = product.kategori;
        document.getElementById('productStock').value = product.stok;
        document.getElementById('productImage').value = product.gambar;
        document.getElementById('productDescription').value = product.deskripsi;
    } else {
        form.reset();
        document.getElementById('productId').value = '';
    }

    modal.show();
}

function editProduct(id) {
    const product = peralatan.find(p => p.id === id);
    if (product) {
        showProductForm(product);
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        peralatan = peralatan.filter(p => p.id !== id);
        updateAdminProductsList();
        tampilkanPeralatan();
        // Save to localStorage
        localStorage.setItem('peralatan', JSON.stringify(peralatan));
    }
}

function handleProductForm(e) {
    e.preventDefault();
    const formData = {
        id: parseInt(document.getElementById('productId').value) || Math.max(...peralatan.map(p => p.id), 0) + 1,
        nama: document.getElementById('productName').value,
        harga: parseInt(document.getElementById('productPrice').value),
        kategori: document.getElementById('productCategory').value,
        status: 'Tersedia',
        stok: parseInt(document.getElementById('productStock').value),
        gambar: document.getElementById('productImage').value,
        deskripsi: document.getElementById('productDescription').value
    };

    const existingIndex = peralatan.findIndex(p => p.id === formData.id);
    if (existingIndex !== -1) {
        peralatan[existingIndex] = formData;
    } else {
        peralatan.push(formData);
    }

    // Save to localStorage
    localStorage.setItem('peralatan', JSON.stringify(peralatan));

    // Update displays
    updateAdminProductsList();
    tampilkanPeralatan();

    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('productFormModal')).hide();
}

function deleteRenter(id) {
    if (confirm('Are you sure you want to delete this rental record?')) {
        daftarPenyewa = daftarPenyewa.filter(p => p.id !== id);
        localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));
        tampilkanDaftarPenyewa();
        tampilkanPenyewaAktif();
    }
}

function checkoutCart() {
    if (cart.length === 0) {
        alert('Keranjang masih kosong!');
        return;
    }

    // Show rental form modal
    const sewaModal = new bootstrap.Modal(document.getElementById('sewaModal'));
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    const tanggalMulaiInput = document.querySelector('#sewaForm input[name="tanggalMulai"]');
    tanggalMulaiInput.min = today;
    tanggalMulaiInput.value = today;

    // Set default rental duration
    document.querySelector('#sewaForm input[name="lamaSewa"]').value = '1';

    // Update detail barang section
    const detailBarang = document.getElementById('detailBarang');
    let totalHargaPerHari = 0;
    let detailHTML = '<ul class="list-unstyled mb-0">';
    
    cart.forEach(item => {
        const subtotal = item.harga * item.quantity;
        totalHargaPerHari += subtotal;
        detailHTML += `
            <li class="mb-2">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="mb-0">${item.nama}</h6>
                        <small class="text-muted">${item.quantity} unit × Rp ${item.harga.toLocaleString('id-ID')}</small>
                    </div>
                    <span>Rp ${subtotal.toLocaleString('id-ID')}</span>
                </div>
            </li>
        `;
    });
    
    detailHTML += `
        <li class="border-top pt-2 mt-2">
            <div class="d-flex justify-content-between align-items-center">
                <strong>Total per Hari</strong>
                <strong class="text-primary">Rp ${totalHargaPerHari.toLocaleString('id-ID')}</strong>
            </div>
        </li>
    </ul>`;
    
    detailBarang.innerHTML = detailHTML;

    // Hide cart modal and show rental form
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) {
        cartModal.hide();
    }
    sewaModal.show();
}

function updateRentalItemsList() {
    const tbody = document.getElementById('rentalItemsList');
    const totalElement = document.getElementById('rentalTotalPerDay');
    let total = 0;

    tbody.innerHTML = '';
    cart.forEach(item => {
        const subtotal = item.harga * item.quantity;
        total += subtotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nama}</td>
            <td><span class="badge bg-${item.kategori === 'tenda' ? 'success' : item.kategori === 'carrier' ? 'info' : 'secondary'}">
                ${item.kategori}
            </span></td>
            <td>${item.quantity} unit</td>
            <td class="text-end">Rp ${item.harga.toLocaleString('id-ID')}</td>
            <td class="text-end">Rp ${subtotal.toLocaleString('id-ID')}</td>
        `;
        tbody.appendChild(row);
    });

    totalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;
}

function tambahPenyewa(e) {
    e.preventDefault();
    const form = document.getElementById('sewaForm');
    
    if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
    }

    const formData = new FormData(form);
    const rentalData = {
        nama: formData.get('nama'),
        noKtp: formData.get('noKtp'),
        noHp: formData.get('telepon'),
        tanggalMulai: formData.get('tanggalMulai'),
        lamaSewa: parseInt(formData.get('lamaSewa')),
        items: cart.map(item => ({
            id: item.id,
            nama: item.nama,
            harga: item.harga,
            quantity: item.quantity
        })),
        totalHarga: cart.reduce((total, item) => total + (item.harga * item.quantity), 0) * parseInt(formData.get('lamaSewa'))
    };

    // Add to daftarPenyewa
    const id = daftarPenyewa.length > 0 ? Math.max(...daftarPenyewa.map(p => p.id)) + 1 : 1;
    const penyewa = {
        id,
        ...rentalData,
        status: 'Aktif',
        tanggalSelesai: new Date(new Date(rentalData.tanggalMulai).getTime() + (rentalData.lamaSewa * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
    };

    daftarPenyewa.push(penyewa);
    localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));

    // Update stock for rented items
    cart.forEach(item => {
        const product = peralatan.find(p => p.id === item.id);
        if (product) {
            product.stok -= item.quantity;
        }
    });
    localStorage.setItem('peralatan', JSON.stringify(peralatan));

    // Clear cart and form
    cart = [];
    updateCartCount();
    form.reset();

    // Add to daftarPenyewa
    const savedPenyewa = localStorage.getItem('daftarPenyewa');
    const daftarPenyewa = savedPenyewa ? JSON.parse(savedPenyewa) : [];

    const newRental = {
        id: daftarPenyewa.length > 0 ? Math.max(...daftarPenyewa.map(p => p.id)) + 1 : 1,
        nama: formData.get('nama'),
        noKtp: formData.get('noKtp'),
        noHp: formData.get('telepon'),
        items: cart.map(item => ({
            nama: item.nama,
            quantity: item.quantity,
            harga: item.harga
        })),
        tanggalMulai: new Date().toISOString(),
        lamaSewa: parseInt(formData.get('lamaSewa')),
        totalHarga: totalHarga,
        status: 'Aktif'
    };
    
    daftarPenyewa.push(newRental);
    localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));

    // Reset form dan keranjang
    form.reset();
    form.classList.remove('was-validated');
    cart = [];
    updateCartCount();
    showCart(); // Mengganti updateCartDisplay dengan showCart

    // Tutup modal dan tampilkan pesan
    const modal = bootstrap.Modal.getInstance(document.getElementById('sewaModal'));
    modal.hide();
    alert('Penyewaan berhasil! Mengalihkan ke halaman daftar penyewa...');
    
    // Redirect ke halaman daftar penyewa
    window.location.href = 'daftar-penyewa.html';
}

function submitRental() {
    try {
        // Ambil form dan validasi
        const form = document.getElementById('sewaForm');
        if (!form) {
            throw new Error('Form tidak ditemukan');
        }

        // Ambil data form
        const formData = new FormData(form);
        const nama = formData.get('nama');
        const noKtp = formData.get('noKtp');
        const noHp = formData.get('telepon');
        const tanggalMulai = formData.get('tanggalMulai');
        const lamaSewa = parseInt(formData.get('lamaSewa'));
        const fotoKtp = form.querySelector('input[name="fotoKtp"]').files[0];

        // Validasi data
        if (!nama || !noKtp || !noHp || !tanggalMulai || !lamaSewa || !fotoKtp) {
            alert('Mohon lengkapi semua data yang diperlukan');
            return;
        }

        // Validasi format input
        if (noKtp.length !== 16) {
            alert('Nomor KTP harus 16 digit');
            return;
        }

        if (noHp.length < 10 || noHp.length > 13 || !noHp.startsWith('08')) {
            alert('Nomor HP harus 10-13 digit dan dimulai dengan 08');
            return;
        }

        // Validasi keranjang
        if (!cart || cart.length === 0) {
            alert('Keranjang masih kosong! Silakan pilih barang terlebih dahulu.');
            return;
        }

        // Validasi ukuran foto (max 2MB)
        if (fotoKtp.size > 2 * 1024 * 1024) {
            alert('Ukuran foto KTP terlalu besar. Maksimal 2MB');
            return;
        }

        // Konversi foto ke base64
        const reader = new FileReader();
        reader.onload = function(e) {
            const fotoKtpBase64 = e.target.result;

            // Ambil data penyewa yang sudah ada
            const savedPenyewa = localStorage.getItem('daftarPenyewa');
            const daftarPenyewa = savedPenyewa ? JSON.parse(savedPenyewa) : [];

            // Hitung total harga
            const totalHarga = cart.reduce((total, item) => {
                return total + (item.harga * item.quantity * lamaSewa);
            }, 0);

            // Buat data penyewa baru
            const newPenyewa = {
                id: daftarPenyewa.length > 0 ? Math.max(...daftarPenyewa.map(p => p.id)) + 1 : 1,
                nama,
                noKtp,
                noHp,
                tanggalMulai,
                lamaSewa,
                fotoKtp: fotoKtpBase64,
                items: cart.map(item => ({
                    id: item.id,
                    nama: item.nama,
                    harga: item.harga,
                    quantity: item.quantity
                })),
                totalHarga,
                status: 'Aktif'
            };

            // Simpan ke localStorage
            daftarPenyewa.push(newPenyewa);
            localStorage.setItem('daftarPenyewa', JSON.stringify(daftarPenyewa));

            // Update stok barang
            cart.forEach(item => {
                const product = peralatan.find(p => p.id === item.id);
                if (product) {
                    product.stok -= item.quantity;
                }
            });
            localStorage.setItem('peralatan', JSON.stringify(peralatan));

            // Reset form dan keranjang
            form.reset();
            form.classList.remove('was-validated');
            cart = [];
            updateCartCount();
            showCart();

            // Tutup modal dan tampilkan pesan
            const modal = bootstrap.Modal.getInstance(document.getElementById('sewaModal'));
            modal.hide();
            alert('Penyewaan berhasil! Mengalihkan ke halaman daftar penyewa...');
            
            // Redirect ke halaman daftar penyewa
            window.location.href = 'daftar-penyewa.html';
        };

        // Baca file sebagai Data URL (base64)
        reader.readAsDataURL(fotoKtp);
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan: ' + error.message);
    }
}

function populateImageDropdown(selectedValue = '') {
    console.log('populateImageDropdown dijalankan'); // DEBUG
    console.log('populateImageDropdown: Mulai mengambil data gambar dari backend'); // DEBUG
    const select = document.getElementById('productImage');
    const preview = document.getElementById('productImagePreview');
    if (!select) {
        console.error('Dropdown #productImage tidak ditemukan di DOM!');
        return;
    }
    select.innerHTML = '<option value="">-- Pilih gambar produk --</option>';
    fetch('http://localhost:3001/images/list')
        .then(res => {
            console.log('populateImageDropdown: Data gambar diterima dari backend'); // DEBUG
            return res.json();
        })
        .then(files => {
            console.log('populateImageDropdown: Data gambar berhasil di-parse'); // DEBUG
            console.log('Files dari backend:', files); // DEBUG
            files.forEach(file => {
                const opt = document.createElement('option');
                opt.value = 'http://localhost:3001/images/' + file;
                opt.textContent = file;
                select.appendChild(opt);
            });
            // Set selected value if provided
            if (selectedValue) {
                select.value = selectedValue;
                if (preview && selectedValue) {
                    preview.src = selectedValue;
                    preview.style.display = 'block';
                }
            }
        })
        .catch(err => {
            console.error('Gagal fetch images/list:', err);
        });
}
