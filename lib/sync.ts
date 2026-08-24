import { db, Product, Movement, Location, TeamMember, Sale } from "./db";
import { createClient } from "@/lib/supabase/client";
import { bulkSaveLocationsToSupabase } from "@/lib/actions/locations";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabase = createClient();

export async function pullFromSupabase(orgId: string) {
  try {
    console.log("⬇️ Récupération des données depuis Supabase...");

    // 1. Pull Products
    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('organization_id', orgId);
    
    if (productsData) {
      const existingProducts = await db.products.toArray();
      const productsToPut: Product[] = productsData.map(p => {
        const existing = existingProducts.find(ep => ep.id === p.id);
        return {
          id: p.id,
          name: p.name,
          category: p.category || "Général",
          stock: 0,
          price: p.unit_price || 0,
          purchasePrice: existing?.purchasePrice || undefined, // Preserve local purchasePrice
          barcode: existing?.barcode || undefined, // Preserve local barcode
          imageUrl: existing?.imageUrl || undefined, // Preserve local imageUrl
          status: p.is_active ? "En stock" : "Suspendu",
          locationId: p.location_id || "",
          createdAt: new Date(p.created_at).getTime()
        };
      });
      
      const { data: stockData, error: stockErr } = await supabase
        .from('current_stock')
        .select('product_id, quantity_on_hand')
        .eq('organization_id', orgId);
      
      if (stockErr) console.error("STOCK ERR:", stockErr);
        
      if (stockData) {
        stockData.forEach(s => {
          const prod = productsToPut.find(p => p.id === s.product_id);
          if (prod) {
            prod.stock = s.quantity_on_hand;
            prod.status = prod.stock > 5 ? "En stock" : (prod.stock > 0 ? "Stock Faible" : "Rupture");
          }
        });
      }
      
      await db.products.bulkPut(productsToPut);
    }

    // 2. Pull Movements
    const { data: movementsData, error: movErr } = await supabase
      .from('stock_movements')
      .select('*, products(name, location_id)')
      .eq('organization_id', orgId);
      
    if (movErr) console.error("MOV ERR:", movErr);

    if (movementsData) {
      const movementsToPut: Movement[] = movementsData.map(m => ({
        id: m.client_generated_id || m.id,
        productId: m.product_id,
        productName: m.products?.name || "Produit inconnu",
        type: m.type as "in" | "out",
        quantity: m.quantity,
        motif: m.note,
        date: m.created_at,
        timestamp: new Date(m.created_at).getTime(),
        user: m.created_by,
        locationId: m.products?.location_id || m.location_id || ""
      }));
      await db.movements.bulkPut(movementsToPut);
    }

    // 3. Pull Sales
    const { data: salesData } = await supabase
      .from('sales')
      .select('*')
      .eq('organization_id', orgId);

    if (salesData) {
      const salesToPut: Sale[] = salesData.map(s => ({
        id: s.client_generated_id || s.id,
        items: s.items || [],
        subtotal: s.subtotal,
        discount: s.discount,
        total: s.total,
        date: s.created_at,
        timestamp: new Date(s.created_at).getTime(),
        user: s.created_by,
        locationId: s.location_id || "",
        paymentMethod: s.payment_method
      }));
      await db.sales.bulkPut(salesToPut);
    }

    // 4. Pull Locations
    const { data: locationsData } = await supabase
      .from('locations')
      .select('*')
      .eq('organization_id', orgId);

    if (locationsData) {
      const existingLocs = await db.locations.toArray();
      const locationsToPut: Location[] = locationsData.map(l => {
        const existing = existingLocs.find(el => el.id === l.id);
        return {
          id: l.id,
          name: l.name,
          address: l.address || "",
          isMain: existing ? existing.isMain : false,
          createdAt: new Date(l.created_at).getTime()
        };
      });
      
      // Ensure at least one location is main
      if (locationsToPut.length > 0 && !locationsToPut.some(l => l.isMain)) {
        // Sort by created_at to make the oldest one the main one consistently
        locationsToPut.sort((a, b) => a.createdAt - b.createdAt);
        locationsToPut[0].isMain = true;
      }
      
      await db.locations.bulkPut(locationsToPut);
    }

    // 5. Pull Profiles (Team Members)
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', orgId);
      
    if (profilesData) {
      const teamToPut: TeamMember[] = profilesData.map(p => ({
        id: p.id,
        name: p.full_name || p.phone || "Utilisateur",
        role: p.role,
        phone: p.phone,
        location: p.location_id,
        status: "Actif",
        createdAt: new Date(p.created_at).getTime()
      }));
      await db.teamMembers.bulkPut(teamToPut);
    }

    console.log("✅ Données récupérées (Pull) avec succès.");
  } catch (error) {
    console.error("❌ Erreur lors du Pull Supabase:", error);
  }
}

