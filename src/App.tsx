/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  ChevronRight, 
  Search, 
  Bell, 
  User,
  Plus,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  IndianRupee,
  Gem,
  CircleDot,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types (keeping Section/Tray/Product model) ─────────────────────────────

interface Product {
  id: string;
  title: string;
  sku: string;
  weightGrams: number;
  goldKarat: 24 | 22 | 18;
  image: string;
  description: string;
}

interface Tray {
  id: string;
  name: string;
  products: Product[];
}

interface Section {
  id: string;
  name: string;
  icon: string;
  trays: Tray[];
}

interface GoldRates {
  k24: number;
  k22: number;
  k18: number;
}

interface ProductFormData {
  title: string;
  sku: string;
  weightGrams: string;
  goldKarat: 24 | 22 | 18;
  image: string;
  description: string;
}

// ─── Price Calculation ───────────────────────────────────────────────────────

function computePrice(weightGrams: number, goldKarat: 24 | 22 | 18, rates: GoldRates): number {
  const ratePerGram = goldKarat === 24 ? rates.k24 : goldKarat === 22 ? rates.k22 : rates.k18;
  const goldPrice = weightGrams * ratePerGram;
  const withMaking = goldPrice * 1.12; // +12% making charge
  const withGST = withMaking * 1.03;   // +3% GST
  return Math.round(withGST);
}

