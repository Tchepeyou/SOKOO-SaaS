import { db } from "./db";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, supabaseKey);

export async function syncWithSupabase() {
  if (!supabaseUrl || supabaseUrl.includes("abcdefghijklmnopqrst")) {
    console.log("Synchronisation ignorée : Clés Supabase non configurées ou invalides.");
    return false;
  }

  try {
    console.log("Début de la synchronisation avec Supabase...");
    
    // Vérifier l'authentification
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    if (authError || !session) {
      console.log("Synchronisation ignorée : Utilisateur non connecté.");
      return false;
    }

    // Récupérer le profil et l'organization_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile?.organization_id) {
      console.log("Synchronisation ignorée : Profil ou Organisation introuvable.");
      return false;
    }

    const orgId = profile.organization_id;

    // 1. Synchroniser les Produits
    const localProducts = await db.products.toArray();
    if (localProducts.length > 0) {
      const { error: productsError } = await supabase.from('products').upsert(
        localProducts.map(p => ({
          id: p.id,
          organization_id: orgId,
          name: p.name,
          category: p.category,
          unit_price: p.price,
          alert_threshold: 5,
          is_active: p.status !== "Suspendu"
        })),
        { onConflict: 'id' }
      );
      if (productsError) {
        console.error("Erreur de synchronisation (Produits):", productsError);
      }
    }

    // 2. Synchroniser les Mouvements de stock
    const localMovements = await db.movements.toArray();
    if (localMovements.length > 0) {
      const { error: movementsError } = await supabase.from('stock_movements').upsert(
        localMovements.map(m => ({
          client_generated_id: m.id, // On utilise l'UUID Dexie comme idempotence
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
      }
    }

    // 3. Synchroniser les Lieux / Points de vente
    const localLocations = await db.locations.toArray();
    if (localLocations.length > 0) {
      const { error: locationsError } = await supabase.from('locations').upsert(
        localLocations.map(l => ({
          id: l.id,
          organization_id: orgId,
          name: l.name,
          address: l.address
        })),
        { onConflict: 'id' }
      );
      if (locationsError) {
        console.error("Erreur de synchronisation (Boutiques):", locationsError);
      }
    }

    console.log("✅ Synchronisation terminée avec succès.");
    return true;
  } catch (error) {
    console.error("❌ Erreur critique lors de la synchronisation :", error);
    return false;
  }
}
