import {
  Flex,
  FormControl,
  FormLabel,
  NumberInput,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
  Checkbox,
  NumberInputStepper,
  NumberInputField,
  VStack,
} from "@chakra-ui/react";

import type { Settings as SettingsType } from "../hooks/useSettings";

type SettingsProps = SettingsType & {
  hasNoLogs: boolean;
};

export function Settings({
  minKeystoneLevel,
  handleMinKeystoneLevelChange,
  showOnlyTimedKeys,
  toggleTimedKeysVisibility,
  hasNoLogs,
}: SettingsProps): JSX.Element {
  return (
    <Flex py={2} justifyContent="flex-end">
      <Flex flexDirection="column">
        <VStack alignItems="flex-end">
          <FormControl id="keystone-level" width="auto">
            <FormLabel>Min Keystone Level</FormLabel>

            <NumberInput
              name="keystone-level"
              value={minKeystoneLevel}
              min={15}
              onChange={hasNoLogs ? undefined : handleMinKeystoneLevelChange}
              isDisabled={hasNoLogs}
              size="sm"
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>

            <FormHelperText>
              The minimum keystone level to show (15+).
            </FormHelperText>
          </FormControl>

          <FormControl id="only-timed" width="auto">
            <Checkbox
              name="only-timed"
              checked={showOnlyTimedKeys}
              isDisabled={hasNoLogs}
              onChange={hasNoLogs ? undefined : toggleTimedKeysVisibility}
            >
              Show only timed keys
            </Checkbox>
          </FormControl>
        </VStack>
      </Flex>
    </Flex>
  );
}
