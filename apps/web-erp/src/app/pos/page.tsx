"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { Search, ShoppingCart, Plus, Minus, Trash2, Printer, Banknote, QrCode, CheckCircle2, X, RefreshCw, Smartphone, Users, Star, Tag, Upload, ShieldCheck, Image as ImageIcon, Building } from "lucide-react";
import { fetchFromBackend, API_BASE_URLS } from "@/lib/api";

interface CartItem {
  id: string;
  sku: string;
  name: string;
  price: number;
  qty: number;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  points: number;
  discount_rate: number;
}

export default function POSTerminalPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [cart, setCart] = useState<CartItem[]>([]);

  // Member / Customer Integration
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>({
    id: "guest",
    name: "Pelanggan Umum (Guest)",
    phone: "-",
    tier: "Bronze",
    points: 0,
    discount_rate: 0,
  });
  const [usePoints, setUsePoints] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherDiscount, setVoucherDiscount] = useState(0);

  const [selectedOutlet, setSelectedOutlet] = useState<string>("Outlet Jakpus #01 (Sudirman)");

  // Payment & Checkout State (EDC removed: only Cash, QRIS, Transfer)
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "QRIS" | "Transfer">("Cash");
  const [cashAmount, setCashAmount] = useState<string>("");
  const [proofImagePreview, setProofImagePreview] = useState<string>("");
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  // Store Settings (Retrieved from LocalStorage or Default)
  const [storeQrisImage, setStoreQrisImage] = useState<string>("/qris_dummy.png");
  const [bankName, setBankName] = useState("Bank BCA");
  const [bankAccountNo, setBankAccountNo] = useState("8830-1928-441");
  const [bankAccountHolder, setBankAccountHolder] = useState("PT ERP POS ENTERPRISE");

  const [submitting, setSubmitting] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [notification, setNotification] = useState("");

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadStorePaymentSettings();
  }, []);

  function loadStorePaymentSettings() {
    const savedQris = localStorage.getItem("qris_image");
    const savedBankName = localStorage.getItem("bank_name");
    const savedBankNo = localStorage.getItem("bank_account_no");
    const savedBankHolder = localStorage.getItem("bank_account_holder");

    if (savedQris) setStoreQrisImage(savedQris);
    if (savedBankName) setBankName(savedBankName);
    if (savedBankNo) setBankAccountNo(savedBankNo);
    if (savedBankHolder) setBankAccountHolder(savedBankHolder);
  }

  async function loadProducts() {
    setLoading(true);
    const data = await fetchFromBackend<any[]>(`${API_BASE_URLS.inventory}/products`);
    if (data && data.length > 0) {
      setProducts(data);
    } else {
      setProducts([
        { id: "1", sku: "SKU-MILK-01", name: "Susu UHT Full Cream 1L", category: "Minuman", price: 19500, stock: 45 },
        { id: "2", sku: "SKU-BREAD-02", name: "Roti Tawar Premium 500g", category: "Makanan", price: 15000, stock: 12 },
        { id: "3", sku: "SKU-COFFEE-03", name: "Kopi Gula Aren 250ml", category: "Minuman", price: 12000, stock: 80 },
        { id: "4", sku: "SKU-WATER-04", name: "Air Mineral 600ml", category: "Minuman", price: 4000, stock: 150 },
        { id: "5", sku: "SKU-SNACK-05", name: "Snack Keripik Kentang", category: "Snack", price: 13500, stock: 35 },
        { id: "6", sku: "SKU-SHOE-NK-42", name: "Sepatu Olahraga Nike Air Max", category: "Sepatu & Fashion", price: 750000, stock: 20 },
      ]);
    }
    setLoading(false);
  }

  function loadCustomers() {
    const list: Customer[] = [
      { id: "guest", name: "Pelanggan Umum (Guest)", phone: "-", tier: "Bronze", points: 0, discount_rate: 0 },
      { id: "c1", name: "Budi Santoso", phone: "081298765432", tier: "Gold", points: 1250, discount_rate: 0.10 },
      { id: "c2", name: "Siti Rahmawati", phone: "085712345678", tier: "Platinum", points: 3420, discount_rate: 0.15 },
      { id: "c3", name: "Andi Wijaya", phone: "081311223344", tier: "Silver", points: 620, discount_rate: 0.05 },
      { id: "c4", name: "Dewi Lestari", phone: "082199887766", tier: "Bronze", points: 150, discount_rate: 0.00 },
    ];
    setCustomers(list);
  }

  const addToCart = (p: any) => {
    const itemPrice = p.selling_price || p.sell_price || p.price || 10000;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) {
        return prev.map((item) => (item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: p.id, sku: p.sku || "SKU-000", name: p.name, price: itemPrice, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  function handleProofUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function applyVoucher() {
    const code = voucherCode.trim().toUpperCase();
    if (code === "PROMO10") {
      const disc = Math.round(subtotal * 0.10);
      setVoucherDiscount(disc);
      setNotification(`Voucher ${code} Berhasil Dipasang! Diskon 10% (Rp ${disc.toLocaleString("id-ID")})`);
    } else if (code === "CASH50K") {
      setVoucherDiscount(50000);
      setNotification(`Voucher ${code} Berhasil Dipasang! Diskon Potongan Rp 50.000`);
    } else if (code === "") {
      setVoucherDiscount(0);
    } else {
      alert("Kode Voucher tidak valid! Gunakan kode: PROMO10 atau CASH50K");
    }
    setTimeout(() => setNotification(""), 4000);
  }

  // Subtotal & Discounts Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const tierDiscount = Math.round(subtotal * selectedCustomer.discount_rate);
  const pointsRedeemedValue = usePoints ? Math.min(selectedCustomer.points * 100, subtotal - tierDiscount) : 0;
  const totalDiscount = tierDiscount + voucherDiscount + pointsRedeemedValue;
  const taxableAmount = Math.max(subtotal - totalDiscount, 0);
  const tax = Math.round(taxableAmount * 0.11);
  const grandTotal = taxableAmount + tax;
  const earnedPoints = Math.floor(grandTotal / 10000);

  const numCash = parseFloat(cashAmount) || grandTotal;
  const changeMoney = Math.max(numCash - grandTotal, 0);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category || "Umum")))];

  function handleInitiateCheckout() {
    if (cart.length === 0) {
      alert("Keranjang belanja masih kosong! Silakan pilih produk.");
      return;
    }

    if (paymentMethod === "QRIS" || paymentMethod === "Transfer") {
      // Require upload proof modal
      setProofImagePreview("");
      setIsProofModalOpen(true);
    } else {
      // Cash payment direct checkout
      processFinalOrder();
    }
  }

  async function processFinalOrder() {
    setSubmitting(true);
    const orderNumber = `POS-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      await fetch(`${API_BASE_URLS.pos}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: orderNumber,
          customer_name: selectedCustomer.name,
          customer_tier: selectedCustomer.tier,
          channel: "pos_terminal",
          payment_method: paymentMethod,
          subtotal,
          tier_discount: tierDiscount,
          voucher_discount: voucherDiscount,
          points_discount: pointsRedeemedValue,
          tax_amount: tax,
          grand_total: grandTotal,
          earned_points: earnedPoints,
          proof_image_url: proofImagePreview,
          items: cart.map((item) => ({
            product_id: item.id,
            qty: item.qty,
            price: item.price,
          })),
        }),
      });
    } catch (e) {
      console.error(e);
    }

    const receiptData = {
      orderNumber,
      date: new Date().toLocaleString("id-ID"),
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      tierDiscount,
      voucherDiscount,
      pointsDiscount: pointsRedeemedValue,
      totalDiscount,
      tax,
      grandTotal,
      earnedPoints,
      paymentMethod,
      cashPaid: numCash,
      change: changeMoney,
      proofImage: proofImagePreview,
    };

    setLastReceipt(receiptData);
    setIsProofModalOpen(false);
    setIsReceiptOpen(true);
    setCart([]);
    setCashAmount("");
    setUsePoints(false);
    setVoucherDiscount(0);
    setVoucherCode("");
    setNotification(`Transaksi ${orderNumber} Berhasil! (${paymentMethod}) +${earnedPoints} Pts`);
    setTimeout(() => setNotification(""), 4000);
    setSubmitting(false);
  }

  return (
    <div className="h-[calc(100vh-6rem)] -m-6 flex bg-slate-950 overflow-hidden relative">
      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-4 left-6 z-30 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-semibold animate-fade-in shadow-2xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {notification}
        </div>
      )}

      {/* Left Column: Product Grid */}
      <div className="flex-1 p-6 flex flex-col space-y-4 overflow-y-auto border-r border-slate-800">
        {/* Category & Search Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Scan Barcode / SKU / Nama Produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button onClick={loadProducts} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white mr-1">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs font-mono">Memuat Katalog Produk dari inventory-service...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">Produk tidak ditemukan</div>
          ) : (
            filteredProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-blue-500/80 text-left transition-all space-y-3 group hover:shadow-xl hover:shadow-blue-500/5 relative"
              >
                <div className="w-full h-24 rounded-xl bg-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <span className="text-[11px] font-mono text-slate-500">[ {p.category || "Produk"} ]</span>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-mono">{p.sku}</p>
                  <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 line-clamp-1">{p.name}</h4>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                  <span className="text-xs font-bold text-emerald-400 font-mono">Rp {(p.selling_price || p.sell_price || p.price || 10000).toLocaleString("id-ID")}</span>
                  <span className="text-[10px] text-slate-400 font-mono">Stok: {p.stock || p.quantity || 30}</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Customer & Checkout */}
      <div className="w-96 p-5 bg-slate-900/90 flex flex-col justify-between border-l border-slate-800 shadow-2xl overflow-y-auto">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-blue-400" /> Keranjang Belanja
              </h2>
              <div className="flex items-center gap-1.5 pt-0.5">
                <Building className="w-3 h-3 text-blue-400" />
                <select
                  value={selectedOutlet}
                  onChange={(e) => {
                    setSelectedOutlet(e.target.value);
                    localStorage.setItem("active_outlet", e.target.value);
                  }}
                  className="bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300 font-bold rounded-lg px-2 py-0.5 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Outlet Jakpus #01 (Sudirman)">Outlet Jakpus #01 (Sudirman)</option>
                  <option value="Outlet Jakbar #02 (Central Park)">Outlet Jakbar #02 (Central Park)</option>
                  <option value="Outlet Surabaya #03 (Tunjungan)">Outlet Surabaya #03 (Tunjungan)</option>
                  <option value="Gudang Utama Jakpus">Gudang Utama Jakpus</option>
                </select>
              </div>
            </div>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> Bersihkan
              </button>
            )}
          </div>

          {/* Customer Selection Box */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-400" /> Pilih Member / Pelanggan
              </label>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${selectedCustomer.tier === "Platinum" ? "bg-purple-500/20 text-purple-300 border-purple-500/40" : selectedCustomer.tier === "Gold" ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : selectedCustomer.tier === "Silver" ? "bg-slate-500/20 text-slate-300 border-slate-500/40" : "bg-slate-800 text-slate-400 border-slate-700"}`}>
                Tier {selectedCustomer.tier} ({selectedCustomer.discount_rate * 100}% Disc)
              </span>
            </div>

            <select
              value={selectedCustomer.id}
              onChange={(e) => {
                const found = customers.find((c) => c.id === e.target.value) || customers[0];
                setSelectedCustomer(found);
                setUsePoints(false);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100 font-medium focus:border-blue-500 focus:outline-none"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.phone !== "-" ? `(${c.phone})` : ""} - {c.tier} Tier
                </option>
              ))}
            </select>

            {selectedCustomer.id !== "guest" && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-slate-300 font-mono text-[11px]">{selectedCustomer.points} Pts</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-emerald-400 hover:text-emerald-300">
                  <input
                    type="checkbox"
                    checked={usePoints}
                    onChange={(e) => setUsePoints(e.target.checked)}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  Tukar Poin (-Rp {(selectedCustomer.points * 100).toLocaleString("id-ID")})
                </label>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="space-y-2 max-h-[22vh] overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <ShoppingCart className="w-6 h-6 mx-auto mb-1 opacity-30" />
                Keranjang masih kosong.
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-slate-200 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-emerald-400 font-mono">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-100 w-4 text-center font-mono">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">
                      <Plus className="w-3 h-3" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1 text-slate-500 hover:text-rose-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Voucher & Calculation Section */}
        <div className="space-y-3 border-t border-slate-800 pt-3 text-xs">
          {/* Voucher Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Kode Voucher (PROMO10 / CASH50K)"
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-2 py-1.5 text-[11px] text-slate-200 font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button onClick={applyVoucher} className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px]">
              Pasang
            </button>
          </div>

          {/* Calculation Details */}
          <div className="space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((a, c) => a + c.qty, 0)} item)</span>
              <span className="text-slate-200 font-mono">Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>

            {tierDiscount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold">
                <span>Diskon Tier {selectedCustomer.tier} ({selectedCustomer.discount_rate * 100}%)</span>
                <span className="font-mono">-Rp {tierDiscount.toLocaleString("id-ID")}</span>
              </div>
            )}

            {voucherDiscount > 0 && (
              <div className="flex justify-between text-blue-400 font-semibold">
                <span>Diskon Voucher Promo</span>
                <span className="font-mono">-Rp {voucherDiscount.toLocaleString("id-ID")}</span>
              </div>
            )}

            {pointsRedeemedValue > 0 && (
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Diskon Tukar Poin Loyalty</span>
                <span className="font-mono">-Rp {pointsRedeemedValue.toLocaleString("id-ID")}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Pajak PPN (11%)</span>
              <span className="text-slate-200 font-mono">Rp {tax.toLocaleString("id-ID")}</span>
            </div>

            <div className="flex justify-between text-sm font-bold text-slate-100 pt-1.5 border-t border-slate-800">
              <span>TOTAL BAYAR</span>
              <span className="text-emerald-400 text-base font-mono">Rp {grandTotal.toLocaleString("id-ID")}</span>
            </div>
          </div>

          {/* Payment Method Selector (EDC Removed: Cash, QRIS, Transfer) */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Cash", label: "Cash Tunai", icon: Banknote },
              { id: "QRIS", label: "QRIS Code", icon: QrCode },
              { id: "Transfer", label: "Bank Transfer", icon: Smartphone },
            ].map((m) => {
              const Icon = m.icon;
              const isSel = paymentMethod === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={`p-2 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    isSel
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {m.label}
                </button>
              );
            })}
          </div>

          {/* Cash Input */}
          {paymentMethod === "Cash" && (
            <div className="space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder={grandTotal.toString()}
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono font-bold text-slate-100 focus:border-blue-500 focus:outline-none"
                />
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs font-mono text-emerald-400 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Kembali:</span>
                  <span className="font-bold">Rp {changeMoney.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <button
            onClick={handleInitiateCheckout}
            disabled={submitting || cart.length === 0}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" /> {submitting ? "PROSES TRANSAKSI..." : `BAYAR VIA ${paymentMethod.toUpperCase()} & STRUK`}
          </button>
        </div>
      </div>

      {/* Modal Upload Bukti Bayar (Wajib untuk QRIS & Transfer Bank) */}
      {isProofModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  {paymentMethod === "QRIS" ? <QrCode className="w-5 h-5 text-emerald-400" /> : <Building className="w-5 h-5 text-blue-400" />}
                  Konfirmasi Bayar {paymentMethod === "QRIS" ? "QRIS Code" : "Transfer Bank"}
                </h3>
                <p className="text-xs text-slate-400">Total Pembayaran: <span className="text-emerald-400 font-mono font-bold">Rp {grandTotal.toLocaleString("id-ID")}</span></p>
              </div>
              <button onClick={() => setIsProofModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Payment Target Information */}
            {paymentMethod === "QRIS" ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
                <p className="text-[11px] text-slate-400 font-semibold">Scan QRIS Toko di Bawah Ini:</p>
                <div className="w-44 h-44 mx-auto rounded-xl bg-white p-2 border border-slate-700 overflow-hidden flex items-center justify-center">
                  <img src={storeQrisImage} alt="Barcode QRIS Toko" className="w-full h-full object-contain" />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <p className="text-[11px] text-slate-400 font-semibold">Transfer ke Rekening Bank Berikut:</p>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono space-y-1">
                  <p className="text-slate-300">Bank: <span className="font-bold text-white">{bankName}</span></p>
                  <p className="text-slate-300">No. Rekening: <span className="font-bold text-blue-400 text-sm">{bankAccountNo}</span></p>
                  <p className="text-slate-300">Atas Nama: <span className="font-bold text-emerald-400">{bankAccountHolder}</span></p>
                </div>
              </div>
            )}

            {/* Step 2: Upload Proof Image Requirement */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Upload Bukti Bayar / Struk Transfer *
              </label>

              {proofImagePreview ? (
                <div className="relative w-full h-36 rounded-xl bg-slate-950 border border-emerald-500/50 overflow-hidden group">
                  <img src={proofImagePreview} alt="Bukti Pembayaran" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setProofImagePreview("")}
                    className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-emerald-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Bukti Ter-upload
                  </span>
                </div>
              ) : (
                <label className="w-full h-32 rounded-xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950 flex flex-col items-center justify-center cursor-pointer transition-all">
                  <Upload className="w-6 h-6 text-blue-400 mb-1" />
                  <span className="text-xs font-bold text-slate-200">Upload Foto Struk / Screenshot Bukti Bayar</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Format JPG / PNG / Mobile Banking</span>
                  <input type="file" accept="image/*" onChange={handleProofUpload} className="hidden" />
                </label>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsProofModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={!proofImagePreview || submitting}
                onClick={processFinalOrder}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> {submitting ? "Memproses..." : "Konfirmasi & Cetak Struk"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Thermal Receipt Modal */}
      {isReceiptOpen && lastReceipt && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl font-mono text-xs">
            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-1">
              <h2 className="text-base font-bold tracking-wider">ERP POS STORE</h2>
              <p className="text-[10px] text-slate-600">Jl. Jenderal Sudirman No. 12, Jakarta</p>
              <p className="text-[10px] text-slate-600">Pelanggan: {lastReceipt.customer?.name} ({lastReceipt.customer?.tier} Tier)</p>
              <p className="text-[10px] text-slate-600">Struk: {lastReceipt.orderNumber}</p>
              <p className="text-[10px] text-slate-500">{lastReceipt.date}</p>
            </div>

            <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
              {lastReceipt.items.map((it: CartItem, i: number) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{it.name}</p>
                    <p className="text-[10px] text-slate-500">{it.qty} x Rp {it.price.toLocaleString("id-ID")}</p>
                  </div>
                  <p className="font-bold">Rp {(it.qty * it.price).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1 border-b border-dashed border-slate-300 pb-3 text-right">
              <div className="flex justify-between"><span>Subtotal:</span><span>Rp {lastReceipt.subtotal.toLocaleString("id-ID")}</span></div>
              {lastReceipt.totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold"><span>Total Diskon & Promo:</span><span>-Rp {lastReceipt.totalDiscount.toLocaleString("id-ID")}</span></div>
              )}
              <div className="flex justify-between"><span>PPN (11%):</span><span>Rp {lastReceipt.tax.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between font-bold text-sm pt-1"><span>TOTAL BAYAR:</span><span>Rp {lastReceipt.grandTotal.toLocaleString("id-ID")}</span></div>
              <div className="flex justify-between text-slate-600 pt-1"><span>Metode Bayar:</span><span>{lastReceipt.paymentMethod}</span></div>
              {lastReceipt.proofImage && (
                <div className="flex justify-between text-emerald-700 font-bold text-[10px]"><span>Bukti Bayar:</span><span>VERIFIED ✓</span></div>
              )}
            </div>

            <div className="text-center pt-1 space-y-1">
              <p className="text-[10px] text-slate-500">*** TERIMA KASIH ATAS KUNJUNGAN ANDA ***</p>
              <p className="text-[9px] text-slate-400">Powered by ERP POS Enterprise v1.0</p>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" /> Cetak Struk
              </button>
              <button
                onClick={() => setIsReceiptOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 text-slate-800 font-bold hover:bg-slate-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
