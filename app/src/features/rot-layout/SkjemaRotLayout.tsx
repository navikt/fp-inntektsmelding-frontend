import { XMarkIcon } from "@navikt/aksel-icons";
import { Button, HStack } from "@navikt/ds-react";
import { setBreadcrumbs } from "@navikt/nav-dekoratoren-moduler";
import { Outlet, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";

import { RotLayout } from "~/features/rot-layout/RotLayout.tsx";
import { formatYtelsesnavn } from "~/utils.ts";

type SkjemaRotLayoutProps = {
  ytelse: string;
  organisasjonNavn?: string;
  organisasjonNummer?: string;
};
export const SkjemaRotLayout = (props: SkjemaRotLayoutProps) => {
  const location = useLocation();

  useEffect(() => {
    setBreadcrumbs([
      {
        title: "Min side – Arbeidsgiver",
        url: "/min-side-arbeidsgiver",
      },
      {
        title: "Inntektsmelding",
        url: location.pathname,
      },
    ]);
  }, []);

  const erPåKvitteringssiden = location.pathname.includes("kvittering");
  const skalViseUndertittel =
    props.organisasjonNavn && props.organisasjonNummer;
  return (
    <RotLayout
      background={erPåKvitteringssiden ? "bg-default" : "bg-subtle"}
      tittel={`Inntektsmelding ${formatYtelsesnavn(props.ytelse)}`}
      undertittel={
        skalViseUndertittel && (
          <div className="flex gap-3">
            <span>{props.organisasjonNavn}</span>
            <span aria-hidden="true">|</span>
            <span className="text-nowrap">
              Org.nr.: {props.organisasjonNummer}
            </span>
          </div>
        )
      }
    >
      <Outlet />
      {!erPåKvitteringssiden && (
        <HStack align="center" justify="center">
          <Button
            as="a"
            href="/min-side-arbeidsgiver"
            icon={<XMarkIcon />}
            variant="tertiary"
          >
            Avbryt
          </Button>
        </HStack>
      )}
    </RotLayout>
  );
};
