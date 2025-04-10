import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Button } from "primereact/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { employeeSchema, type Employee } from "~/models/employee";
import ErrorMessage from "./ErrorMessage";
import db from "~/utils/db";

export default function EmployeeForm({
  employee,
  onSaveFinished,
  onCancel,
}: {
  employee?: Employee;
  onSaveFinished: () => void;
  onCancel: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Employee>({
    defaultValues: employee,
    resolver: zodResolver(employeeSchema),
  });

  const save = async (data: Employee) => {
    employee
      ? await db.employees.update(employee.id!, data)
      : await db.employees.add(data);
    onSaveFinished();
  };

  return <form className="flex flex-col gap-4" onSubmit={handleSubmit(save)}>
    <FloatLabel className="w-full mt-6">
      <InputText {...register("name")} id="name" className="w-full" invalid={!!errors.name} />
      <label htmlFor="name" className="p-label">Name</label>
      <ErrorMessage errors={errors} name="name" />
    </FloatLabel>

    <div className="flex flex-row gap-4">
      <Button label="Save" icon="pi pi-check" />
      <Button label="Cancel" icon="pi pi-times" severity="secondary" type="button" onClick={onCancel} />
    </div>
  </form>;
}
