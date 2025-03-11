import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/agi/")({
  component: RouteComponent,
});

/**
 * Landingsside fra Min side arbeidsgiver.
 * Istedenfor å lande direkte på "/agi/opprett" så lander vi her slik at vi selv er fleksible til å endre stier som vi måtte ønske.
 */
function RouteComponent() {
  return <Navigate from="/agi" search={true} to="/agi/opprett" />;
}
