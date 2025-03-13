import { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import { hentGrunnbeløpOptions } from "~/api/queries.ts";
import { GenerellFeilside } from "~/features/error-boundary/GenerellFeilside";
import { VisHjelpeteksterStateProvider } from "~/features/Hjelpetekst.tsx";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  loader: ({ context }) => {
    // Bruker prefetch for å ikke vente på dette nettverkskallet, men gjøre det klar i cache så fort som mulig
    context.queryClient.prefetchQuery(hentGrunnbeløpOptions());
  },
  errorComponent: GenerellFeilside,

  component: () => {
    return (
      <VisHjelpeteksterStateProvider>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </VisHjelpeteksterStateProvider>
    );
  },
});
