"use client";

import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product, SaleItem } from "@/lib/db";
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, ReceiptText } from "lucide-react";

export default function POSPage() {
  const allProducts = useLiveQuery(() => db.products.toArray()) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProducts, searchQuery]);

  // Cart calculations
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  // Add to cart
  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) return; // Prevent adding out-of-stock items

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        // Prevent exceeding available stock
        if (existing.quantity >= product.stock) return prev;
        
        return prev.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      
      return [...prev, {
        productId: product.id!,
        productName: product.name,
        price: product.price,
        quantity: 1,
        total: product.price
      }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return item; // Handled by remove
          if (newQty > product.stock) return item; // Cannot exceed stock
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      });
    });
  };

  const handleSetQuantity = (productId: string, qty: number) => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    if (isNaN(qty) || qty < 1) return;

    setCart(prev => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = qty > product.stock ? product.stock : qty;
          return { ...item, quantity: newQty, total: newQty * item.price };
        }
        return item;
      });
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      const now = Date.now();
      const isoDate = new Date(now).toISOString();

      await db.transaction('rw', db.products, db.movements, db.sales, async () => {
        // 1. Record the sale
        const saleId = await db.sales.add({
          items: cart,
          subtotal,
          discount: discountAmount,
          total,
          date: isoDate,
          timestamp: now,
          user: "Vendeur Principal"
        });

        // 2. Update products and record movements
        for (const item of cart) {
          const product = await db.products.get(item.productId);
          if (product) {
            const newStock = product.stock - item.quantity;
            const newStatus = newStock > 5 ? "En stock" : (newStock > 0 ? "Stock Faible" : "Rupture");
            
            await db.products.update(item.productId, {
              stock: newStock,
              status: newStatus
            });

            await db.movements.add({
              productId: item.productId,
              productName: item.productName,
              type: "out",
              quantity: item.quantity,
              motif: `Vente #${saleId}`,
              date: isoDate,
              timestamp: now,
              user: "Vendeur Principal"
            });
          }
        }
      });

      // Reset state and show success
      setCart([]);
      setDiscountPercent(0);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la vente:", error);
      alert("Une erreur est survenue lors de l'enregistrement de la vente.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden">
      <div className="mb-4 shrink-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Caisse</h2>
        <p className="text-slate-500">Gérez vos ventes au comptoir.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0">
        
        {/* Left Side: Products List */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-0">
          <div className="p-4 border-b border-slate-100 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un produit ou scanner un code-barres..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border-0 ring-1 ring-inset ring-slate-200 rounded-xl focus:ring-2 focus:ring-brand-blue"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className={`flex flex-col p-4 rounded-xl text-left border transition-all ${
                    product.stock > 0 
                      ? "bg-white border-slate-200 hover:border-brand-blue hover:shadow-md cursor-pointer group" 
                      : "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex-1 mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                    <h3 className="font-bold text-slate-900 leading-tight mt-1 group-hover:text-brand-blue transition-colors">{product.name}</h3>
                  </div>
                  <div className="flex items-end justify-between w-full">
                    <div className="font-black text-lg text-brand-dark">{product.price.toLocaleString()} FCFA</div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                      product.stock > 5 ? "bg-green-50 text-green-700" : (product.stock > 0 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700")
                    }`}>
                      {product.stock} dispo
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 py-10">
                <ShoppingCart className="w-12 h-12 mb-3 text-slate-300" />
                <p>Aucun produit ne correspond à votre recherche.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart (Ticket) */}
        <div className="w-full lg:w-[400px] max-h-[45vh] lg:max-h-none flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-0 shrink-0">
          <div className="p-3 lg:p-4 border-b border-slate-100 bg-brand-dark text-white flex items-center justify-between shrink-0">
            <h3 className="font-bold text-base lg:text-lg flex items-center gap-2">
              <ReceiptText className="w-4 h-4 lg:w-5 lg:h-5" />
              Ticket de caisse
            </h3>
            {cart.length > 0 && (
              <button onClick={() => setCart([])} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
                Vider
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {showSuccess ? (
              <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-1">Vente validée !</h4>
                <p className="text-sm text-slate-500">Le stock a été mis à jour avec succès.</p>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p>Le panier est vide</p>
                <p className="text-xs mt-1">Sélectionnez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.productId} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-start">
                      <span className="font-semibold text-slate-900 text-sm line-clamp-1">{item.productName}</span>
                      <button onClick={() => handleRemoveItem(item.productId)} className="text-slate-400 hover:text-red-500 transition-colors p-1 ml-2 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center bg-white rounded-lg border border-slate-200">
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, -1)}
                          disabled={item.quantity <= 1}
                          className="p-1.5 text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              // Temporary state for clearing the input
                              setCart(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: 0 } : i));
                            } else {
                              handleSetQuantity(item.productId, parseInt(val, 10));
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity <= 0) handleSetQuantity(item.productId, 1);
                          }}
                          className="w-10 text-center font-semibold text-sm border-0 focus:ring-0 p-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          className="p-1.5 text-slate-500 hover:text-brand-blue transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-bold text-slate-900">
                        {item.total.toLocaleString()} F
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 lg:p-4 bg-slate-50 border-t border-slate-100 shrink-0">
            <div className="space-y-1.5 lg:space-y-2 mb-3 lg:mb-4">
              <div className="flex justify-between text-xs lg:text-sm text-slate-500">
                <span>Sous-total</span>
                <span>{subtotal.toLocaleString()} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-xs lg:text-sm">
                <span className="text-slate-500">Remise (%)</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value) || 0)}
                  className="w-14 lg:w-16 px-2 py-1 text-right border-slate-200 rounded-md ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue"
                />
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-xs lg:text-sm text-orange-500 font-medium">
                  <span>Montant Remise</span>
                  <span>- {discountAmount.toLocaleString()} FCFA</span>
                </div>
              )}
              <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-end">
                <span className="font-bold text-sm lg:text-base text-slate-900">Total à payer</span>
                <span className="text-xl lg:text-2xl font-black text-brand-dark">{total.toLocaleString()} FCFA</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing || showSuccess}
              className="w-full py-3 lg:py-4 bg-brand-blue text-white rounded-xl font-bold text-base lg:text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2"
            >
              {isProcessing ? "Encaissement..." : "Encaisser"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
