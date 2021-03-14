import { Icon, HStack } from "@chakra-ui/react";
import React from "react";
import { GiOpenChest, GiLockedChest } from "react-icons/gi";

import type { SanitizedWclDataset } from "../utils/lookup";

const chests = Array.from({ length: 3 });

type ChestsProps = Pick<SanitizedWclDataset, "inTime">;

export function Chests({ inTime }: ChestsProps): JSX.Element {
  return (
    <HStack spacing={1}>
      {chests.map((_, index) => {
        const color =
          inTime === 0 ? "grey" : inTime >= index + 1 ? "green.300" : undefined;
        const opacity = color ? 1 : 0.3;
        const icon = inTime >= index + 1 ? GiOpenChest : GiLockedChest;

        return (
          <Icon
            as={icon}
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            color={color}
            opacity={opacity}
          />
        );
      })}
    </HStack>
  );
}
