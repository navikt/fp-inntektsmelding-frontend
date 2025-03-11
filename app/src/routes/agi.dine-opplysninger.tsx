import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/agi/dine-opplysninger")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Dine opplysninger</div>;
}
