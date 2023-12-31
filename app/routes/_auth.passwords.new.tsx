import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { SubmitButton } from "~/components/ui/submit-button";
import { expirePasswordReset, getPasswordResetByToken } from "~/server/password_reset.server";
import { toast } from "~/server/toast.server";
import { getUserById, resetUserPassword, verifyLogin } from "~/server/user.server";
import { getSearchParam } from "~/utils";

const validator = withZod(
  z
    .object({
      token: z.string(),
      oldPassword: z.string().min(8, "Password must be at least 8 characters"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmation: z.string().min(8, "Password must be at least 8 characters"),
    })
    .superRefine(({ newPassword, confirmation }, ctx) => {
      if (newPassword !== confirmation) {
        ctx.addIssue({
          code: "custom",
          message: "Passwords must match",
          path: ["confirmation"],
        });
      }
    }),
);

export async function loader({ request }: LoaderFunctionArgs) {
  const token = getSearchParam("token", request);
  if (!token) {
    return redirect("/");
  }

  const reset = await getPasswordResetByToken({ token });
  if (!reset) {
    return redirect("/");
  }

  if (reset.expiresAt < new Date()) {
    return redirect("/");
  }

  return json({});
}

export async function action({ request }: ActionFunctionArgs) {
  const tokenParam = getSearchParam("token", request);

  // Validate form
  const result = await validator.validate(await request.formData());
  if (result.error) return validationError(result.error);

  const { oldPassword, newPassword, token } = result.data;
  const reset = await getPasswordResetByToken({ token });
  if (!reset) {
    return toast.json(request, {}, { variant: "destructive", title: "Token not found", description: "Please try again." });
  }

  // Check expiration
  if (reset.expiresAt < new Date()) {
    return toast.json(request, {}, { variant: "destructive", title: "Token expired", description: "Please try again." });
  }

  // Check token against param
  if (token !== tokenParam) {
    return toast.json(request, { success: false }, { variant: "destructive", title: "Invalid token", description: "Please try again." });
  }

  // Check user
  const userFromToken = await getUserById(reset.userId);
  if (!userFromToken) {
    return toast.json(request, { success: false }, { variant: "destructive", title: "User not found", description: "Please try again." });
  }

  // Check old password is correct
  const user = await verifyLogin(userFromToken.email, oldPassword);
  if (!user) {
    return validationError({
      fieldErrors: {
        oldPassword: "Incorrect password",
      },
    });
  }

  // Reset password
  await resetUserPassword({ userId: user.id, password: newPassword });

  // Use token
  await expirePasswordReset({ token });

  return toast.redirect(request, "/", {
    variant: "default",
    title: "Password reset",
    description: "Your password has been reset.",
  });
}

export default function NewPassword() {
  const [searchParams] = useSearchParams();

  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-lg px-8">
        <h1 className="text-4xl font-extrabold">Set a new password.</h1>
        <ValidatedForm validator={validator} method="post" className="mt-4 space-y-3">
          <input type="hidden" name="token" value={searchParams.get("token") ?? ""} />
          <Input label="Old password" name="oldPassword" type="password" autoComplete="current-password" required />
          <Input label="New Password" name="newPassword" type="password" autoComplete="new-password" required />
          <Input label="Confirm New Password" name="confirmation" type="password" autoComplete="new-password" required />
          <SubmitButton>Reset Password</SubmitButton>
        </ValidatedForm>
      </div>
    </div>
  );
}
