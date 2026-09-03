"use client";

import { useState, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, Product, SaleItem, Sale } from "@/lib/db";
import { Receipt } from "@/components/dashboard/Receipt";
import { Search, Plus, Minus, Trash2, ShoppingCart, CheckCircle2, ReceiptText, Printer, ArrowRight, X, ImageIcon, Wallet, CreditCard, Smartphone, Banknote } from "lucide-react";
import { useLocation } from "@/lib/contexts/LocationContext";
import { toast } from "sonner";

export default function POSPage() {
  const { activeLocationId } = useLocation();

  const allProducts = useLiveQuery(() => {
    if (activeLocationId) {
      return db.products.where('locationId').equals(activeLocationId).toArray();
    }
    return [];
  }, [activeLocationId]) || [];
  
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("Espèces");

  // Filter products by search
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))
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

  const [lastSale, setLastSale] = useState<Sale | null>(null);

  const handleCheckout = async () => {
    if (cart.length === 0 || isProcessing) return;
    setIsProcessing(true);

    try {
      const now = Date.now();
      const isoDate = new Date(now).toISOString();
      const saleId = crypto.randomUUID();

      // Get current user name from Supabase/Dexie
      let currentUserName = "Utilisateur";
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          const member = await db.teamMembers.get(data.session.user.id);
          if (member) currentUserName = member.name;
        }
      } catch (e) {}
      
      const newSale: Sale = {
        id: saleId,
        items: cart,
        subtotal,
        discount: discountAmount,
        total,
        date: isoDate,
        timestamp: now,
        user: currentUserName,
        locationId: activeLocationId || undefined,
        paymentMethod: paymentMethod
      };

      await db.transaction('rw', db.products, db.movements, db.sales, async () => {
        // 1. Record the sale
        await db.sales.add(newSale);

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
              id: crypto.randomUUID(),
              productId: item.productId,
              productName: item.productName,
              type: "out",
              quantity: item.quantity,
              motif: `Vente (Ticket)`,
              date: isoDate,
              timestamp: now,
              user: currentUserName,
              locationId: activeLocationId || undefined
            });
          }
        }
      });

      // Show success screen and keep sale data for receipt
      setLastSale(newSale);
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to complete sale", error);
      toast.error("Une erreur est survenue lors de l'enregistrement de la vente.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNewSale = () => {
    setCart([]);
    setDiscountPercent(0);
    setShowSuccess(false);
    setLastSale(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-8rem)] overflow-hidden print:h-auto print:overflow-visible -m-4 p-4 md:-m-6 md:p-6 lg:-m-8 lg:p-8">
      
      {/* Receipt Component (Hidden by default, shown when printing) */}
      {lastSale && (
        <Receipt 
          saleId={lastSale.id}
          cart={lastSale.items}
          subtotal={lastSale.subtotal}
          discount={lastSale.discount}
          total={lastSale.total}
          date={lastSale.date}
          user={lastSale.user}
          paymentMethod={lastSale.paymentMethod}
        />
      )}

      <div className="mb-2 lg:mb-4 shrink-0 print:hidden">
        <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900">Caisse</h2>
        <p className="text-sm text-slate-500">Gérez vos ventes au comptoir.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 flex-1 min-h-0 print:hidden">
        
        {/* Left Side: Products List */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden min-h-0 z-0">
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
                  disabled={product.stock <= 0 || showSuccess}
                  className={`flex flex-col rounded-xl text-left border transition-all overflow-hidden ${
                    product.stock > 0 && !showSuccess
                      ? "bg-white border-slate-200 hover:border-brand-blue hover:shadow-md cursor-pointer group" 
                      : "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="p-4 flex flex-col flex-1 w-full relative">
                    {product.stock <= 0 && (
                      <div className="absolute top-4 right-4">
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Épuisé</span>
                      </div>
                    )}
                    <div className="flex-1 mb-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{product.category}</span>
                      <h3 className="font-bold text-slate-900 leading-tight mt-1 group-hover:text-brand-blue transition-colors line-clamp-2">{product.name}</h3>
                    </div>
                    <div className="flex items-end justify-between w-full mt-auto">
                      <div className="font-black text-lg text-brand-dark">{product.price.toLocaleString()} FCFA</div>
                      <div className={`text-xs font-medium px-2 py-1 rounded-md ${
                        product.stock > 5 ? "bg-green-50 text-green-700" : (product.stock > 0 ? "bg-orange-50 text-orange-700" : "bg-red-50 text-red-700")
                      }`}>
                        {product.stock} dispo
                      </div>
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
        <div className="w-full lg:w-[400px] flex flex-col bg-white lg:shadow-sm border border-slate-100 overflow-hidden shrink-0 flex-none h-auto max-h-[55%] lg:max-h-none lg:h-auto rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] lg:shadow-sm z-10">
          <div className="p-2 lg:p-4 border-b border-slate-100 bg-brand-dark text-white flex items-center justify-between shrink-0">
            <h3 className="font-bold text-sm lg:text-lg flex items-center gap-2">
              <ReceiptText className="w-4 h-4 lg:w-5 lg:h-5" />
              Ticket de caisse
            </h3>
            {cart.length > 0 && !showSuccess && (
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
                <p className="text-sm text-slate-500 mb-8">Le paiement a bien été enregistré.</p>
                
                <div className="w-full space-y-3">
                  <button 
                    onClick={handlePrint}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Printer className="w-5 h-5" />
                    Imprimer le ticket
                  </button>
                  <button 
                    onClick={handleNewSale}
                    className="w-full py-3.5 bg-brand-blue/10 text-brand-blue rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-brand-blue/20 transition-colors"
                  >
                    Nouvelle Vente
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                <p>Le panier est vide</p>
                <p className="text-xs mt-1">Sélectionnez des produits pour commencer</p>
              </div>
            ) : (
              <div className="space-y-4 pb-4">
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
                          className="p-1.5 lg:p-2 text-slate-500 hover:text-brand-blue disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
                        >
                          <Minus className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setCart(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: 0 } : i));
                            } else {
                              handleSetQuantity(item.productId, parseInt(val, 10));
                            }
                          }}
                          onBlur={() => {
                            if (item.quantity <= 0) handleSetQuantity(item.productId, 1);
                          }}
                          className="w-10 lg:w-12 text-center font-semibold text-sm lg:text-base border-0 focus:ring-0 p-0 bg-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => handleUpdateQuantity(item.productId, 1)}
                          className="p-1.5 lg:p-2 text-slate-500 hover:text-brand-blue transition-colors"
                        >
                          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                      </div>
                      <div className="font-bold text-slate-900 text-sm lg:text-base">
                        {item.total.toLocaleString()} FCFA
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showSuccess && (
            <div className="p-2 lg:p-5 bg-white border-t border-slate-100 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
              <div className="space-y-1 lg:space-y-2 mb-2 lg:mb-4">
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
                    className="w-16 px-2 py-1.5 text-right border-slate-200 rounded-md ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-brand-blue font-medium"
                  />
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-xs lg:text-sm text-orange-500 font-medium pt-1">
                    <span>Montant Remise</span>
                    <span>- {discountAmount.toLocaleString()} FCFA</span>
                  </div>
                )}
                <div className="pt-1 mt-1 lg:pt-3 lg:mt-3 border-t border-dashed border-slate-200 flex justify-between items-end">
                  <span className="font-bold text-xs lg:text-base text-slate-900">Total</span>
                  <span className="text-lg lg:text-2xl font-black text-brand-dark">{total.toLocaleString()} FCFA</span>
                </div>
              </div>

              <div className="mb-2 lg:mb-4">
                <label className="text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 lg:mb-2 block">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-1 lg:gap-2">
                  <button 
                    onClick={() => setPaymentMethod("Espèces")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === "Espèces" ? "bg-brand-blue/10 border-brand-blue text-brand-blue" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    Espèces
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("Mobile Money")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === "Mobile Money" ? "bg-brand-blue/10 border-brand-blue text-brand-blue" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <Smartphone className="w-5 h-5 mb-1" />
                    Mobile
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("Carte")}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs font-medium transition-colors ${paymentMethod === "Carte" ? "bg-brand-blue/10 border-brand-blue text-brand-blue" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"}`}
                  >
                    <CreditCard className="w-5 h-5 mb-1" />
                    Carte
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing || showSuccess}
                className="w-full py-2.5 lg:py-4 bg-brand-blue text-white rounded-xl font-bold text-sm lg:text-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-blue/20 flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {isProcessing ? "En cours..." : "Encaisser"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
