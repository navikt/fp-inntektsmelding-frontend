import { TextField, TextFieldProps } from "@navikt/ds-react";
import { useController, useFormContext, useWatch } from "react-hook-form";

import { formatStrengTilTall } from "~/utils.ts";

type FormattertTallTextFieldProps = TextFieldProps & {
  name: string;
  min?: number;
  max?: number;
  required?: boolean;
};

/** Et tekstfelt som formaterer innholdet til et tall med tusenvise mellomrom. */
export const FormattertTallTextField = ({
  name,
  min,
  max,
  required,
  ...rest
}: FormattertTallTextFieldProps) => {
  const { control } = useFormContext();
  const { field, fieldState } = useController({
    name,
    rules: {
      required: required ? "Må oppgis" : false,
      validate: (v) => {
        const asNumber = formatStrengTilTall(v);
        if (Number.isNaN(asNumber)) {
          return "Må være et tall";
        }

        // Backend aksepterer tall med maks 20 siffer. Velger MAX_SAFE_INTEGER som grense for å være under 20 siffer
        if (asNumber > Number.MAX_SAFE_INTEGER) {
          return "Beløpet er for stort";
        }

        if (asNumber < (min ?? -Infinity)) {
          return `Beløpet må være ${min} eller høyere`;
        }

        if (asNumber > (max ?? Infinity)) {
          return `Beløpet må være ${max} eller lavere`;
        }

        return true;
      },
    },
  });

  // NOTE: jeg forstår ikke helt hvorfor vi ikke kan bruke field.value som value til input.
  // Det fungerer i de fleste caser. Men ikke når verdien oppdateres et annet sted med setValue(). useWatch fungerer derimot som ønsket
  const watchedValue = useWatch({
    control,
    name,
  });

  return (
    <TextField
      {...rest}
      aria-label={field.value}
      autoComplete="off"
      error={fieldState.error?.message}
      onChange={(e) => {
        const value = e.target.value;
        const formattertTall = formatTall(value);
        // Remove spaces from the input value
        const tallUtenMellomrom = formattertTall.replaceAll(/\s+/g, "");
        field.onChange(tallUtenMellomrom);
      }}
      ref={field.ref}
      value={formatTall(watchedValue)}
    />
  );
};

/** Formatterer en inputverdi til et tall med tusenvise mellomrom.
 *
 * Om det ikke er et tall, returneres inputverdien.
 */
const formatTall = (value: string | undefined) => {
  if (value === "" || value === undefined) {
    return "";
  }

  const cleanValue = value.toString().replaceAll(/\s+/g, "");
  const hasTrailingComma = cleanValue.includes(",");

  // Parse to number
  const numberValue = formatStrengTilTall(cleanValue);

  if (Number.isNaN(numberValue)) {
    return value;
  }
  const formattedValue = new Intl.NumberFormat("nb-NO", {
    maximumFractionDigits: 2,
  }).format(numberValue);

  const formattedValueHasComma = formattedValue.includes(",");
  const shouldApplyTrailingComma = !formattedValueHasComma && hasTrailingComma;

  return shouldApplyTrailingComma ? `${formattedValue},` : formattedValue;
};
