import { useRouter } from "next/router";

export type MaybeCharacter = {
  region?: string;
  realm?: string;
  character?: string;
};

export function useCharacterParams(
  staticCharacter?: Required<MaybeCharacter>
): MaybeCharacter {
  const { query } = useRouter();

  if (staticCharacter) {
    return staticCharacter;
  }

  const { region, realm, character } = query;

  if (
    Array.isArray(region) ||
    Array.isArray(character) ||
    Array.isArray(realm)
  ) {
    return {
      region: undefined,
      realm: undefined,
      character: undefined,
    };
  }

  return {
    region,
    realm,
    character,
  };
}
