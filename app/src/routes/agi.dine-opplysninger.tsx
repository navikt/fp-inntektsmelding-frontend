import { createFileRoute } from "@tanstack/react-router";

import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";

export const Route = createFileRoute("/agi/dine-opplysninger")({
  component: RouteComponent,
});

function RouteComponent() {
  const a = useAgiOpplysninger();
  console.log(a);
  return <div>Dine opplysninger</div>;
}
