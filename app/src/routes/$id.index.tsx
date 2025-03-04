import { createFileRoute, getRouteApi, Navigate } from "@tanstack/react-router";

const route = getRouteApi("/$id");

export const Route = createFileRoute("/$id/")({
  component: () => {
    const params = route.useParams();
    const { eksisterendeInntektsmeldinger } = route.useLoaderData();
    if (eksisterendeInntektsmeldinger[0] === undefined) {
      return <Navigate params={params} replace to={"/$id/dine-opplysninger"} />;
    }

    return <Navigate params={params} replace to={"/$id/vis"} />;
  },
});
