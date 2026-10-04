import { getShopId } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EmployeesClient } from "@/components/employees/employees-client";
import { kolkataToday } from "@/lib/utils";

export default async function EmployeesPage() {
  const supabase = await createClient();
  const shopId = await getShopId();
  const month = `${kolkataToday().slice(0, 7)}-01`;
  const [employeesRes, salariesRes] = await Promise.all([
    supabase.from("employees").select("*").eq("shop_id", shopId).order("name"),
    supabase
      .from("employee_salaries")
      .select("*")
      .eq("shop_id", shopId)
      .eq("salary_month", month),
  ]);
  const employees = employeesRes.data ?? [];
  const activeEmployees = employees.filter((employee) => employee.status !== "inactive");
  const archivedEmployees = employees.filter((employee) => employee.status === "inactive");
  const salaries = salariesRes.data;
  return (
    <EmployeesClient
      employees={activeEmployees}
      archivedEmployees={archivedEmployees}
      salaries={salaries ?? []}
      salaryMonth={month}
    />
  );
}
