import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { IconPlus } from "@tabler/icons-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { ClientsTable } from "~/components/clients/clients-table";
import { PageHeader } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import { prisma } from "~/server/db.server";
import { requireUser } from "~/server/session.server";

export const meta: MetaFunction = () => [{ title: "Clients • Cosmic Labs" }];

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUser(request, ["SUPER_ADMIN"]);
  const clients = await prisma.client.findMany({ orderBy: { createdAt: "desc" } });
  return typedjson({ clients });
}

export default function ClientIndexPage() {
  const { clients } = useTypedLoaderData<typeof loader>();

  return (
    <>
      <PageHeader title="Clients">
        <Button asChild className="w-min">
          <Link to="/clients/new" className="flex items-center gap-2">
            <IconPlus className="h-5 w-5" />
            <span>New Client</span>
          </Link>
        </Button>
      </PageHeader>
      <ClientsTable clients={clients} />
    </>
  );
}
