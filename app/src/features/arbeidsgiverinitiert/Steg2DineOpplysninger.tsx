import { useNavigate } from "@tanstack/react-router";
import { FormProvider, useForm } from "react-hook-form";

import { useAgiSkjema } from "~/features/arbeidsgiverinitiert/AgiSkjemaState.tsx";
import { useAgiOpplysninger } from "~/features/arbeidsgiverinitiert/useAgiOpplysninger.tsx";
import {
  KontaktInformasjon,
  PersonOgSelskapsInformasjonForm,
} from "~/features/skjema-moduler/KontaktInformasjon.tsx";
import { formatYtelsesnavn, lagFulltNavn } from "~/utils";

import { useDocumentTitle } from "../useDocumentTitle";

export const Steg2DineOpplysninger = () => {
  const opplysninger = useAgiOpplysninger();
  useDocumentTitle(
    `Dine opplysninger – inntektsmelding for ${formatYtelsesnavn(opplysninger.ytelse)}`,
  );
  const { agiSkjemaState, setAgiSkjemaState } = useAgiSkjema();

  const innsenderNavn = lagFulltNavn(opplysninger.innsender);

  const methods = useForm<PersonOgSelskapsInformasjonForm>({
    defaultValues: {
      ...(agiSkjemaState.kontaktperson ?? {
        navn: innsenderNavn,
        telefonnummer: opplysninger.innsender.telefon,
      }),
    },
  });
  const navigate = useNavigate();

  const onSubmit = methods.handleSubmit((kontaktperson) => {
    setAgiSkjemaState((prev) => ({ ...prev, kontaktperson }));
    navigate({
      from: "/agi/dine-opplysninger",
      to: "/agi/refusjon",
      search: true,
    });
  });

  return (
    <section className="mt-2">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <KontaktInformasjon opplysninger={opplysninger} />
        </form>
      </FormProvider>
    </section>
  );
};
