import {
  Text,
  Divider,
  Link,
  Flex,
  CloseButton,
  HStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { useState } from "react";

import { formatCharacter } from "../utils/format";
import { getHistory, removeFromStorageHistory } from "../utils/localStorage";

export function SearchHistory(): JSX.Element | null {
  const [history, setHistory] = useState(getHistory);

  if (history.length === 0) {
    return null;
  }

  return (
    <>
      <Divider my={2} />
      <Text fontWeight="bold" pb={2}>
        Search History
      </Text>
      {history.map(({ region, realm, name: character }, index) => (
        <Flex key={region + realm + character}>
          <HStack>
            <NextLink passHref href={`/${region}/${realm}/${character}`}>
              <Link>{formatCharacter({ region, realm, character })}</Link>
            </NextLink>
            <CloseButton
              size="sm"
              onClick={() => {
                setHistory((prev) => prev.filter((_, idx) => idx !== index));
                removeFromStorageHistory(index);
              }}
            />
          </HStack>
        </Flex>
      ))}
    </>
  );
}
