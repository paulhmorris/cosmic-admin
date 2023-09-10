import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import { prisma } from "~/db.server";

import { requireAdmin } from "~/session.server";

const validator = withZod(
  z.object({
    name: z.string().min(1, { message: "Name is required" }),
  })
);

export const action = async ({ request }: ActionArgs) => {
  await requireAdmin(request);

  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);

  const client = await prisma.client.create({ data: result.data });
  return redirect(`/clients/${client.id}`);
};

export default function NewClientPage() {
  return (
    <>
      <PageHeader title="New Client" />
      <ValidatedForm
        validator={validator}
        className="max-w-lg space-y-4"
        method="post"
      >
        <Input label="Name" id="name" name="name" type="text" required />
        <div className="flex flex-col gap-2 sm:flex-row">
          <SubmitButton>Create Client</SubmitButton>
          <Button variant="outline" type="reset">
            Reset
          </Button>
        </div>
      </ValidatedForm>
    </>
  );
}
