export const capitalize = (str: string): string =>
  str.slice(0, 1).toUpperCase() + str.slice(1);

export const formatCharacter = ({
  region,
  realm,
  character,
}: Record<string, string>): string =>
  `${capitalize(character)} @ ${capitalize(realm)}-${region.toUpperCase()}`;
