import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendOnboardingReminder } from '@/lib/notifications';

export async function GET(request: Request) {
  // Vérification de sécurité pour Vercel Cron (Optionnel mais recommandé)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    
    // Calculer la date d'il y a exactement 3 jours
    const threeDaysAgoStart = new Date();
    threeDaysAgoStart.setDate(threeDaysAgoStart.getDate() - 3);
    threeDaysAgoStart.setHours(0, 0, 0, 0);
    
    const threeDaysAgoEnd = new Date(threeDaysAgoStart);
    threeDaysAgoEnd.setHours(23, 59, 59, 999);

    // 1. Trouver les organisations créées il y a 3 jours
    const { data: orgs, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name, created_at')
      .gte('created_at', threeDaysAgoStart.toISOString())
      .lte('created_at', threeDaysAgoEnd.toISOString());

    if (orgsError) throw orgsError;
    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ message: 'No organizations created 3 days ago.' });
    }

    let remindersSent = 0;

    // 2. Pour chaque organisation, vérifier s'ils ont des produits
    for (const org of orgs) {
      const { count: productCount, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id);

      if (countError) {
        console.error(`Erreur comptage produits pour org ${org.id}:`, countError);
        continue;
      }

      // S'ils ont 0 produit, on envoie la relance au propriétaire (role: 'owner')
      if (productCount === 0) {
        const { data: owner } = await supabase
          .from('profiles')
          .select('phone, full_name')
          .eq('organization_id', org.id)
          .eq('role', 'owner')
          .single();

        if (owner && owner.phone) {
          await sendOnboardingReminder(owner.phone, owner.full_name || 'Propriétaire');
          remindersSent++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `${remindersSent} reminders sent out of ${orgs.length} eligible organizations.` 
    });

  } catch (error: any) {
    console.error("Cron Reminder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
