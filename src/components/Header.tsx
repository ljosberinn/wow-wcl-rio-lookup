import {
  chakra,
  Flex,
  Tag,
  Text,
  VStack,
  Button,
  Link,
  Box,
} from "@chakra-ui/react";
import Head from "next/head";
import NextLink from "next/link";

import type { MaybeCharacter } from "../hooks/useCharacterParams";
import { formatCharacter, capitalize } from "../utils/format";
import type { CharacterData } from "../utils/lookup";

type HeaderProps = CharacterData & MaybeCharacter;

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

  const title = formatCharacter({ character, realm, region });

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>

      <Box pb={2}>
        <NextLink passHref href="/">
          <Link as={Button} _hover={{ textDecoration: "none" }}>
            Back
          </Link>
        </NextLink>
      </Box>

      <Flex justifyContent="space-between">
        <chakra.img loading="lazy" src={thumbnail_url} alt={character} />

        <Flex flexDirection="column" textAlign="center">
          <Text fontSize="xl" fontWeight="bold">
            {title}
          </Text>
          <Text>
            {race} {active_spec_name} {className}
          </Text>
        </Flex>

        <VStack alignItems="flex-end">
          <Tag colorScheme="green">
            Highest RIO: {mythic_plus_scores.all.toLocaleString()}
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
    </>
  );
}
