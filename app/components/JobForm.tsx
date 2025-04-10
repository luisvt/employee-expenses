import { zodResolver } from "@hookform/resolvers/zod";
import { FloatLabel } from "primereact/floatlabel";
import { InputText } from "primereact/inputtext";
import { jobSchema, type Job } from "~/models/job";
import db from "~/utils/db";
import ErrorMessage from "./ErrorMessage";
import { Button } from "primereact/button";
import { useForm } from "react-hook-form";

export default function JobForm({
  job,
  hideDialog,
}: {
  job?: Job;
  hideDialog: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<Job>({
    defaultValues: job,
    resolver: zodResolver(jobSchema),
  });

  const save = async (data: Job) => {
    job
      ? await db.jobs.update(job.id!, data)
      : await db.jobs.add(data);
    hideDialog();
  };

  return <form className="flex flex-col gap-6" onSubmit={handleSubmit(save)}>
    <FloatLabel className="w-full mt-6">
      <InputText {...register("number")} id="number" className="w-full" invalid={!!errors.number} />
      <label htmlFor="number" className="p-label">Number</label>
      <ErrorMessage errors={errors} name="number" />
    </FloatLabel>

    <FloatLabel className="w-full">
      <InputText {...register("name")} id="name" className="w-full" invalid={!!errors.name} />
      <label htmlFor="name" className="p-label">Name</label>
      <ErrorMessage errors={errors} name="name" />
    </FloatLabel>

    <FloatLabel className="w-full">
      <InputText {...register("costCode")} id="costCode" className="w-full" invalid={!!errors.costCode} />
      <label htmlFor="costCode" className="p-label">Cost Code</label>
      <ErrorMessage errors={errors} name="costCode" />
    </FloatLabel>

    <div className="flex flex-row gap-4">
      <Button label="Save" icon="pi pi-check" />
      <Button label="Cancel" icon="pi pi-times" severity="secondary" type="button" onClick={hideDialog} />
    </div>
  </form>;
}