function formatINR(amount: number): string {
  return '₹' + amount.toLocaleString('en-IN');
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const INITIAL_GOLD_RATES: GoldRates = {
  k24: 7200,
  k22: 6600,
  k18: 5400,
};

let nextId = 100;

const INITIAL_DATA: Section[] = [
  {
    id: 'rings',
    name: 'Rings',
    icon: '💍',
    trays: [
      {
        id: 'rings-tray-1',
        name: 'All Rings',
        products: [
          { id: 'r1', title: 'Classic Gold Band', sku: 'RNG-001', weightGrams: 5.2, goldKarat: 22, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop', description: 'Timeless 22K gold band with a polished finish' },
          { id: 'r2', title: 'Diamond Solitaire', sku: 'RNG-002', weightGrams: 4.8, goldKarat: 18, image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&h=400&fit=crop', description: 'Elegant 18K solitaire ring with brilliant-cut diamond' },
          { id: 'r3', title: 'Temple Antique Ring', sku: 'RNG-003', weightGrams: 8.5, goldKarat: 22, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', description: 'South Indian temple design antique gold ring' },
          { id: 'r4', title: 'Rose Gold Twisted', sku: 'RNG-004', weightGrams: 3.6, goldKarat: 18, image: 'https://images.unsplash.com/photo-1598560917505-59a3ad559071?w=400&h=400&fit=crop', description: 'Contemporary twisted design in 18K rose gold' },
        ]
      }
    ]
  },
  {
    id: 'necklaces',
    name: 'Necklaces',
    icon: '📿',
    trays: [
      {
        id: 'necklaces-tray-1',
        name: 'All Necklaces',
        products: [
          { id: 'n1', title: 'Choker Necklace', sku: 'NCK-001', weightGrams: 25.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop', description: 'Heavy 22K gold choker with intricate filigree work' },
          { id: 'n2', title: 'Pearl Pendant Chain', sku: 'NCK-002', weightGrams: 12.5, goldKarat: 18, image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b6e5?w=400&h=400&fit=crop', description: '18K chain with genuine pearl pendant' },
          { id: 'n3', title: 'Layered Gold Chain', sku: 'NCK-003', weightGrams: 18.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400&h=400&fit=crop', description: 'Multi-layered 22K gold chain with modern design' },
          { id: 'n4', title: 'Mangalsutra', sku: 'NCK-004', weightGrams: 15.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', description: 'Traditional 22K gold mangalsutra with black beads' },
        ]
      }
    ]
  },
  {
    id: 'bangles',
    name: 'Bangles',
    icon: '⭕',
    trays: [
      {
        id: 'bangles-tray-1',
        name: 'All Bangles',
        products: [
          { id: 'b1', title: 'Plain Gold Bangle', sku: 'BNG-001', weightGrams: 20.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop', description: 'Classic plain 22K gold bangle, daily wear' },
          { id: 'b2', title: 'Kundan Bangle Set', sku: 'BNG-002', weightGrams: 30.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop', description: 'Ornate kundan-studded 22K bangle pair' },
          { id: 'b3', title: 'Kada (Broad Bangle)', sku: 'BNG-003', weightGrams: 35.0, goldKarat: 24, image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=400&h=400&fit=crop', description: 'Heavy 24K pure gold broad kada' },
          { id: 'b4', title: 'Filigree Bangle', sku: 'BNG-004', weightGrams: 14.0, goldKarat: 18, image: 'https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=400&h=400&fit=crop', description: 'Delicate 18K filigree work bangle' },
        ]
      }
    ]
  },
  {
    id: 'earrings',
    name: 'Earrings',
    icon: '✨',
    trays: [
      {
        id: 'earrings-tray-1',
        name: 'All Earrings',
        products: [
          { id: 'e1', title: 'Jhumka Earrings', sku: 'EAR-001', weightGrams: 10.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=400&h=400&fit=crop', description: 'Traditional 22K gold jhumka with bell design' },
          { id: 'e2', title: 'Diamond Studs', sku: 'EAR-002', weightGrams: 3.0, goldKarat: 18, image: 'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=400&h=400&fit=crop', description: '18K gold studs with solitaire diamonds' },
          { id: 'e3', title: 'Chandbali Drops', sku: 'EAR-003', weightGrams: 12.0, goldKarat: 22, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=400&fit=crop', description: 'Crescent-shaped 22K chandbali with meenakari' },
          { id: 'e4', title: 'Hoop Earrings', sku: 'EAR-004', weightGrams: 6.0, goldKarat: 18, image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2925?w=400&h=400&fit=crop', description: 'Modern 18K gold hoops, sleek and lightweight' },
        ]
      }
    ]
  },
];

// ─── Sub-Components ──────────────────────────────────────────────────────────

function NavItem({ icon, label, active = false }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-gray-50 text-gray-900'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'
      }`}
    >
      {icon}
      {label}
    </a>
  );
}

// ─── Modal Component ─────────────────────────────────────────────────────────

function ProductModal({
  mode,
  initialData,
  onSave,
  onClose,
}: {
  mode: 'add' | 'edit';
  initialData?: Product;
  onSave: (data: ProductFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ProductFormData>({
    title: initialData?.title || '',
    sku: initialData?.sku || '',
    weightGrams: initialData?.weightGrams?.toString() || '',
    goldKarat: initialData?.goldKarat || 22,
    image: initialData?.image || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.sku || !form.weightGrams) return;
    onSave(form);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          <h2 className="text-lg font-serif italic">
            {mode === 'add' ? 'Add New Product' : 'Edit Product'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                Product Name *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="e.g. Classic Gold Band"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                SKU *
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="e.g. RNG-005"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                Weight (grams) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={form.weightGrams}
                onChange={(e) => setForm({ ...form, weightGrams: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="e.g. 5.2"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                Gold Karat
              </label>
              <div className="flex gap-3">
                {([24, 22, 18] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setForm({ ...form, goldKarat: k })}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                      form.goldKarat === k
                        ? 'bg-gradient-to-b from-amber-400 to-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-amber-300'
                    }`}
                  >
                    {k}K
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                Image URL
              </label>
              <input
                type="url"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1.5 block">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                placeholder="Brief product description..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm uppercase tracking-widest hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg shadow-amber-500/25"
          >
            {mode === 'add' ? 'Add Product' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Delete Confirmation ─────────────────────────────────────────────────────

function DeleteConfirmModal({
  productName,
  onConfirm,
  onCancel,
}: {
  productName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-8 text-center"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={24} className="text-red-500" />
        </div>
        <h3 className="text-lg font-serif italic mb-2">Delete Product?</h3>
        <p className="text-sm text-gray-500 mb-6">
          Are you sure you want to delete <strong>"{productName}"</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────

export default function App() {
  const [sections, setSections] = useState<Section[]>(INITIAL_DATA);
  const [activeSectionId, setActiveSectionId] = useState('rings');
  const [activeTrayId, setActiveTrayId] = useState('rings-tray-1');
  const [goldRates, setGoldRates] = useState<GoldRates>(INITIAL_GOLD_RATES);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const activeSection = sections.find((s) => s.id === activeSectionId) || sections[0];
  const activeTray =
    activeSection.trays.find((t) => t.id === activeTrayId) || activeSection.trays[0];

  // Filtered products by search
  const filteredProducts = useMemo(() => {
    if (!activeTray?.products) return [];
    if (!searchQuery.trim()) return activeTray.products;
    const q = searchQuery.toLowerCase();
    return activeTray.products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }, [activeTray, searchQuery]);

  // Total product count
  const totalItems = useMemo(
    () => sections.reduce((acc, s) => acc + s.trays.reduce((a, t) => a + t.products.length, 0), 0),
    [sections]
  );

  // ─── CRUD Handlers ──────────────────────────────────────────────────────────

  const handleAddProduct = (data: ProductFormData) => {
    const newProduct: Product = {
      id: `p-${nextId++}`,
      title: data.title,
      sku: data.sku,
      weightGrams: parseFloat(data.weightGrams),
      goldKarat: data.goldKarat,
      image: data.image || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=400&h=400&fit=crop',
      description: data.description,
    };

    setSections((prev) =>
      prev.map((section) =>
        section.id === activeSectionId
          ? {
              ...section,
              trays: section.trays.map((tray) =>
                tray.id === activeTrayId
                  ? { ...tray, products: [...tray.products, newProduct] }
                  : tray
              ),
            }
          : section
      )
    );
    setShowAddModal(false);
  };

  const handleEditProduct = (data: ProductFormData) => {
    if (!editingProduct) return;
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        trays: section.trays.map((tray) => ({
          ...tray,
          products: tray.products.map((product) =>
            product.id === editingProduct.id
              ? {
                  ...product,
                  title: data.title,
                  sku: data.sku,
                  weightGrams: parseFloat(data.weightGrams),
                  goldKarat: data.goldKarat,
                  image: data.image || product.image,
                  description: data.description,
                }
              : product
          ),
        })),
      }))
    );
    setEditingProduct(null);
  };

  const handleDeleteProduct = () => {
    if (!deletingProduct) return;
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        trays: section.trays.map((tray) => ({
          ...tray,
          products: tray.products.filter((p) => p.id !== deletingProduct.id),
        })),
      }))
    );
    setDeletingProduct(null);
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans">
      {/* ─── Sidebar ───────────────────────────────────────────────────────── */}
      <aside className="w-64 border-r border-gray-100 flex flex-col bg-white">
        <div className="p-8">
          <h1 className="text-xl font-serif italic tracking-tight flex items-center gap-2">
            <Store className="w-5 h-5" />
            Aura Admin
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem icon={<Package size={18} />} label="Inventory Manager" active />
          <NavItem icon={<Store size={18} />} label="Store Layout" />
          <NavItem icon={<User size={18} />} label="Staff" />
        </nav>

        {/* Gold Rate Panel in Sidebar */}
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-b from-amber-50 to-amber-100/50 rounded-2xl p-5 border border-amber-200/50">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                <IndianRupee size={12} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800">
                Gold Rates
              </span>
            </div>
            <div className="space-y-3">
              {([
                { key: 'k24' as const, label: '24K', desc: 'Pure Gold' },
                { key: 'k22' as const, label: '22K', desc: 'Standard' },
                { key: 'k18' as const, label: '18K', desc: 'Light' },
              ]).map(({ key, label, desc }) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold text-amber-700">{label}</span>
                    <span className="text-[10px] text-amber-600">{desc}</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 text-xs font-semibold">₹</span>
                    <input
                      type="number"
                      value={goldRates[key]}
                      onChange={(e) =>
                        setGoldRates({ ...goldRates, [key]: Math.max(0, Number(e.target.value)) })
                      }
                      className="w-full pl-7 pr-10 py-2 rounded-lg border border-amber-200 bg-white/80 text-sm font-semibold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 transition-all"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-amber-500">/gram</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-medium text-white">
              OJ
            </div>
            <div>
              <p className="text-xs font-semibold">Om Joshi</p>
              <p className="text-[10px] text-gray-400">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-gray-100 bg-white flex items-center justify-between px-10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Inventory</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-medium">{activeSection.name}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search SKU or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm ml-2 w-48"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell size={20} className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="h-8 w-[1px] bg-gray-100"></div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-gray-900">Total Items</span>
                <span className="text-lg font-serif italic">{totalItems}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* Level 1: Category Selector (Sections) */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Categories
              </h2>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Gem size={12} />
                <span>
                  Price = (Gold Rate × Weight + 12% Making) + 3% GST
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    if (section.trays.length > 0) setActiveTrayId(section.trays[0].id);
                    setSearchQuery('');
                  }}
                  className={`px-6 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 border flex items-center gap-2.5 ${
                    activeSectionId === section.id
                      ? 'bg-gradient-to-r from-gray-900 to-gray-800 text-white border-gray-900 shadow-lg shadow-black/10'
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-base">{section.icon}</span>
                  {section.name}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      activeSectionId === section.id
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {section.trays.reduce((a, t) => a + t.products.length, 0)}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Level 2: Tray Selector */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                Trays
              </h2>
              <button className="text-xs font-medium text-gray-900 flex items-center gap-1 hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                <Plus size={12} /> Add Tray
              </button>
            </div>
            <div className="flex gap-2">
              {activeSection.trays.map((tray) => (
                <button
                  key={tray.id}
                  onClick={() => {
                    setActiveTrayId(tray.id);
                    setSearchQuery('');
                  }}
                  className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTrayId === tray.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tray.name}
                  <span className="ml-2 text-[10px]">({tray.products.length})</span>
                </button>
              ))}
              {activeSection.trays.length === 0 && (
                <p className="text-sm text-gray-400 italic">No trays configured for this section.</p>
              )}
            </div>
          </section>

          {/* Level 3: Product Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif italic">{activeTray?.name || 'Select a Tray'}</h3>
              <div className="flex items-center gap-4">
                <div className="text-xs text-gray-400 font-medium">
                  {filteredProducts.length} Items
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold uppercase tracking-widest hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/20"
                >
                  <Plus size={14} />
                  Add Product
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => {
                  const price = computePrice(product.weightGrams, product.goldKarat, goldRates);
                  const goldRate = product.goldKarat === 24 ? goldRates.k24 : product.goldKarat === 22 ? goldRates.k22 : goldRates.k18;
                  const goldCost = product.weightGrams * goldRate;
                  const makingCharge = goldCost * 0.12;
                  const gst = (goldCost + makingCharge) * 0.03;

                  return (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-500"
                    >
                      {/* Image Container */}
                      <div className="aspect-square overflow-hidden bg-gray-50 relative">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        {/* SKU Badge */}
                        <div className="absolute top-3 left-3">
                          <span className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-tight shadow-sm border border-gray-100">
                            {product.sku}
                          </span>
                        </div>
                        {/* Karat Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 rounded-lg text-[10px] font-bold text-white shadow-sm">
                            {product.goldKarat}K
                          </span>
                        </div>
                        {/* Action buttons on hover */}
                        <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm"
                          >
                            <Pencil size={14} className="text-gray-600" />
                          </button>
                          <button
                            onClick={() => setDeletingProduct(product)}
                            className="w-9 h-9 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition-all shadow-sm"
                          >
                            <Trash2 size={14} className="text-gray-600" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="font-medium text-gray-900 leading-tight">{product.title}</h4>
                          <p className="text-[11px] text-gray-400 leading-relaxed line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Weight & Details */}
                        <div className="flex items-center gap-3 text-[11px]">
                          <div className="flex items-center gap-1 text-gray-400">
                            <Scale size={11} />
                            <span>{product.weightGrams}g</span>
                          </div>
                          <div className="flex items-center gap-1 text-amber-600">
                            <CircleDot size={11} />
                            <span>{product.goldKarat}K Gold</span>
                          </div>
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-gradient-to-r from-gray-50 to-amber-50/50 rounded-xl p-3.5 space-y-1.5 border border-gray-100/80">
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Gold ({product.weightGrams}g × ₹{goldRate.toLocaleString('en-IN')})</span>
                            <span>{formatINR(goldCost)}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Making Charge (12%)</span>
                            <span>+{formatINR(Math.round(makingCharge))}</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>GST (3%)</span>
                            <span>+{formatINR(Math.round(gst))}</span>
                          </div>
                          <div className="border-t border-gray-200/60 pt-1.5 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Total</span>
                            <span className="text-base font-serif italic font-semibold text-amber-700">
                              {formatINR(price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* Add New Item Placeholder */}
              <button
                onClick={() => setShowAddModal(true)}
                className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 p-10 text-gray-300 hover:border-amber-300 hover:text-amber-500 transition-all group min-h-[300px]"
              >
                <div className="w-14 h-14 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center group-hover:border-amber-300 group-hover:scale-110 transition-all">
                  <Plus size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Add New Item</span>
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* ─── Modals ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <ProductModal
            mode="add"
            onSave={handleAddProduct}
            onClose={() => setShowAddModal(false)}
          />
        )}
        {editingProduct && (
          <ProductModal
            mode="edit"
            initialData={editingProduct}
            onSave={handleEditProduct}
            onClose={() => setEditingProduct(null)}
          />
        )}
        {deletingProduct && (
          <DeleteConfirmModal
            productName={deletingProduct.title}
            onConfirm={handleDeleteProduct}
            onCancel={() => setDeletingProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
