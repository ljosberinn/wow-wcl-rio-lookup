import { useToast } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

import type { MaybeCharacter } from "./useCharacterParams";

export function useMissingCharacterParamsToast({
  character,
  realm,
  region,
}: MaybeCharacter): void {
  const { push, isReady, isFallback } = useRouter();

  const toast = useToast({
    status: "error",
    description:
      "One or multiple parameters (region | realm | character) are missing.",
    title: "Missing parameters",
    isClosable: true,
    onCloseComplete: () => push("/"),
  });

  useEffect(() => {
    if (isReady && !isFallback && (!character || !region || !realm)) {
      toast();
    }
  }, [toast, isFallback, character, region, realm, isReady]);
}
