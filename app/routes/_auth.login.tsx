import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { z } from "zod";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { SubmitButton } from "~/components/ui/submit-button";
import { createUserSession, getUserId } from "~/server/session.server";
import { verifyLogin } from "~/server/user.server";
import { safeRedirect } from "~/utils";

const validator = withZod(
  z.object({
    email: z.string().min(1, { message: "Email is required" }).email(),
    password: z.string().min(8, { message: "Password must be 8 or more characters." }),
    remember: z.literal("on").optional(),
    redirectTo: z.string().optional(),
  }),
);

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request);
  if (userId) return redirect("/");
  return json({});
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const result = await validator.validate(await request.formData());

  if (result.error) return validationError(result.error);

  const { email, password, remember, redirectTo } = result.data;
  const user = await verifyLogin(email, password);

  if (!user) {
    return validationError(
      {
        fieldErrors: {
          email: "Email or password is incorrect",
        },
      },
      result.data,
    );
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: safeRedirect(redirectTo, "/"),
    remember: remember === "on" ? true : false,
  });
};

export const meta: MetaFunction = () => [{ title: "Login" }];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/leads";

  return (
    <div className="grid h-full place-items-center">
      <div className="max-w-lg px-8">
        <h1 className="text-4xl font-extrabold">Cosmic Labs Admin</h1>
        <ValidatedForm validator={validator} method="post" className="mt-4 space-y-3">
          <Input label="Email" id="email" name="email" type="email" autoComplete="email" required />
          <Input label="Password" id="password" name="password" type="password" autoComplete="current-password" required />

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" name="remember" />
              <Label htmlFor="remember">Remember me</Label>
            </div>
          </div>
          <SubmitButton className="w-full">Log in</SubmitButton>
        </ValidatedForm>
      </div>
    </div>
  );
}
