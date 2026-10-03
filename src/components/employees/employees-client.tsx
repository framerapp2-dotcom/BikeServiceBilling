"use client";

import { createEmployee, recordSalary } from "@/app/actions/employees";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/providers/toast-provider";
import { formatINR } from "@/lib/utils";
import { useState } from "react";

export function EmployeesClient({
  employees,
  salaries,
  salaryMonth,
}: {
  employees: { id: string; name: string; role: string; monthly_salary: number; phone: string | null }[];
  salaries: { employee_id: string; net_salary: number; payment_status: string }[];
  salaryMonth: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "mechanic",
    monthly_salary: "",
    joining_date: "",
  });

  const save = async () => {
    const res = await createEmployee({
      ...form,
      monthly_salary: Number(form.monthly_salary) || 0,
    });
    if (res.error) toast(res.error, "error");
    else {
      toast("Employee added");
      setOpen(false);
      window.location.reload();
    }
  };

  const paySalary = async (emp: { id: string; monthly_salary: number }) => {
    const res = await recordSalary({
      employee_id: emp.id,
      salary_month: salaryMonth,
      base_salary: Number(emp.monthly_salary),
      payment_status: "paid",
    });
    if (res.error) toast(res.error, "error");
    else {
      toast("Salary recorded");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold dark:text-slate-100">Employees</h2>
        <Button onClick={() => setOpen(true)}>Add Employee</Button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {employees.map((e) => {
          const sal = salaries.find((s) => s.employee_id === e.id);
          return (
            <Card key={e.id}>
              <h3 className="font-semibold">{e.name}</h3>
              <p className="text-sm capitalize text-foreground-muted">{e.role}</p>
              <p className="mt-2 text-accent font-bold">{formatINR(Number(e.monthly_salary))}/mo</p>
              <p className="text-xs mt-1">
                This month: {sal ? `${formatINR(Number(sal.net_salary))} (${sal.payment_status})` : "Not recorded"}
              </p>
              {!sal && (
                <Button size="sm" className="mt-3" onClick={() => paySalary(e)}>
                  Record salary (paid)
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Employee">
        <div className="space-y-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Select label="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} options={[
            { value: "mechanic", label: "Mechanic" },
            { value: "helper", label: "Helper" },
            { value: "manager", label: "Manager" },
            { value: "other", label: "Other" },
          ]} />
          <Input label="Monthly Salary" inputMode="decimal" value={form.monthly_salary} onChange={(e) => setForm({ ...form, monthly_salary: e.target.value.replace(/[^\d.]/g, "") })} />
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </Modal>
    </div>
  );
}
