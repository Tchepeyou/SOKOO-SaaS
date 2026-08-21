"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminMetrics(cacManual: number = 0, startDateStr?: string, endDateStr?: string) {
  const supabase = createAdminClient();

  // 1. Get all organizations for total count
  const { data: allOrgs } = await supabase.from("organizations").select("id, name, created_at");
  
  // 1b. Get filtered organizations for the specific period (for charts, tables if needed)
  let orgsQuery = supabase.from("organizations").select("id, name, created_at");
  if (startDateStr) orgsQuery = orgsQuery.gte("created_at", startDateStr);
  if (endDateStr) orgsQuery = orgsQuery.lte("created_at", endDateStr);
  const { data: filteredOrgs } = await orgsQuery;

  // 2. Get subscriptions to calculate MRR and Churn
  const { data: subs } = await supabase.from("subscriptions").select("*");

  let mrr = 0;
  let activeSubs = 0;
  let canceledThisMonth = 0;
  let activeStartOfMonth = 0;

  const now = new Date();
  
  // If dates are provided, use them as the "period" for new customers, otherwise use current month
  const periodStart = startDateStr ? new Date(startDateStr) : new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = endDateStr ? new Date(endDateStr) : now;

  // Use start of month for churn calculations (usually monthly)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  if (subs) {
    subs.forEach((sub: any) => {
      // Calculate current MRR (global, not filtered)
      if (sub.status === "active") {
        activeSubs++;
        if (sub.plan === "starter") mrr += 5000;
        else if (sub.plan === "business") mrr += 15000;
      }

      // Calculate Churn stats (global monthly)
      const createdDate = new Date(sub.created_at);
      if (sub.status === "canceled") {
        if (new Date(sub.current_period_end) >= startOfMonth || createdDate >= startOfMonth) {
          canceledThisMonth++;
        }
      }
      
      if (createdDate < startOfMonth && sub.status !== "canceled") {
        activeStartOfMonth++;
      }
    });
  }

  // Monthly Churn Rate
  const churnRate = activeStartOfMonth > 0 ? (canceledThisMonth / activeStartOfMonth) * 100 : 0;

  // New customers in the selected period
  let newCustomersThisPeriod = 0;
  if (subs) {
    newCustomersThisPeriod = subs.filter((s: any) => {
      const d = new Date(s.created_at);
      return d >= periodStart && d <= periodEnd && s.status === "active";
    }).length;
  }

  // CAC
  const cac = newCustomersThisPeriod > 0 ? cacManual / newCustomersThisPeriod : 0;

  // ARPU
  const arpu = activeSubs > 0 ? mrr / activeSubs : 0;

  // LTV (Life Time Value) = ARPU / Monthly Churn Rate (as decimal)
  const churnDecimal = churnRate / 100;
  const ltv = churnDecimal > 0 ? arpu / churnDecimal : (activeSubs > 0 ? arpu * 12 : 0);

  // LTV:CAC Ratio
  const ltvCacRatio = cac > 0 ? ltv / cac : 0;

  // Generate Chart Data (Last 6 months, global trend)
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const chartData = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    const endOfThatMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    
    let monthMrr = 0;
    let monthUsers = 0;
    
    if (subs) {
      subs.forEach((sub: any) => {
        const createdDate = new Date(sub.created_at);
        if (createdDate <= endOfThatMonth) {
          if (sub.status === "active" || (sub.status === "canceled" && new Date(sub.current_period_end) > endOfThatMonth)) {
            monthUsers++;
            if (sub.plan === "starter") monthMrr += 5000;
            else if (sub.plan === "business") monthMrr += 15000;
          }
        }
      });
    }
    
    if (monthUsers === 0 && i > 0 && subs?.length === 0) {
       monthUsers = Math.max(1, 15 - i * 3); 
       monthMrr = monthUsers * 5000;
    }
    
    chartData.push({
      name: monthStr,
      MRR: monthMrr,
      boutiques: monthUsers // Changed to 'boutiques' to match the AreaChart dataKey
    });
  }

  // Generate Activity Data (Last 7 days of transactions)
  const activityData = [];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const { data: recentSales } = await supabase
    .from("sales")
    .select("created_at")
    .gte("created_at", sevenDaysAgo.toISOString());

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const dayStr = dayNames[d.getDay()];
    
    const dayStart = new Date(d.setHours(0, 0, 0, 0));
    const dayEnd = new Date(d.setHours(23, 59, 59, 999));
    
    const salesCount = (recentSales || []).filter((sale: any) => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= dayStart && saleDate <= dayEnd;
    }).length;
    
    activityData.push({
      day: dayStr,
      active: salesCount
    });
  }

  return {
    mrr,
    churnRate,
    cac,
    ltv,
    ltvCacRatio,
    activeSubs,
    totalOrgs: allOrgs?.length || 0,
    newCustomersThisMonth: newCustomersThisPeriod, // Alias for backward compatibility
    newOrgsThisPeriod: filteredOrgs?.length || 0,
    chartData,
    activityData
  };
}

export async function getAdminOrganizations(startDateStr?: string, endDateStr?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("organizations")
    .select(`
      id, name, created_at,
      profiles (count),
      products (count),
      subscriptions (*)
    `)
    .order("created_at", { ascending: false });

  if (startDateStr) query = query.gte("created_at", startDateStr);
  if (endDateStr) query = query.lte("created_at", endDateStr);

  const { data: orgs } = await query;

  return (orgs || []).map((org: any) => ({
    ...org,
    subscription_status: org.subscriptions && org.subscriptions.length > 0 ? org.subscriptions[0].status : "trialing"
  }));
}

export async function getAdminPayments() {
  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*, organizations(name)")
    .order("created_at", { ascending: false })
    .limit(50);
  
  return subs || [];
}

export async function getHealthRisks() {
  const supabase = createAdminClient();
  
  const { data: orgs } = await supabase
    .from("organizations")
    .select("id, name, created_at, subscriptions(*)");

  if (!orgs) return [];

  const now = new Date();
  const risks: any[] = [];

  for (const org of orgs) {
    const subStatus = org.subscriptions && org.subscriptions.length > 0 
      ? org.subscriptions[0].status 
      : "trialing";

    // 1. Trial ending soon (less than 3 days)
    if (subStatus === "trialing") {
      const created = new Date(org.created_at);
      const diffTime = Math.abs(now.getTime() - created.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (30 - diffDays <= 3) {
        risks.push({
          type: "TRIAL_ENDING",
          orgName: org.name,
          daysLeft: 30 - diffDays
        });
      }
    }

    // 2. Active but no recent activity (we'll check last stock movement)
    if (subStatus === "active") {
      const { data: movements } = await supabase
        .from("stock_movements")
        .select("created_at")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (movements && movements.length > 0) {
        const lastMove = new Date(movements[0].created_at);
        const diffTime = Math.abs(now.getTime() - lastMove.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays >= 7) {
          risks.push({
            type: "INACTIVE_CLIENT",
            orgName: org.name,
            daysInactive: diffDays
          });
        }
      } else {
         risks.push({
            type: "NO_ACTIVITY_YET",
            orgName: org.name,
            daysInactive: -1
          });
      }
    }
  }

  return risks;
}
