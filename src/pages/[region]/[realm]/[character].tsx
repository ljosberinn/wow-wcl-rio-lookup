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
} from "@chakra-ui/react";
import type { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";

import dummyData from "../../../../devData.json";
import { Header } from "../../../components/Header";
import { KeystoneTable } from "../../../components/KeystoneTable";
import { Settings } from "../../../components/Settings";
import type { MaybeCharacter } from "../../../hooks/useCharacterParams";
import { useMissingCharacterParamsToast } from "../../../hooks/useMissingCharacterParamsToast";
import { useSettings } from "../../../hooks/useSettings";
import { dungeons } from "../../../utils/dungeons";
import type { CharacterData } from "../../../utils/lookup";
import { lookup } from "../../../utils/lookup";

type CharacterProps = {
  lastSync: number;
  characterParams: Required<MaybeCharacter>;
  data: CharacterData | null;
};

export default function Character({
  data,
  characterParams,
  lastSync,
}: CharacterProps): JSX.Element {
  useMissingCharacterParamsToast(characterParams);
  const { isFallback } = useRouter();
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
            <Alert status="error" my={4}>
              <AlertIcon />
              <AlertTitle mr={2}>No logs found!</AlertTitle>
              <AlertDescription>
                This character does not have any (public) Mythic+ Logs or WCL is rate-limiting. Try later again.
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
                <TabPanel key={dungeonID} mb={4}>
                  <KeystoneTable reports={relevantReports} />
                </TabPanel>
              );
            })
          )}
        </TabPanels>
      </Tabs>

      <footer>
        last sync: {new Date(lastSync).toLocaleString()} - next sync possible at{" "}
        {new Date(lastSync + 8 * 60 * 60 * 1000).toLocaleString()}
      </footer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths<
  Required<MaybeCharacter>
> = async () => {
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
  const characterParams = { region, realm, character };

  const data =
    process.env.NODE_ENV === "development"
      ? (dummyData as CharacterProps["data"])
      : await lookup(characterParams);

  return {
    props: {
      data,
      characterParams,
      lastSync: Date.now(),
    },
    revalidate: 60 * 60 * 1,
  };
};
