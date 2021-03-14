import type { NumberInputProps } from "@chakra-ui/number-input";
import { useState } from "react";

export type Settings = {
  minKeystoneLevel: number;
  handleMinKeystoneLevelChange: NumberInputProps["onChange"];
  toggleTimedKeysVisibility: () => void;
  showOnlyTimedKeys: boolean;
};

export function useSettings(): Settings {
  const [minKeystoneLevel, setMinKeystoneLevel] = useState(15);
  const [showOnlyTimedKeys, setShowOnlyTimedKeys] = useState(false);

  function handleMinKeystoneLevelChange(_: string, number: number) {
    setMinKeystoneLevel(number);
  }

  function toggleTimedKeysVisibility() {
    setShowOnlyTimedKeys(!showOnlyTimedKeys);
  }

  return {
    handleMinKeystoneLevelChange,
    toggleTimedKeysVisibility,
    minKeystoneLevel,
    showOnlyTimedKeys,
  };
}
