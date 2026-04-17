import { useCallback, useState } from "react";

/**
 * Hook for å styre om noe vises eller skjules – som en modal, endringspanel eller annet.
 *
 * ```tsx
 * const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
 * ```
 */
export function useDisclosure(defaultOpen = false) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, onOpen, onClose, onToggle };
}
