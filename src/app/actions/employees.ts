"use server";

import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createEmployee(data: {
  name: string;
  phone?: string;
  role: string;
  joining_date?: string;
  monthly_salary: number;
}) {
  if (!data.name.trim()) return { error: "Name is required" };
  if (data.monthly_salary < 0) return { error: "Salary cannot be negative" };
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase.from("employees").insert({
    shop_id: shopId,
    name: data.name.trim(),
    phone: data.phone?.trim() || null,
    role: data.role || "mechanic",
    monthly_salary: Number(data.monthly_salary) || 0,
    joining_date: data.joining_date?.trim() || null,
  });
  if (error) return { error: "Unable to save employee" };
  revalidatePath("/app/employees");
  return { success: true };
}

export async function archiveEmployee(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase
    .from("employees")
    .update({ status: "inactive" })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) return { error: "Unable to archive employee" };
  revalidatePath("/app/employees");
  return { success: true };
}

export async function restoreEmployee(id: string) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const { error } = await supabase
    .from("employees")
    .update({ status: "active" })
    .eq("id", id)
    .eq("shop_id", shopId);
  if (error) return { error: "Unable to restore employee" };
  revalidatePath("/app/employees");
  return { success: true };
}

export async function recordSalary(data: {
  employee_id: string;
  salary_month: string;
  base_salary: number;
  bonus?: number;
  deduction?: number;
  payment_status: string;
}) {
  const supabase = await createClient();
  const shopId = await getShopId();
  const bonus = data.bonus ?? 0;
  const deduction = data.deduction ?? 0;
  const net = data.base_salary + bonus - deduction;
  const { error } = await supabase.from("employee_salaries").upsert(
    {
      employee_id: data.employee_id,
      shop_id: shopId,
      salary_month: data.salary_month,
      base_salary: data.base_salary,
      bonus,
      deduction,
      net_salary: net,
      payment_status: data.payment_status,
      paid_at: data.payment_status === "paid" ? new Date().toISOString() : null,
    },
    { onConflict: "employee_id,salary_month" }
  );
  if (error) return { error: "Unable to save salary record" };
  revalidatePath("/app/employees");
  revalidatePath("/app/dashboard");
  return { success: true };
}
