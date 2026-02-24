/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  ChevronRight, 
  Search, 
  Bell, 
  User,
  Plus,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Product {
  id: string;
  title: string;
  sku: string;
  quantity: number;
  image: string;
  price: string;
}

interface Tray {
  id: string;
  name: string;
  products: Product[];
}

interface Section {
  id: string;
  name: string;
  trays: Tray[];
}

// Mock Data
const INITIAL_DATA: Section[] = [
  {
    id: 'counter-a',
    name: 'Counter A (Gold)',
    trays: [
      {
        id: 'tray-1',
        name: 'Tray 1 (Rings)',
        products: [
          { id: 'p1', title: '18k Gold Band', sku: 'SKU: 8A2', quantity: 5, price: '$1,200', image: 'https://picsum.photos/seed/ring1/400/400' },
          { id: 'p2', title: 'Diamond Solitaire', sku: 'SKU: 4F1', quantity: 2, price: '$4,500', image: 'https://picsum.photos/seed/ring2/400/400' },
          { id: 'p3', title: 'Rose Gold Eternity', sku: 'SKU: 9B3', quantity: 3, price: '$2,800', image: 'https://picsum.photos/seed/ring3/400/400' },
          { id: 'p4', title: 'Vintage Filigree', sku: 'SKU: 2C7', quantity: 1, price: '$3,100', image: 'https://picsum.photos/seed/ring4/400/400' },
          { id: 'p5', title: 'Sapphire Halo', sku: 'SKU: 5D9', quantity: 4, price: '$5,200', image: 'https://picsum.photos/seed/ring5/400/400' },
          { id: 'p6', title: 'Platinum Minimalist', sku: 'SKU: 1E4', quantity: 6, price: '$1,800', image: 'https://picsum.photos/seed/ring6/400/400' },
        ]
      },
      {
        id: 'tray-2',
        name: 'Tray 2 (Chains)',
        products: [
          { id: 'p7', title: 'Cuban Link 24"', sku: 'SKU: CH1', quantity: 3, price: '$2,500', image: 'https://picsum.photos/seed/chain1/400/400' },
          { id: 'p8', title: 'Figaro Chain', sku: 'SKU: CH2', quantity: 5, price: '$1,400', image: 'https://picsum.photos/seed/chain2/400/400' },
        ]
      },
      { id: 'tray-3', name: 'Tray 3 (Bangles)', products: [] }
    ]
  },
  { id: 'counter-b', name: 'Counter B (Diamonds)', trays: [] },
  { id: 'window', name: 'Window Display', trays: [] },
  { id: 'vault', name: 'Vault', trays: [] },
];

export default function App() {
  const [sections, setSections] = useState<Section[]>(INITIAL_DATA);
  const [activeSectionId, setActiveSectionId] = useState('counter-a');
  const [activeTrayId, setActiveTrayId] = useState('tray-1');

  const activeSection = sections.find(s => s.id === activeSectionId) || sections[0];
  const activeTray = activeSection.trays.find(t => t.id === activeTrayId) || activeSection.trays[0];

  const handleSell = (productId: string) => {
    setSections(prevSections => 
      prevSections.map(section => ({
        ...section,
        trays: section.trays.map(tray => ({
          ...tray,
          products: tray.products.map(product => 
            product.id === productId && product.quantity > 0
              ? { ...product, quantity: product.quantity - 1 }
              : product
          )
        }))
      }))
    );
  };

  return (
    <div className="flex h-screen bg-[#FDFDFD] font-sans">
      {/* Sidebar */}
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

        <div className="p-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium">JD</div>
            <div>
              <p className="text-xs font-semibold">Julianne Deville</p>
              <p className="text-[10px] text-gray-400">Store Manager</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-bottom border-gray-100 bg-white flex items-center justify-between px-10">
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
                className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-48"
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
                <span className="text-lg font-serif italic">1,240</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10 space-y-8">
          {/* Level 1: Section Selector */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Store Zones</h2>
              <button className="text-xs font-medium text-gray-900 flex items-center gap-1 hover:underline">
                Manage Layout <ArrowRight size={12} />
              </button>
            </div>
            <div className="flex gap-3">
              {sections.map(section => (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveSectionId(section.id);
                    if (section.trays.length > 0) setActiveTrayId(section.trays[0].id);
                  }}
                  className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 border ${
                    activeSectionId === section.id 
                      ? 'bg-black text-white border-black shadow-lg shadow-black/10' 
                      : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
                  }`}
                >
                  {section.name}
                </button>
              ))}
            </div>
          </section>

          {/* Level 2: Tray Selector */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Virtual Trays</h2>
              <button className="text-xs font-medium text-gray-900 flex items-center gap-1 hover:bg-gray-50 px-3 py-1 rounded-lg transition-colors">
                <Plus size={12} /> Add Tray
              </button>
            </div>
            <div className="flex gap-2">
              {activeSection.trays.map(tray => (
                <button
                  key={tray.id}
                  onClick={() => setActiveTrayId(tray.id)}
                  className={`px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTrayId === tray.id 
                      ? 'bg-gray-100 text-gray-900' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tray.name}
                </button>
              ))}
              {activeSection.trays.length === 0 && (
                <p className="text-sm text-gray-400 italic">No trays configured for this section.</p>
              )}
            </div>
          </section>

          {/* Level 3: Visual Grid */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif italic">{activeTray?.name || 'Select a Tray'}</h3>
              <div className="text-xs text-gray-400 font-medium">
                {activeTray?.products.length || 0} Items in this tray
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <AnimatePresence mode="popLayout">
                {activeTray?.products.map((product) => (
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
                      <div className="absolute top-3 right-3">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold tracking-tight shadow-sm border border-gray-100">
                          {product.sku}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 space-y-4">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-gray-900 leading-tight">{product.title}</h4>
                          <span className="text-sm font-serif italic text-gray-600">{product.price}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className={`w-1.5 h-1.5 rounded-full ${product.quantity > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                           <p className={`text-xs font-medium ${product.quantity > 0 ? 'text-gray-400' : 'text-red-500 font-semibold'}`}>
                            {product.quantity > 0 ? `In Tray: ${product.quantity}` : 'Out of Stock'}
                           </p>
                        </div>
                      </div>

                      <button
                        disabled={product.quantity === 0}
                        onClick={() => handleSell(product.id)}
                        className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                          product.quantity > 0
                            ? 'bg-white border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                            : 'bg-gray-50 border border-gray-100 text-red-300 cursor-not-allowed'
                        }`}
                      >
                        {product.quantity > 0 ? 'Mark as Sold (-1)' : 'Out of Stock'}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {/* Add New Item Placeholder */}
              <button className="border-2 border-dashed border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3 p-10 text-gray-300 hover:border-gray-200 hover:text-gray-400 transition-all group">
                <div className="w-12 h-12 rounded-full border-2 border-dashed border-gray-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">Add New Item</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
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
