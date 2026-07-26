import React, { forwardRef } from 'react';
import { SaleItem, db } from '@/lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { useLocation } from '@/lib/contexts/LocationContext';

interface ReceiptProps {
  saleId: string;
  cart: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  date: string;
  user: string;
  paymentMethod?: string;
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(
  ({ saleId, cart, subtotal, discount, total, date, user, paymentMethod }, ref) => {
    const { activeLocationId } = useLocation();
    
    // Fetch active location
    const activeStore = useLiveQuery(() => 
      activeLocationId ? db.locations.get(activeLocationId) : undefined
    , [activeLocationId]);
    
    const storeName = activeStore?.name || "BOUTIQUE";
    const storeAddress = activeStore?.address || "";

    // Format date and time
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString('fr-FR');
    const formattedTime = dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div ref={ref} className="receipt-container bg-white text-black p-4 text-xs font-mono w-[300px] mx-auto hidden print:block">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg mb-1">{storeName.toUpperCase()}</h1>
          {storeAddress && <p>{storeAddress}</p>}
          <p className="mt-2 text-center text-gray-500">--------------------------------</p>
        </div>

        {/* Info */}
        <div className="mb-4">
          <p>Ticket: {saleId.split('-')[0].toUpperCase()}</p>
          <p>Date: {formattedDate} {formattedTime}</p>
          <p>Vendeur: {user}</p>
          <p className="mt-2 text-center text-gray-500">--------------------------------</p>
        </div>

        {/* Items */}
        <table className="w-full mb-4 text-left">
          <thead>
            <tr className="border-b border-dashed border-gray-400">
              <th className="py-1">QTE x PRIX</th>
              <th className="py-1 text-right">MONTANT</th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item, index) => (
              <React.Fragment key={index}>
                <tr>
                  <td colSpan={2} className="pt-2 font-semibold">
                    {item.productName}
                  </td>
                </tr>
                <tr>
                  <td className="pb-1">
                    {item.quantity} x {item.price.toLocaleString()}
                  </td>
                  <td className="pb-1 text-right font-semibold">
                    {item.total.toLocaleString()}
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>

        <p className="text-center text-gray-500 mb-2">--------------------------------</p>

        {/* Totals */}
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>SOUS-TOTAL</span>
            <span>{subtotal.toLocaleString()} FCFA</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span>REMISE</span>
              <span>- {discount.toLocaleString()} FCFA</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm mt-2 pt-2 border-t border-dashed border-gray-400">
            <span>NET A PAYER</span>
            <span>{total.toLocaleString()} FCFA</span>
          </div>
          {paymentMethod && (
            <div className="flex justify-between text-sm mt-1">
              <span>RÉGLÉ PAR</span>
              <span>{paymentMethod.toUpperCase()}</span>
            </div>
          )}
        </div>

        <p className="text-center text-gray-500 mt-4 mb-2">--------------------------------</p>
        
        {/* Footer */}
        <div className="text-center mt-4">
          <p className="font-bold">MERCI DE VOTRE VISITE !</p>
          <p className="mt-1 text-[10px]">Propulsé par Sokoo</p>
        </div>
      </div>
    );
  }
);

Receipt.displayName = 'Receipt';
