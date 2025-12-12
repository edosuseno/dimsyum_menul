// ========== CLOUDINARY CONFIG ==========
const CLOUDINARY_CONFIG = {
    cloudName: 'dnrdgvggx',  // Ganti dengan Cloud Name Anda
    uploadPreset: 'dimsum_upload'   // Ganti dengan Upload Preset Anda
};

// ========== ADMIN APP LOGIC ==========
const adminApp = {
    currentUser: null,
    products: [],
    orders: [],
    settings: {},

    // Upload image to Cloudinary
    uploadToCloudinary: async (file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', 'dimsum-products');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            return data.secure_url; // Return image URL
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            throw error;
        }
    },

    // Initialize
    init: () => {
        // Load data from localStorage
        adminApp.loadData();

        // Check if already logged in
        const savedUser = localStorage.getItem('admin_logged_in');
        if (savedUser) {
            adminApp.showDashboard();
        }
    },

    // Load data from localStorage
    loadData: () => {
        // Load products (or use default from main site)
        const savedProducts = localStorage.getItem('dimsum_products');
        if (savedProducts) {
            adminApp.products = JSON.parse(savedProducts);
        } else {
            // Default products
            adminApp.products = [
                { id: 1, name: "Paket Mix (Isi 4)", price: 15000, img: "images/paket-mix.png", desc: "Best Seller! Kombinasi sempurna Ayam, Udang & Jamur dalam satu porsi. Cocok untuk keluarga." },
                { id: 2, name: "Siomay Ayam Premium (Isi 4)", price: 14000, img: "images/siomay-ayam.png", desc: "Full daging ayam cincang pilihan, tekstur padat & juicy. Favorit anak-anak!" },
                { id: 3, name: "Hakao Udang (Isi 4)", price: 16000, img: "images/hakao-udang.png", desc: "Kulit transparan berisi udang segar. Klasik dan lezat!" },
                { id: 4, name: "Ekado Telur Puyuh (Isi 3)", price: 18000, img: "images/ekado-telur.png", desc: "Kulit tahu renyah berisi daging cincang & telur puyuh utuh. Unik dan lezat!" }
            ];
        }

        // Load orders
        const savedOrders = localStorage.getItem('dimsum_orders');
        adminApp.orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Load settings
        const savedSettings = localStorage.getItem('dimsum_settings');
        adminApp.settings = savedSettings ? JSON.parse(savedSettings) : {
            storeName: 'DIMSUM MENUL',
            tagline: 'Spesial Resep Bunda Nathan',
            whatsapp: '6281234567890',
            email: 'info@dimsummenul.com',
            hoursWeekday: '08:00 - 20:00',
            hoursSunday: '09:00 - 18:00',
            deliveryArea: 'Jakarta, Tangerang, Depok, Bekasi',
            toppings: [
                { id: 1, name: 'Chili Oil', price: 2000 },
                { id: 2, name: 'Mayonnaise', price: 1000 }
            ]
        };

        // Ensure toppings exist (for backward compatibility)
        if (!adminApp.settings.toppings) {
            adminApp.settings.toppings = [
                { id: 1, name: 'Chili Oil', price: 2000 },
                { id: 2, name: 'Mayonnaise', price: 1000 }
            ];
        }
    },

    // Save data to localStorage
    saveData: () => {
        localStorage.setItem('dimsum_products', JSON.stringify(adminApp.products));
        localStorage.setItem('dimsum_orders', JSON.stringify(adminApp.orders));
        localStorage.setItem('dimsum_settings', JSON.stringify(adminApp.settings));
    },

    // ========== LOGIN / LOGOUT ==========
    login: (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Simple authentication (in production, use proper backend)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('admin_logged_in', 'true');
            adminApp.currentUser = username;
            adminApp.showDashboard();
        } else {
            alert('Username atau password salah!');
        }
        return false;
    },

    logout: () => {
        if (confirm('Yakin ingin logout?')) {
            localStorage.removeItem('admin_logged_in');
            location.reload();
        }
    },

    showDashboard: () => {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'flex';
        adminApp.updateDashboard();
        adminApp.renderProducts();
        adminApp.renderOrders();
        adminApp.loadSettings();
    },

    // ========== TAB NAVIGATION ==========
    showTab: (tabName) => {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active to clicked nav
        event.target.classList.add('active');

        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });

        // Show selected tab
        document.getElementById('tab-' + tabName).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'products': 'Manajemen Produk',
            'orders': 'Daftar Pesanan',
            'reports': 'Laporan Pendapatan',
            'settings': 'Pengaturan'
        };
        document.getElementById('page-title').innerText = titles[tabName];

        // Auto-load laporan saat tab Reports dibuka (kecuali dari updateOrderStatus)
        if (tabName === 'reports' && !adminApp.skipAutoGenerate) {
            setTimeout(() => {
                adminApp.setDefaultReportDate();
                adminApp.generateReport();
            }, 100);
        }

        // Reset flag
        adminApp.skipAutoGenerate = false;
    },

    // ========== DASHBOARD ==========
    updateDashboard: () => {
        const totalOrders = adminApp.orders.length;
        const totalProducts = adminApp.products.length;
        const pendingOrders = adminApp.orders.filter(o => o.status === 'pending').length;
        const completedOrders = adminApp.orders.filter(o => o.status === 'completed').length;

        document.getElementById('stat-orders').innerText = totalOrders;
        document.getElementById('stat-products').innerText = totalProducts;
        document.getElementById('stat-pending').innerText = pendingOrders;
        document.getElementById('stat-completed').innerText = completedOrders;

        // Show recent orders
        const recentOrders = adminApp.orders.slice(-5).reverse();
        const container = document.getElementById('recent-orders-list');

        if (recentOrders.length === 0) {
            container.innerHTML = '<p class="empty-state">Belum ada pesanan</p>';
        } else {
            container.innerHTML = recentOrders.map(order => `
                <div style="padding: 1rem; border-bottom: 1px solid #f0f0f0;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                        <strong>#${order.id}</strong>
                        <span class="status-badge status-${order.status}">${order.status}</span>
                    </div>
                    <div style="font-size:0.9rem; color:#666;">
                        ${order.customerName} - ${order.items.length} item(s) - Rp ${order.total.toLocaleString('id-ID')}
                    </div>
                </div>
            `).join('');
        }
    },

    // ========== PRODUCTS MANAGEMENT ==========
    renderProducts: () => {
        const container = document.getElementById('products-list');
        container.innerHTML = adminApp.products.map(product => `
            <div class="product-item">
                <img src="${product.img}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
                <div class="product-item-body">
                    <h4>${product.name}</h4>
                    <div class="price">Rp ${product.price.toLocaleString('id-ID')}</div>
                    <p>${product.desc}</p>
                    <div class="product-actions">
                        <button class="btn-icon btn-edit" onclick="adminApp.editProduct(${product.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn-icon btn-delete" onclick="adminApp.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i> Hapus
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    openProductModal: (productId = null) => {
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        form.reset();

        // Reset image preview
        adminApp.removeImage();

        if (productId) {
            const product = adminApp.products.find(p => p.id === productId);
            document.getElementById('product-modal-title').innerText = 'Edit Produk';
            document.getElementById('product-id').value = product.id;
            document.getElementById('product-name').value = product.name;
            document.getElementById('product-price').value = product.price;
            document.getElementById('product-desc').value = product.desc;

            // Show existing image
            if (product.img) {
                if (product.img.startsWith('data:image')) {
                    // Base64 image
                    document.getElementById('product-img-data').value = product.img;
                    document.getElementById('image-preview').src = product.img;
                    document.getElementById('image-preview-container').style.display = 'block';
                    document.getElementById('upload-section').style.display = 'none';
                } else {
                    // URL image
                    document.getElementById('product-img').value = product.img;
                }
            }
        } else {
            document.getElementById('product-modal-title').innerText = 'Tambah Produk';
            document.getElementById('product-id').value = '';
        }

        modal.classList.add('active');
    },

    closeProductModal: () => {
        document.getElementById('product-modal').classList.remove('active');
        adminApp.removeImage(); // Reset image when closing
    },

    saveProduct: (e) => {
        e.preventDefault();

        const id = document.getElementById('product-id').value;
        const name = document.getElementById('product-name').value;
        const price = parseInt(document.getElementById('product-price').value);
        const desc = document.getElementById('product-desc').value;

        // Priority: uploaded image (base64) > URL input > placeholder
        const imgData = document.getElementById('product-img-data').value;
        const imgUrl = document.getElementById('product-img').value;
        const img = imgData || imgUrl || 'https://via.placeholder.com/300x180?text=No+Image';

        if (id) {
            // Edit existing
            const index = adminApp.products.findIndex(p => p.id == id);
            adminApp.products[index] = { id: parseInt(id), name, price, desc, img };
        } else {
            // Add new
            const newId = adminApp.products.length > 0 ? Math.max(...adminApp.products.map(p => p.id)) + 1 : 1;
            adminApp.products.push({ id: newId, name, price, desc, img });
        }

        adminApp.saveData();
        adminApp.renderProducts();
        adminApp.updateDashboard();
        adminApp.closeProductModal();
        adminApp.showToast('✓ Produk berhasil disimpan!');
        return false;
    },

    editProduct: (id) => {
        adminApp.openProductModal(id);
    },

    deleteProduct: (id) => {
        if (confirm('Yakin ingin menghapus produk ini?')) {
            adminApp.products = adminApp.products.filter(p => p.id !== id);
            adminApp.saveData();
            adminApp.renderProducts();
            adminApp.updateDashboard();
            adminApp.showToast('✓ Produk berhasil dihapus!');
        }
    },

    // ========== ORDERS MANAGEMENT ==========
    currentFilter: 'all', // Track current filter

    renderOrders: () => {
        const tbody = document.getElementById('orders-tbody');

        // Filter orders based on current filter
        let filteredOrders = adminApp.orders;
        if (adminApp.currentFilter !== 'all') {
            filteredOrders = adminApp.orders.filter(o => o.status === adminApp.currentFilter);
        }

        // Update counters
        document.getElementById('count-all').innerText = adminApp.orders.length;
        document.getElementById('count-pending').innerText = adminApp.orders.filter(o => o.status === 'pending').length;
        document.getElementById('count-processing').innerText = adminApp.orders.filter(o => o.status === 'processing').length;
        document.getElementById('count-completed').innerText = adminApp.orders.filter(o => o.status === 'completed').length;

        if (filteredOrders.length === 0) {
            const message = adminApp.currentFilter === 'all'
                ? 'Belum ada pesanan'
                : `Tidak ada pesanan ${adminApp.currentFilter}`;
            tbody.innerHTML = `<tr><td colspan="7" class="empty-state">${message}</td></tr>`;
            return;
        }

        tbody.innerHTML = filteredOrders.map(order => `
            <tr>
                <td><strong>#${order.id}</strong></td>
                <td>${order.date}</td>
                <td>${order.customerName}<br><small>${order.customerPhone}</small></td>
                <td>${order.items.length} item(s)</td>
                <td><strong>Rp ${order.total.toLocaleString('id-ID')}</strong></td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                <td style="display:flex; gap:0.5rem;">
                    <button class="btn-icon btn-edit" onclick="adminApp.viewOrder(${order.id})" title="Lihat Detail">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="adminApp.deleteOrder(${order.id})" title="Hapus">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    },

    filterOrders: (status) => {
        adminApp.currentFilter = status;

        // Update active tab
        document.querySelectorAll('.order-tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-status') === status) {
                btn.classList.add('active');
            }
        });

        // Re-render with filter
        adminApp.renderOrders();
    },

    deleteOrder: (id) => {
        if (confirm('Yakin ingin menghapus pesanan ini? Data tidak bisa dikembalikan!')) {
            adminApp.orders = adminApp.orders.filter(o => o.id !== id);
            adminApp.saveData();
            adminApp.renderOrders();
            adminApp.updateDashboard();
            adminApp.showToast('✓ Pesanan berhasil dihapus!');
        }
    },

    viewOrder: (id) => {
        const order = adminApp.orders.find(o => o.id === id);
        if (!order) return;

        const modal = document.getElementById('order-modal');
        const content = document.getElementById('order-detail-content');

        content.innerHTML = `
            <div style="margin-bottom: 1.5rem;">
                <h4>Informasi Pesanan</h4>
                <p><strong>ID:</strong> #${order.id}</p>
                <p><strong>Tanggal:</strong> ${order.date}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${order.status}">${order.status}</span></p>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h4>Informasi Pelanggan</h4>
                <p><strong>Nama:</strong> ${order.customerName}</p>
                <p><strong>Telepon:</strong> ${order.customerPhone}</p>
                <p><strong>Alamat:</strong> ${order.customerAddress}</p>
            </div>
            <div style="margin-bottom: 1.5rem;">
                <h4>Detail Pesanan</h4>
                ${order.items.map(item => `
                    <div style="padding: 0.5rem 0; border-bottom: 1px dashed #ddd;">
                        ${item.qty}x ${item.name} - Rp ${item.total.toLocaleString('id-ID')}
                    </div>
                `).join('')}
                <div style="margin-top: 1rem; font-size: 1.2rem;">
                    <strong>Total: Rp ${order.total.toLocaleString('id-ID')}</strong>
                </div>
            </div>
            <div style="display:flex; gap:1rem;">
                <button class="btn-primary" onclick="adminApp.updateOrderStatus(${order.id}, 'processing')">
                    Proses
                </button>
                <button class="btn-primary" style="background:#10b981;" onclick="adminApp.updateOrderStatus(${order.id}, 'completed')">
                    Selesai
                </button>
            </div>
        `;

        modal.classList.add('active');
    },

    closeOrderModal: () => {
        document.getElementById('order-modal').classList.remove('active');
    },

    updateOrderStatus: (id, status) => {
        const order = adminApp.orders.find(o => o.id === id);
        if (order) {
            order.status = status;
            adminApp.saveData();
            adminApp.renderOrders();
            adminApp.updateDashboard();
            adminApp.closeOrderModal();
            adminApp.showToast('✓ Status pesanan diupdate!');

            // Auto-generate laporan jika status = completed
            if (status === 'completed') {
                console.log('✓ Pesanan completed, auto-generate laporan...');

                // Set flag to skip auto-generate in showTab
                adminApp.skipAutoGenerate = true;

                // Switch to reports tab first
                adminApp.showTab('reports');

                // Wait for tab to render, then set date and generate
                setTimeout(() => {
                    try {
                        console.log('Setting default date...');
                        adminApp.setDefaultReportDate();
                        console.log('Generating report...');
                        adminApp.generateReport();
                        console.log('✓ Laporan berhasil di-generate!');
                    } catch (e) {
                        console.error('❌ Error generating report:', e);
                    }
                }, 300);
            }
        }
    },

    // ========== SETTINGS ==========
    loadSettings: () => {
        document.getElementById('set-store-name').value = adminApp.settings.storeName;
        document.getElementById('set-tagline').value = adminApp.settings.tagline;
        document.getElementById('set-whatsapp').value = adminApp.settings.whatsapp;
        document.getElementById('set-email').value = adminApp.settings.email;
        document.getElementById('set-hours-weekday').value = adminApp.settings.hoursWeekday;
        document.getElementById('set-hours-sunday').value = adminApp.settings.hoursSunday;
        document.getElementById('set-delivery-area').value = adminApp.settings.deliveryArea;

        // Render toppings list
        adminApp.renderToppings();
    },

    saveSettings: (e) => {
        e.preventDefault();

        // Update settings but preserve toppings
        adminApp.settings.storeName = document.getElementById('set-store-name').value;
        adminApp.settings.tagline = document.getElementById('set-tagline').value;
        adminApp.settings.whatsapp = document.getElementById('set-whatsapp').value;
        adminApp.settings.email = document.getElementById('set-email').value;
        adminApp.settings.hoursWeekday = document.getElementById('set-hours-weekday').value;
        adminApp.settings.hoursSunday = document.getElementById('set-hours-sunday').value;
        adminApp.settings.deliveryArea = document.getElementById('set-delivery-area').value;

        // Toppings already managed separately, don't overwrite

        adminApp.saveData();
        adminApp.showToast('✓ Pengaturan berhasil disimpan!');
        return false;
    },

    // ========== TOPPING MANAGEMENT ==========
    renderToppings: () => {
        const container = document.getElementById('toppings-list');
        const toppings = adminApp.settings.toppings || [];

        if (toppings.length === 0) {
            container.innerHTML = '<p class="empty-state" style="padding:1rem; text-align:center;">Belum ada topping</p>';
            return;
        }

        container.innerHTML = toppings.map(topping => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:1rem; background:white; border-radius:8px; border:1px solid #e0e0e0;">
                <div>
                    <strong style="font-size:1rem;">${topping.name}</strong>
                    <div style="color:#666; font-size:0.85rem; margin-top:0.25rem;">
                        +Rp ${topping.price.toLocaleString('id-ID')}
                    </div>
                </div>
                <button class="btn-icon btn-delete" onclick="adminApp.deleteTopping(${topping.id})" style="padding:8px 12px;">
                    <i class="fas fa-trash"></i> Hapus
                </button>
            </div>
        `).join('');
    },

    addTopping: () => {
        const name = document.getElementById('new-topping-name').value.trim();
        const price = parseInt(document.getElementById('new-topping-price').value);

        if (!name || !price || price <= 0) {
            alert('Mohon isi nama dan harga topping dengan benar!');
            return;
        }

        // Ensure toppings array exists
        if (!adminApp.settings.toppings) {
            adminApp.settings.toppings = [];
        }

        // Generate new ID
        const newId = adminApp.settings.toppings.length > 0
            ? Math.max(...adminApp.settings.toppings.map(t => t.id)) + 1
            : 1;

        // Add new topping
        adminApp.settings.toppings.push({
            id: newId,
            name: name,
            price: price
        });

        // Save and refresh
        adminApp.saveData();
        adminApp.renderToppings();

        // Clear form
        document.getElementById('new-topping-name').value = '';
        document.getElementById('new-topping-price').value = '';

        adminApp.showToast('✓ Topping berhasil ditambahkan!');
    },

    deleteTopping: (id) => {
        if (confirm('Yakin ingin menghapus topping ini?')) {
            adminApp.settings.toppings = adminApp.settings.toppings.filter(t => t.id !== id);
            adminApp.saveData();
            adminApp.renderToppings();
            adminApp.showToast('✓ Topping berhasil dihapus!');
        }
    },

    // ========== REPORTS MANAGEMENT ==========
    setDefaultReportDate: () => {
        const today = new Date();
        const dateString = today.toISOString().split('T')[0]; // Format: YYYY-MM-DD

        document.getElementById('report-date-from').value = dateString;
        document.getElementById('report-date-to').value = dateString;
    },

    generateReport: () => {
        const dateFrom = document.getElementById('report-date-from').value;
        const dateTo = document.getElementById('report-date-to').value;

        // Auto-set to today if empty
        if (!dateFrom || !dateTo) {
            adminApp.setDefaultReportDate();
            return adminApp.generateReport(); // Retry with default date
        }

        // Filter orders by date range
        const fromDate = new Date(dateFrom);
        fromDate.setHours(0, 0, 0, 0); // Start of day

        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day

        console.log('Filter range:', fromDate, 'to', toDate);
        console.log('Total orders:', adminApp.orders.length);

        const filteredOrders = adminApp.orders.filter(order => {
            // Parse order date (handle both formats)
            let orderDate;
            try {
                // Try parsing as is
                orderDate = new Date(order.date);

                // If invalid, try extracting date from Indonesian format
                if (isNaN(orderDate.getTime())) {
                    // Format: "12/12/2024 12:00:00" or similar
                    const parts = order.date.split(/[\/\s,:]+/);
                    if (parts.length >= 3) {
                        // Assume DD/MM/YYYY or MM/DD/YYYY
                        orderDate = new Date(parts[2], parts[1] - 1, parts[0]);
                    }
                }
            } catch (e) {
                console.error('Error parsing date:', order.date, e);
                return false;
            }

            const match = orderDate >= fromDate && orderDate <= toDate;
            if (match) {
                console.log('Order matched:', order.id, order.date);
            }
            return match;
        });

        console.log('Filtered orders:', filteredOrders.length);

        // Calculate statistics
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const totalOrders = filteredOrders.length;
        const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Calculate total items sold
        let totalItems = 0;
        const productSales = {}; // Track sales per product

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                totalItems += item.qty;

                // Count product sales
                if (productSales[item.name]) {
                    productSales[item.name].qty += item.qty;
                    productSales[item.name].revenue += item.total;
                } else {
                    productSales[item.name] = {
                        qty: item.qty,
                        revenue: item.total
                    };
                }
            });
        });

        // Update summary cards
        console.log('Updating summary cards...');
        console.log('Revenue:', totalRevenue, 'Orders:', totalOrders, 'Avg:', avgOrder, 'Items:', totalItems);

        const revenueEl = document.getElementById('report-total-revenue');
        const ordersEl = document.getElementById('report-total-orders');
        const avgEl = document.getElementById('report-avg-order');
        const itemsEl = document.getElementById('report-total-items');

        if (!revenueEl || !ordersEl || !avgEl || !itemsEl) {
            console.error('❌ Summary card elements not found!');
            return;
        }

        revenueEl.innerText = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
        ordersEl.innerText = totalOrders;
        avgEl.innerText = `Rp ${Math.round(avgOrder).toLocaleString('id-ID')}`;
        itemsEl.innerText = `${totalItems} pcs`;

        console.log('✓ Summary cards updated');

        // Render top products
        console.log('Rendering top products...');
        adminApp.renderTopProducts(productSales);

        // Render detailed report table
        console.log('Rendering report table...');
        adminApp.renderReportTable(filteredOrders);

        adminApp.showToast('✓ Laporan berhasil di-generate!');
    },

    renderTopProducts: (productSales) => {
        const container = document.getElementById('top-products-list');

        // Convert to array and sort by quantity
        const sortedProducts = Object.entries(productSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.qty - a.qty)
            .slice(0, 5); // Top 5

        if (sortedProducts.length === 0) {
            container.innerHTML = '<p class="empty-state">Tidak ada data untuk periode ini</p>';
            return;
        }

        container.innerHTML = sortedProducts.map((product, index) => `
            <div style="display:flex; align-items:center; gap:1rem; padding:1rem; border-bottom:1px solid #f0f0f0;">
                <div style="font-size:1.5rem; font-weight:800; color:#f59e0b; min-width:30px;">
                    #${index + 1}
                </div>
                <div style="flex:1;">
                    <div style="font-weight:600; margin-bottom:0.25rem;">${product.name}</div>
                    <div style="font-size:0.85rem; color:#666;">
                        ${product.qty} pcs terjual
                    </div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:#10b981;">
                        Rp ${product.revenue.toLocaleString('id-ID')}
                    </div>
                    <div style="font-size:0.8rem; color:#666;">
                        pendapatan
                    </div>
                </div>
            </div>
        `).join('');
    },

    renderReportTable: (orders) => {
        const tbody = document.getElementById('report-tbody');

        if (orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-state">Tidak ada transaksi untuk periode ini</td></tr>';
            return;
        }

        tbody.innerHTML = orders.map(order => `
            <tr>
                <td>${order.date}</td>
                <td><strong>#${order.id}</strong></td>
                <td>${order.customerName}</td>
                <td>${order.items.length} item(s)</td>
                <td><strong>Rp ${order.total.toLocaleString('id-ID')}</strong></td>
                <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            </tr>
        `).join('');
    },

    exportReport: () => {
        const dateFrom = document.getElementById('report-date-from').value;
        const dateTo = document.getElementById('report-date-to').value;

        if (!dateFrom || !dateTo) {
            alert('Generate laporan terlebih dahulu!');
            return;
        }

        // Get report data
        const totalRevenue = document.getElementById('report-total-revenue').innerText;
        const totalOrders = document.getElementById('report-total-orders').innerText;
        const avgOrder = document.getElementById('report-avg-order').innerText;
        const totalItems = document.getElementById('report-total-items').innerText;

        // Create printable HTML
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Laporan Pendapatan - ${dateFrom} s/d ${dateTo}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #D32F2F; border-bottom: 3px solid #D32F2F; padding-bottom: 10px; }
                    .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
                    .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; }
                    .summary-item strong { display: block; font-size: 1.5rem; color: #D32F2F; margin-top: 5px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background: #D32F2F; color: white; }
                    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 0.9rem; }
                </style>
            </head>
            <body>
                <h1>📊 LAPORAN PENDAPATAN</h1>
                <p><strong>Periode:</strong> ${dateFrom} s/d ${dateTo}</p>
                <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleString('id-ID')}</p>
                
                <div class="summary">
                    <div class="summary-item">
                        <div>Total Pendapatan</div>
                        <strong>${totalRevenue}</strong>
                    </div>
                    <div class="summary-item">
                        <div>Total Pesanan</div>
                        <strong>${totalOrders}</strong>
                    </div>
                    <div class="summary-item">
                        <div>Rata-rata per Pesanan</div>
                        <strong>${avgOrder}</strong>
                    </div>
                    <div class="summary-item">
                        <div>Total Item Terjual</div>
                        <strong>${totalItems}</strong>
                    </div>
                </div>
                
                <h2>Detail Transaksi</h2>
                <table>
                    ${document.getElementById('report-tbody').innerHTML}
                </table>
                
                <div class="footer">
                    <p>Dimsum Menul by Bunda Nathan</p>
                    <p>Laporan ini digenerate otomatis dari sistem</p>
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.focus();

        // Auto print
        setTimeout(() => {
            printWindow.print();
        }, 500);

        adminApp.showToast('✓ Laporan siap untuk di-print/save as PDF!');
    },

    // ========== IMAGE UPLOAD ==========
    handleImageUpload: (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('File harus berupa gambar!');
            return;
        }

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Ukuran gambar maksimal 2MB!');
            return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;

            // Show preview
            document.getElementById('image-preview').src = base64;
            document.getElementById('image-preview-container').style.display = 'block';
            document.getElementById('upload-section').style.display = 'none';

            // Store base64 in hidden input
            document.getElementById('product-img-data').value = base64;

            // Clear URL input
            document.getElementById('product-img').value = '';
        };
        reader.readAsDataURL(file);
    },

    removeImage: () => {
        document.getElementById('image-preview').src = '';
        document.getElementById('image-preview-container').style.display = 'none';
        document.getElementById('upload-section').style.display = 'block';
        document.getElementById('product-img-data').value = '';
        document.getElementById('product-img-file').value = '';
    },

    // ========== UTILITIES ==========
    showToast: (message) => {
        const existing = document.querySelector('.admin-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'admin-toast';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideInRight 0.3s ease-out;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
};

// Add CSS for toast animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', adminApp.init);
