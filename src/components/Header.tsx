import { chakra, Flex, Tag, Text, VStack } from "@chakra-ui/react";

import type { CharacterData } from "../hooks/useCharacter";
import type { MaybeCharacter } from "../hooks/useCharacterParams";

type HeaderProps = CharacterData & MaybeCharacter;

const capitalize = (str: string) =>
  str.slice(0, 1).toUpperCase() + str.slice(1);

export function Header({
  thumbnail_url,
  class: className,
  race,
  mythic_plus_scores,
  active_spec_name,
  character = "",
  realm = "",
  region = "",
  active_spec_role,
}: HeaderProps): JSX.Element {
  const relevantScores = {
    dps: mythic_plus_scores.dps,
    healer: mythic_plus_scores.healer,
    tank: mythic_plus_scores.tank,
  };

  return (
    <Flex justifyContent="space-between">
      <chakra.img loading="lazy" src={thumbnail_url} alt={character} />

      <Flex flexDirection="column" textAlign="center">
        <Text fontSize="xl" fontWeight="bold">
          {capitalize(character)} @ {capitalize(realm)}-{region.toUpperCase()}
        </Text>
        <Text>
          {active_spec_name} {race} {className}
        </Text>
      </Flex>

      <VStack alignItems="flex-end">
        <Tag colorScheme="green">
          Highest RIO:{mythic_plus_scores.all.toLocaleString()}
        </Tag>
        {Object.entries(relevantScores)
          .filter(([, score]) => score !== 0)
          .map(([role, score]) => (
            <Tag
              colorScheme={
                role === active_spec_role.toLowerCase() ? "teal" : undefined
              }
              key={role}
            >
              {capitalize(role)}: {score.toLocaleString()}
            </Tag>
          ))}
      </VStack>
    </Flex>
  );
}