export async function syncWithSupabase() {
  if (!supabaseUrl || supabaseUrl.includes("abcdefghijklmnopqrst")) {
    console.log("Synchronisation ignorée : Clés Supabase non configurées ou invalides.");
    return false;
  }

  try {
    console.log("🔄 Début de la synchronisation avec Supabase...");
    
    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.log("Synchronisation ignorée : Utilisateur non connecté.");
      return false;
    }

    // Récupérer le profil et l'organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id, role, full_name, phone')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.organization_id) {
      console.log("Synchronisation ignorée : Profil ou Organisation introuvable.");
      return false;
    }

    const orgId = profile.organization_id;

    // --- PUSH (Send local to cloud) ---
    console.log("⬆️ Envoi des données vers Supabase...");

    // 1. Synchroniser les Produits
    const localProducts = await db.products.toArray();
    if (localProducts.length > 0) {
      const { error: productsError } = await supabase.from('products').upsert(
        localProducts.map(p => ({
          id: p.id,
          organization_id: orgId,
          location_id: p.locationId || null,
          name: p.name,
          category: p.category,
          unit_price: p.price,
          // Removed purchase_price, barcode, image_url as they don't exist in Supabase yet
          alert_threshold: 5,
          is_active: p.status !== "Suspendu"
        })),
        { onConflict: 'id' }
      );
      if (productsError) {
        console.error("Erreur de synchronisation (Produits):", productsError);
        return false;
      }
    }

    // 2. Synchroniser les Mouvements de stock
    const localMovements = await db.movements.toArray();
    if (localMovements.length > 0) {
      const { error: movementsError } = await supabase.from('stock_movements').upsert(
        localMovements.map(m => ({
          client_generated_id: m.id,
          organization_id: orgId,
          product_id: m.productId,
          type: m.type,
          quantity: m.quantity,
          note: m.motif,
          created_by: session.user.id,
          created_at: m.date
        })),
        { onConflict: 'client_generated_id' }
      );
      if (movementsError) {
        console.error("Erreur de synchronisation (Mouvements):", movementsError);
        return false;
      }
    }

    // 3. Synchroniser les Ventes (Sales)
    const localSales = await db.sales.toArray();
    if (localSales.length > 0) {
      const { error: salesError } = await supabase.from('sales').upsert(
        localSales.map(s => ({
          client_generated_id: s.id,
          organization_id: orgId,
          location_id: s.locationId || null,
          subtotal: s.subtotal,
          discount: s.discount,
          total: s.total,
          items: s.items,
          payment_method: s.paymentMethod,
          created_by: session.user.id,
          created_at: s.date
        })),
        { onConflict: 'client_generated_id' }
      );
      if (salesError) {
        console.error("Erreur de synchronisation (Ventes):", salesError);
        return false;
      }
    }

    // 4. Synchroniser les Lieux / Points de vente
    // NOTE: On désactive le push des locations depuis Dexie car les locations 
    // sont mises à jour via les Server Actions (updateUserProfile) et cela 
    // peut écraser les modifications serveur si le state local est obsolète.
    /*
    const localLocations = await db.locations.toArray();
    if (localLocations.length > 0) {
      const locationsToUpsert = localLocations.map(l => ({
        id: l.id,
        name: l.name,
        address: l.address
      }));
      
      const res = await bulkSaveLocationsToSupabase(locationsToUpsert);
      if (res?.error) console.error("Erreur de synchronisation (Boutiques):", res.error);
    }
    */

    // --- PULL (Fetch from cloud to local) ---
    // Do this after PUSH to ensure local changes are already in Supabase
    // and we get the latest computed values (e.g. stock quantities)
    await pullFromSupabase(orgId);

    console.log("✅ Synchronisation (Push & Pull) terminée avec succès.");
    return true;
  } catch (error) {
    console.error("❌ Erreur critique lors de la synchronisation :", error);
    return false;
  }
}
