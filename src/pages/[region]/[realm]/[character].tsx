import {
  Spinner,
  Tab,
  TabList,
  TabPanels,
  Tabs,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  TabPanel,
  Divider,
} from "@chakra-ui/react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { Header } from "../../../components/Header";

import { KeystoneTable } from "../../../components/KeystoneTable";
import { Settings } from "../../../components/Settings";
import { useCharacter } from "../../../hooks/useCharacter";
import type { MaybeCharacter } from "../../../hooks/useCharacterParams";
import { useCharacterParams } from "../../../hooks/useCharacterParams";
import { useMissingCharacterParamsToast } from "../../../hooks/useMissingCharacterParamsToast";
import { useSettings } from "../../../hooks/useSettings";
import { dungeons } from "../../../utils/dungeons";

type CharacterProps = Required<MaybeCharacter>;

export default function Character(props: CharacterProps): JSX.Element {
  const characterParams = useCharacterParams(props);
  useMissingCharacterParamsToast(characterParams);

  const { isFallback } = useRouter();
  const data = useCharacter(characterParams);
  const settings = useSettings();

  if (isFallback || !data) {
    return <Spinner />;
  }

  const hasNoLogs = data.wclData.every(([, report]) => report.length === 0);

  return (
    <>
      <Header {...data} {...characterParams} />

      <Settings {...settings} hasNoLogs={hasNoLogs} />

      <Tabs isLazy>
        <TabList>
          {dungeons.map((dungeon) => {
            const hasLogsForThisDungeon = data
              ? !!data.wclData.find(([id]) => id === dungeon.id)?.[1].length
              : false;

            return (
              <Tab
                key={dungeon.id}
                opacity={hasNoLogs || !hasLogsForThisDungeon ? 0.4 : 1}
              >
                {dungeon.slug}
              </Tab>
            );
          })}
        </TabList>
        <TabPanels>
          {hasNoLogs ? (
            <Alert status="error" mt={4}>
              <AlertIcon />
              <AlertTitle mr={2}>No logs found!</AlertTitle>
              <AlertDescription>
                This character does not have any Mythic+ Logs.
              </AlertDescription>
            </Alert>
          ) : (
            data.wclData.map(([dungeonID, reports]) => {
              const relevantReports = reports.filter((report) => {
                const isMinKeyLevel =
                  report.keyLevel >= settings.minKeystoneLevel;

                return settings.showOnlyTimedKeys
                  ? report.inTime > 0 && isMinKeyLevel
                  : isMinKeyLevel;
              });

              return (
                <TabPanel key={dungeonID}>
                  <KeystoneTable reports={relevantReports} />
                </TabPanel>
              );
            })
          )}
        </TabPanels>
      </Tabs>
    </>
  );
}

export const getStaticPaths: GetStaticPaths<CharacterProps> = async () => {
  return {
    fallback: true,
    paths: [
      {
        params: {
          realm: "blackmoore",
          region: "eu",
          character: "xepheris",
        },
      },
    ],
  };
};

type ExpectedUrlParams = Required<MaybeCharacter>;

export const getStaticProps: GetStaticProps<
  CharacterProps,
  ExpectedUrlParams
> = async (context) => {
  if (
    !context.params?.region ||
    !context.params.realm ||
    !context.params.character
  ) {
    throw new Error("incorrect getStaticProps");
  }

  const { region, realm, character } = context.params;

  return {
    props: {
      realm,
      character,
      region,
    },
    revalidate: 60 * 60 * 4,
  };
};
