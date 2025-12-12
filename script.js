// ========== DATA PRODUK ==========
const DATA = [
    {
        id: 1,
        name: "Paket Mix (Isi 4)",
        price: 15000,
        img: "images/paket-mix.png",
        desc: "Best Seller! Kombinasi sempurna Ayam, Udang & Jamur dalam satu porsi. Cocok untuk keluarga."
    },
    {
        id: 2,
        name: "Siomay Ayam Premium (Isi 4)",
        price: 14000,
        img: "images/siomay-ayam.png",
        desc: "Full daging ayam cincang pilihan, tekstur padat & juicy. Favorit anak-anak!"
    },
    {
        id: 3,
        name: "Hakao Udang (Isi 4)",
        price: 16000,
        img: "images/hakao-udang.png",
        desc: "Kulit transparan berisi udang segar. Klasik dan lezat!"
    },
    {
        id: 4,
        name: "Ekado Telur Puyuh (Isi 3)",
        price: 18000,
        img: "images/ekado-telur.png",
        desc: "Kulit tahu renyah berisi daging cincang & telur puyuh utuh. Unik dan lezat!"
    }
];

// ========== APP LOGIC ==========
const app = {
    cart: [],
    activeItem: null,
    activeQty: 1,

    // Initialize app
    init: () => {
        // Load products from admin (if updated)
        app.loadProductsFromAdmin();

        // Load settings from admin (if updated)
        app.loadSettingsFromAdmin();

        // Load toppings from admin
        app.loadToppingsFromAdmin();

        app.renderProducts();
        app.addScrollEffects();

        // Preload images for better performance
        DATA.forEach(item => {
            const img = new Image();
            img.src = item.img;
        });
    },

    // Load products from localStorage (updated from admin)
    loadProductsFromAdmin: () => {
        const savedProducts = localStorage.getItem('dimsum_products');
        if (savedProducts) {
            try {
                const adminProducts = JSON.parse(savedProducts);
                if (adminProducts && adminProducts.length > 0) {
                    // Replace DATA with admin products
                    DATA.length = 0;
                    DATA.push(...adminProducts);
                    console.log('✓ Produk loaded dari Admin Panel');
                }
            } catch (e) {
                console.log('Menggunakan produk default');
            }
        }
    },

    // Load settings from localStorage (updated from admin)
    loadSettingsFromAdmin: () => {
        const savedSettings = localStorage.getItem('dimsum_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);

                // Update site name & tagline
                if (settings.storeName) {
                    const nameEl = document.getElementById('site-name');
                    if (nameEl) nameEl.innerText = settings.storeName;
                }

                if (settings.tagline) {
                    const taglineEl = document.getElementById('site-tagline');
                    if (taglineEl) taglineEl.innerText = settings.tagline;
                }

                // Update jam operasional
                if (settings.hoursWeekday && settings.hoursSunday) {
                    const hoursEl = document.getElementById('info-hours');
                    if (hoursEl) {
                        hoursEl.innerHTML = `Senin - Sabtu: ${settings.hoursWeekday}<br>Minggu: ${settings.hoursSunday}`;
                    }
                }

                // Update area pengiriman
                if (settings.deliveryArea) {
                    const areaEl = document.getElementById('info-area');
                    if (areaEl) {
                        areaEl.innerHTML = `${settings.deliveryArea}<br>Free ongkir min. pembelian 100rb`;
                    }
                }

                // Update WhatsApp number (format untuk display)
                if (settings.whatsapp) {
                    const waEl = document.getElementById('info-whatsapp');
                    if (waEl) {
                        // Format: 6281234567890 -> 0812-3456-7890
                        let displayWA = settings.whatsapp;
                        if (displayWA.startsWith('62')) {
                            displayWA = '0' + displayWA.substring(2);
                        }
                        // Add dashes for readability
                        if (displayWA.length >= 11) {
                            displayWA = displayWA.substring(0, 4) + '-' +
                                displayWA.substring(4, 8) + '-' +
                                displayWA.substring(8);
                        }
                        waEl.innerText = displayWA;
                    }

                    // Update floating WA button link
                    const waFloatBtn = document.getElementById('wa-float-btn');
                    if (waFloatBtn) {
                        const storeName = settings.storeName || 'Dimsum Menul';
                        waFloatBtn.href = `https://wa.me/${settings.whatsapp}?text=Halo%20${encodeURIComponent(storeName)},%20saya%20mau%20tanya-tanya%20dulu`;
                    }
                }

                console.log('✓ Settings loaded dari Admin Panel');
            } catch (e) {
                console.log('Menggunakan settings default');
            }
        }
    },

    // Load toppings from localStorage (updated from admin)
    loadToppingsFromAdmin: () => {
        const savedSettings = localStorage.getItem('dimsum_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                const toppings = settings.toppings || [
                    { id: 1, name: 'Chili Oil', price: 2000 },
                    { id: 2, name: 'Mayonnaise', price: 1000 }
                ];

                // Render toppings to modal
                const container = document.getElementById('toppings-container');
                if (container) {
                    if (toppings.length === 0) {
                        container.innerHTML = '<p style="color:#999; font-size:0.9rem; padding:1rem; text-align:center;">Tidak ada topping tersedia</p>';
                    } else {
                        container.innerHTML = toppings.map(topping => `
                            <label class="radio-pick">
                                <input type="checkbox" class="addon-cb" value="${topping.name}" data-price="${topping.price}">
                                <i class="fas fa-pepper-hot"></i>
                                <span style="flex:1;">${topping.name}</span>
                                <span style="color:var(--primary); font-weight:600;">+Rp ${topping.price.toLocaleString('id-ID')}</span>
                            </label>
                        `).join('');
                    }
                }

                console.log('✓ Toppings loaded dari Admin Panel');
            } catch (e) {
                console.log('Menggunakan topping default');
            }
        } else {
            // Default toppings if no settings
            const container = document.getElementById('toppings-container');
            if (container) {
                container.innerHTML = `
                    <label class="radio-pick">
                        <input type="checkbox" class="addon-cb" value="Chili Oil" data-price="2000">
                        <i class="fas fa-pepper-hot"></i>
                        <span style="flex:1;">Chili Oil</span>
                        <span style="color:var(--primary); font-weight:600;">+Rp 2.000</span>
                    </label>
                    <label class="radio-pick">
                        <input type="checkbox" class="addon-cb" value="Mayonnaise" data-price="1000">
                        <i class="fas fa-cheese"></i>
                        <span style="flex:1;">Mayonnaise</span>
                        <span style="color:var(--primary); font-weight:600;">+Rp 1.000</span>
                    </label>
                `;
            }
        }
    },

    // Load products from localStorage (updated from admin)
    loadProductsFromAdmin: () => {
        const savedProducts = localStorage.getItem('dimsum_products');
        if (savedProducts) {
            try {
                const adminProducts = JSON.parse(savedProducts);
                if (adminProducts && adminProducts.length > 0) {
                    // Replace DATA with admin products
                    DATA.length = 0;
                    DATA.push(...adminProducts);
                    console.log('✓ Produk loaded dari Admin Panel');
                }
            } catch (e) {
                console.log('Menggunakan produk default');
            }
        }
    },

    // Render product list
    renderProducts: () => {
        const list = document.getElementById('product-list');
        list.innerHTML = DATA.map(item => `
            <div class="menu-card">
                <div class="card-image-box">
                    <img src="${item.img}" alt="${item.name}" loading="lazy">
                </div>
                <div class="card-details">
                    <div class="card-title-row">
                        <div class="card-title">${item.name}</div>
                        <div class="card-price">Rp ${(item.price / 1000).toFixed(0)}k</div>
                    </div>
                    <div class="card-desc">${item.desc}</div>
                    <div class="card-action">
                        <div class="rating">
                            <i class="fas fa-star" style="color:#FFC107"></i> 
                            <span>5.0 (${Math.floor(Math.random() * 50) + 20}+ review)</span>
                        </div>
                        <button class="btn-add" onclick="app.openItem(${item.id})">
                            <i class="fas fa-cart-plus"></i> Pesan
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    },

    // Open product modal
    openItem: (id) => {
        app.activeItem = DATA.find(i => i.id === id);
        app.activeQty = 1;

        // Reset UI
        document.getElementById('p-name').innerText = app.activeItem.name;
        document.getElementById('p-qty').innerText = 1;
        document.querySelector('input[name="p-cond"][value="Hot"]').checked = true;

        // Reload toppings from admin (in case they changed)
        app.loadToppingsFromAdmin();

        // Reset topping checkboxes
        document.querySelectorAll('.addon-cb').forEach(cb => cb.checked = false);

        // Add change listeners for real-time price update
        document.querySelectorAll('.addon-cb').forEach(cb => {
            cb.onchange = () => app.calcPrice();
        });

        app.calcPrice();
        document.getElementById('modal-product').classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
    },

    // Adjust quantity
    qty: (diff) => {
        if (app.activeQty + diff > 0 && app.activeQty + diff <= 99) {
            app.activeQty += diff;
            document.getElementById('p-qty').innerText = app.activeQty;
            app.calcPrice();
        }
    },

    // Calculate price with addons
    calcPrice: () => {
        let base = app.activeItem.price;
        let addons = 0;
        document.querySelectorAll('.addon-cb:checked').forEach(cb => {
            addons += parseInt(cb.dataset.price);
        });
        let total = (base + addons) * app.activeQty;
        document.getElementById('p-btn-price').innerText = "Rp " + total.toLocaleString('id-ID');
        return total;
    },

    // Add to cart
    addToCart: () => {
        const cond = document.querySelector('input[name="p-cond"]:checked').value;
        const toppings = Array.from(document.querySelectorAll('.addon-cb:checked'))
            .map(cb => cb.value);
        const total = app.calcPrice();

        app.cart.push({
            name: app.activeItem.name,
            qty: app.activeQty,
            cond: cond,
            toppings: toppings,
            total: total
        });

        app.updateCart();
        app.closeModal('modal-product');

        // Show success feedback
        app.showToast('✓ Ditambahkan ke keranjang!');
    },

    // Update cart UI
    updateCart: () => {
        const count = app.cart.reduce((a, b) => a + b.qty, 0);
        const total = app.cart.reduce((a, b) => a + b.total, 0);

        document.getElementById('cart-count-txt').innerText = count + " Item";
        document.getElementById('cart-total-txt').innerText = "Rp " + total.toLocaleString('id-ID');

        const floater = document.getElementById('cart-floater');
        if (count > 0) {
            floater.classList.add('visible');
        } else {
            floater.classList.remove('visible');
        }
    },

    // Open checkout modal
    openCheckout: () => {
        if (app.cart.length === 0) {
            app.showToast('⚠ Keranjang masih kosong!');
            return;
        }

        const list = document.getElementById('checkout-list');
        list.innerHTML = app.cart.map((i, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:12px; padding-bottom:12px; border-bottom:1px solid #eee;">
                <div style="flex:1;">
                    <strong style="font-size:0.95rem;">${i.name}</strong>
                    <div style="font-size:0.8rem; color:#666; margin-top:4px;">
                        <span style="background:#f0f0f0; padding:2px 8px; border-radius:4px; margin-right:6px;">
                            ${i.cond === 'Hot' ? '🔥 Panas' : '❄️ Frozen'}
                        </span>
                        ${i.toppings.length ? '<br>+ ' + i.toppings.join(', ') : ''}
                    </div>
                    <div style="font-size:0.85rem; color:#999; margin-top:4px;">Qty: ${i.qty}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-weight:700; color:var(--primary);">Rp ${i.total.toLocaleString('id-ID')}</div>
                    <button onclick="app.removeItem(${idx})" style="background:none; border:none; color:#999; cursor:pointer; font-size:0.8rem; margin-top:4px;">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            </div>
        `).join('');

        const total = app.cart.reduce((a, b) => a + b.total, 0);
        document.getElementById('co-subtotal').innerText = "Rp " + total.toLocaleString('id-ID');
        document.getElementById('co-total').innerText = "Rp " + total.toLocaleString('id-ID');

        document.getElementById('modal-checkout').classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    // Remove item from cart
    removeItem: (idx) => {
        app.cart.splice(idx, 1);
        app.updateCart();
        if (app.cart.length === 0) {
            app.closeModal('modal-checkout');
        } else {
            app.openCheckout(); // Refresh the checkout view
        }
    },

    // Send order via WhatsApp
    sendWA: () => {
        const name = document.getElementById('co-name').value.trim();
        const wa = document.getElementById('co-wa').value.trim();
        const addr = document.getElementById('co-addr').value.trim();
        const timeType = document.getElementById('co-time').value;

        // Validation
        if (!name || !wa || !addr) {
            app.showToast('⚠ Mohon lengkapi semua data!');
            return;
        }

        if (wa.length < 10) {
            app.showToast('⚠ Nomor WhatsApp tidak valid!');
            return;
        }

        let timeStr = "INSTANT (Kirim Sekarang)";
        if (timeType === 'PreOrder') {
            timeStr = "PRE-ORDER (3-4 hari)";
        }

        // Save order to localStorage for admin panel FIRST
        const orderId = app.saveOrderToAdmin(name, wa, addr, timeStr);

        // Build SHORT WhatsApp notification (not full order details)
        const totalAmount = app.cart.reduce((a, b) => a + b.total, 0);
        const itemCount = app.cart.reduce((a, b) => a + b.qty, 0);

        let msg = `*🔔 PESANAN BARU MASUK!*%0a%0a`;
        msg += `📋 *Order ID:* #${orderId}%0a`;
        msg += `👤 *Nama:* ${name}%0a`;
        msg += `📱 *WA:* ${wa}%0a`;
        msg += `📦 *Total Item:* ${itemCount} pcs%0a`;
        msg += `💰 *Total:* Rp ${totalAmount.toLocaleString('id-ID')}%0a`;
        msg += `⏰ *Waktu:* ${timeStr}%0a%0a`;
        msg += `_Cek detail lengkap di Admin Panel!_`;

        // Get WhatsApp number from admin settings (or use default)
        let waNumber = '6281234567890'; // Default
        const savedSettings = localStorage.getItem('dimsum_settings');
        if (savedSettings) {
            try {
                const settings = JSON.parse(savedSettings);
                if (settings.whatsapp) {
                    waNumber = settings.whatsapp;
                }
            } catch (e) {
                console.log('Using default WA number');
            }
        }

        // Open WhatsApp with SHORT notification
        window.open(`https://wa.me/${waNumber}?text=${msg}`, '_blank');

        // Clear cart after order
        setTimeout(() => {
            app.cart = [];
            app.updateCart();
            app.closeModal('modal-checkout');
            app.showToast(`✓ Pesanan #${orderId} berhasil! Cek Admin Panel untuk detail.`);
        }, 1000);
    },

    // Save order to localStorage for admin
    saveOrderToAdmin: (name, phone, address, deliveryTime) => {
        const orders = JSON.parse(localStorage.getItem('dimsum_orders') || '[]');
        const totalAmount = app.cart.reduce((a, b) => a + b.total, 0);

        const newOrder = {
            id: orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1,
            date: new Date().toLocaleString('id-ID'),
            customerName: name,
            customerPhone: phone,
            customerAddress: address,
            deliveryTime: deliveryTime,
            items: app.cart.map(item => ({
                name: item.name,
                qty: item.qty,
                condition: item.cond,
                toppings: item.toppings,
                total: item.total
            })),
            total: totalAmount,
            status: 'pending'
        };

        orders.push(newOrder);
        localStorage.setItem('dimsum_orders', JSON.stringify(orders));

        return newOrder.id; // Return order ID
    },

    // Close modal
    closeModal: (id) => {
        document.getElementById(id).classList.remove('active');
        document.body.style.overflow = 'auto';
    },

    // Show toast notification
    showToast: (message) => {
        // Remove existing toast
        const existing = document.querySelector('.toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(-100px);
            background: #323232;
            color: white;
            padding: 12px 24px;
            border-radius: 50px;
            font-size: 0.9rem;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => toast.style.transform = 'translateX(-50%) translateY(0)', 100);
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Add scroll effects
    addScrollEffects: () => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.section').forEach(section => {
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            section.style.transition = 'all 0.6s ease';
            observer.observe(section);
        });
    }
};

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', () => {
    app.init();

    // Close modal when clicking overlay
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                app.closeModal(overlay.id);
            }
        });
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
