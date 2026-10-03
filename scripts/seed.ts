/**
 * Seed Supabase with demo shop, owner user, and sample data.
 * Run: npm run db:seed
 * Requires .env.local with SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL ?? "thegreatservicepoint@gmail.com";
const OWNER_PASSWORD = process.env.SEED_OWNER_PASSWORD ?? "Admin@12345";
const SHOP_NAME = "OMR'S GREAT SERVICE POINT";
const SHOP_ADDRESS =
  "OMR, Padur Roundana, Chengalpet District – 603103, (Opp-to Godrej Azure Apartment)";
const SHOP_PHONE = "+91 8610753386";

const shopProfile = {
  name: process.env.NEXT_PUBLIC_DEFAULT_SHOP_NAME ?? SHOP_NAME,
  tagline: "Bike Service & Repair",
  address: SHOP_ADDRESS,
  phone: SHOP_PHONE,
  email: OWNER_EMAIL,
  invoice_footer: `Thank you for choosing ${SHOP_NAME}.\nRide Safe! 🏍️`,
};

async function main() {
  const { data: existingShop } = await admin.from("shops").select("id").limit(1).maybeSingle();
  let shopId = existingShop?.id;

  if (!shopId) {
    const { data: shop, error } = await admin
      .from("shops")
      .insert({
        ...shopProfile,
        invoice_prefix: "INV",
        invoice_next_number: 1,
      })
      .select()
      .single();
    if (error) throw error;
    shopId = shop.id;
    console.log("Created shop:", shopId);
  } else {
    const { error } = await admin.from("shops").update(shopProfile).eq("id", shopId);
    if (error) throw error;
    console.log("Updated shop:", shopId);
  }

  let userId: string;
  const { data: list } = await admin.auth.admin.listUsers();
  const users = list?.users ?? [];
  const existing =
    users.find((u) => u.email === OWNER_EMAIL) ??
    users.find((u) => u.email === "owner@ridersgarage.com");
  if (existing) {
    userId = existing.id;
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) throw error;
    console.log("Updated owner login:", OWNER_EMAIL);
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: OWNER_EMAIL,
      password: OWNER_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Admin" },
    });
    if (error) throw error;
    userId = created.user.id;
    console.log("Created owner:", OWNER_EMAIL);
  }

  await admin.from("profiles").upsert({
    id: userId,
    shop_id: shopId,
    full_name: "Admin",
    role: "owner",
    phone: null,
  });

  const services = [
    { name: "Engine Oil Change", default_price: 350, estimated_minutes: 30 },
    { name: "Chain Cleaning & Lubrication", default_price: 250, estimated_minutes: 20 },
    { name: "Brake Service", default_price: 400, estimated_minutes: 45 },
    { name: "General Service", default_price: 800, estimated_minutes: 120 },
    { name: "Water Wash", default_price: 150, estimated_minutes: 15 },
    { name: "Puncture Repair", default_price: 100, estimated_minutes: 15 },
  ];

  for (const s of services) {
    const { data: ex } = await admin
      .from("services")
      .select("id")
      .eq("shop_id", shopId)
      .eq("name", s.name)
      .maybeSingle();
    if (!ex) {
      await admin.from("services").insert({ shop_id: shopId, ...s, status: "active" });
    }
  }

  const inventory = [
    { name: "Engine Oil", item_type: "spare_part", quantity: 10, selling_price: 450 },
    { name: "Brake Pad", item_type: "spare_part", quantity: 12, selling_price: 600 },
  ];
  for (const item of inventory) {
    const { data: ex } = await admin
      .from("inventory_items")
      .select("id")
      .eq("shop_id", shopId)
      .eq("name", item.name)
      .maybeSingle();
    if (!ex) {
      await admin.from("inventory_items").insert({ shop_id: shopId, ...item });
    }
  }

  const customers = [
    { name: "Rohit Sharma", phone: "9123456780", bike: "Royal Enfield Classic 350", reg: "MH 12 AB 1234" },
    { name: "Amit Verma", phone: "9123456781", bike: "Honda Activa 6G", reg: "KA 01 CD 5678" },
    { name: "Neha Patel", phone: "9123456782", bike: "Yamaha R15", reg: "GJ 05 EF 9012" },
  ];

  for (const c of customers) {
    let { data: cust } = await admin
      .from("customers")
      .select("id")
      .eq("shop_id", shopId)
      .eq("phone", c.phone)
      .maybeSingle();
    if (!cust) {
      const { data: nc } = await admin
        .from("customers")
        .insert({ shop_id: shopId, name: c.name, phone: c.phone })
        .select()
        .single();
      cust = nc;
    }
    if (cust) {
      const { data: bike } = await admin
        .from("bikes")
        .select("id")
        .eq("customer_id", cust.id)
        .eq("registration_number", c.reg)
        .maybeSingle();
      if (!bike) {
        await admin.from("bikes").insert({
          customer_id: cust.id,
          name: c.bike,
          registration_number: c.reg,
        });
      }
    }
  }

  const { count } = await admin
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", shopId);

  if ((count ?? 0) < 5) {
    const { data: cust } = await admin.from("customers").select("id, name, phone").eq("shop_id", shopId).limit(1).single();
    if (cust) {
      await admin.from("invoices").insert({
        shop_id: shopId,
        invoice_number: "INV-OCT-1",
        customer_id: cust.id,
        customer_name: cust.name,
        customer_phone: cust.phone,
        bike_name: "Royal Enfield Classic 350",
        bike_registration: "MH 12 AB 1234",
        invoice_date: new Date().toISOString().slice(0, 10),
        subtotal: 1200,
        total_amount: 1200,
        payment_method: "upi",
        payment_status: "paid",
        amount_paid: 1200,
        balance_due: 0,
      });
      await admin.from("activity_logs").insert({
        shop_id: shopId,
        message: "Invoice #INV-OCT-1 created",
      });
    }
  }

  console.log("\n--- Seed complete ---");
  console.log("Login ID: Admin");
  console.log("Login password:", OWNER_PASSWORD);
  console.log("Auth email:", OWNER_EMAIL);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
