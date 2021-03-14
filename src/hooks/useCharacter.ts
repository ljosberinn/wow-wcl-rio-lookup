/* eslint-disable promise/prefer-await-to-then */
import { useState, useEffect } from "react";

import type { SanitizedWclData, PartialRioResponse } from "../pages/api/lookup";
import type { MaybeCharacter } from "./useCharacterParams";

export type CharacterData = PartialRioResponse & {
  wclData: SanitizedWclData[];
};

export function useCharacter({
  region,
  realm,
  character,
}: MaybeCharacter): CharacterData | null {
  const [data, setData] = useState<CharacterData | null>(null);

  useEffect(() => {
    if (region && realm && character) {
      const endpoint = "/api/lookup";
      const searchParams = new URLSearchParams({
        region,
        realm,
        character,
      }).toString();
      const url = `${endpoint}?${searchParams}`;

      fetch(url)
        .then((response) => response.json())
        .then(setData)
        // eslint-disable-next-line no-console
        .catch(console.error);
    }
  }, [region, realm, character]);

  return data;
}
