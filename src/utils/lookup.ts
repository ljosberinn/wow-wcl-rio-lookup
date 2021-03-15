import type { MaybeCharacter } from "../hooks/useCharacterParams";
import { dungeons } from "./dungeons";

export type CharacterData = PartialRioResponse & {
  wclData: SanitizedWclData[];
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const WARCRAFTLOGS_API_KEY = process.env.WARCRAFTLOGS_API_KEY!;

type RioResponse = {
  name: string;
  race: string;
  class: string;
  active_spec_name: string;
  active_spec_role: "TANK" | "DPS" | "HEALER";
  gender: "female" | "male";
  faction: "horde" | "alliance";
  achievement_points: number;
  honorable_kills: number;
  thumbnail_url: string;
  region: "eu" | "us";
  realm: string;
  last_crawled_at: string;
  profile_url: string;
  profile_banner: string;
  mythic_plus_scores: {
    all: number;
    dps: number;
    healer: number;
    tank: number;
    spec_0: number;
    spec_1: number;
    spec_2: number;
    spec_3: number;
  };
};

export type PartialRioResponse = Pick<
  RioResponse,
  | "race"
  | "mythic_plus_scores"
  | "thumbnail_url"
  | "active_spec_name"
  | "active_spec_role"
  | "class"
>;

async function getRioData({
  character: name,
  realm,
  region,
}: Required<MaybeCharacter>): Promise<PartialRioResponse | null> {
  const endpoint = "https://raider.io/api/v1/characters/profile";

  const searchParams = new URLSearchParams({
    name,
    region,
    realm,
    fields: "mythic_plus_scores",
  }).toString();

  const url = `${endpoint}?${searchParams}`;

  try {
    const response = await fetch(url);

    if (response.ok) {
      const {
        race,
        thumbnail_url,
        mythic_plus_scores,
        active_spec_name,
        active_spec_role,
        class: className,
      }: RioResponse = await response.json();

      return {
        race,
        thumbnail_url,
        mythic_plus_scores,
        active_spec_name,
        active_spec_role,
        class: className,
      };
    }

    return null;
  } catch {
    return null;
  }
}

type DungeonName =
  | "Sanguine Depths"
  | "Spires of Ascension"
  | "The Necrotic Wake"
  | "Halls of Atonement"
  | "Plaguefall"
  | "Mists of Tirna Scithe"
  | "De Other Side"
  | "Theater of Pain";

type WarcraftLogsReportEntry = {
  encounterID: number;
  encounterName: DungeonName;
  class: string;
  spec: string;
  rank: number;
  outOf: number;
  duration: number;
  startTime: number;
  reportID: string;
  fightID: number;
  difficulty: number;
  characterID: number;
  characterName: string;
  server: string;
  percentile: number;
  ilvlKeyOrPatch: number;
  total: number;
  estimated: boolean;
};

async function getWclReports({
  character,
  realm,
  region,
  role,
}: Required<MaybeCharacter> & {
  role: PartialRioResponse["active_spec_role"];
}): Promise<WarcraftLogsReportEntry[]> {
  const endpoint = `https://www.warcraftlogs.com/v1/parses/character/${character}/${realm}/${region}`;

  const searchParams = new URLSearchParams({
    metric: role === "HEALER" ? "hps" : "dps",
    zone: "25",
    api_key: WARCRAFTLOGS_API_KEY,
  }).toString();

  const url = `${endpoint}?${searchParams}`;

  try {
    const response = await fetch(url);

    return response.ok ? await response.json() : [];
  } catch {
    return [];
  }
}

const dungeonMeta = dungeons.reduce<Record<number, [number, number, number]>>(
  (carry, dungeon) => {
    carry[dungeon.id] = dungeon.timer;

    return carry;
  },
  {}
);

type WclDungeonData = [
  number,
  Pick<WarcraftLogsReportEntry, "fightID" | "reportID" | "startTime">[]
][];

const extractWclDungeonData = (reports: WarcraftLogsReportEntry[]) => {
  return Object.keys(dungeonMeta)
    .map((id) => Number.parseInt(id))
    .reduce<WclDungeonData>((carry, id) => {
      // filter by dungeon id
      const keysOfDungeon = reports.filter(
        (report) => report.encounterID === id
      );
      // sort desc by key level & date
      const sorted = keysOfDungeon.sort((a, b) => {
        const isHigherLevel = b.ilvlKeyOrPatch > a.ilvlKeyOrPatch;
        const isNewer = b.startTime > a.startTime;
        const isSameLevel = b.ilvlKeyOrPatch === a.ilvlKeyOrPatch;

        if (isHigherLevel) {
          return 1;
        }

        if (isNewer && isSameLevel) {
          return 0;
        }

        return -1;
      });

      const sanitized = sorted.map(({ fightID, reportID, startTime }) => ({
        fightID,
        reportID,
        startTime,
      }));

      return [...carry, [id, sanitized]];
    }, []);
};

type Report = {
  fights: {
    id: number;
    boss: number;
    start_time: number;
    end_time: number;
    name: string;
    size?: number;
    difficulty?: number;
    kill?: boolean;
    partial?: number;
    medal?: number;
    completionTime?: number;
    keystoneLevel?: number;
    affixes?: number[];
    bossPercentage?: number;
    fightPercentage?: number;
    lastPhaseForPercentageDisplay?: number;
    maps: number[];
    dungeonPulls?: {
      id: number;
      boss: number;
      start_time: number;
      end_time: number;
      name: string;
      kill: boolean;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      x: number;
      y: number;
      maps: number[];
      enemies: number[][];
    }[];
  }[];
};

const getReport = async (id: string): Promise<null | Report> => {
  const endpoint = `https://www.warcraftlogs.com/v1/report/fights/${id}`;
  const searchParams = new URLSearchParams({
    translate: "true",
    api_key: WARCRAFTLOGS_API_KEY,
  }).toString();
  const url = `${endpoint}?${searchParams}`;

  try {
    const response = await fetch(url);

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

type Summary = {
  name: string;
  id: number;
  guid: number;
  type: string;
  icon: string;
  total: number;
};

type Player = {
  maxItemLevel: number;
  minItemLevel: number;
  name: string;
  server: string;
  type: string;
  specs: string[];
  guid: number;
  id: number;
  // irrelevant
  combatantInfo: Record<string, number | unknown>;
};

type FightSummary = {
  composition: {
    name: string;
    id: number;
    guid: number;
    type: string;
    specs: { spec: string; role: string }[];
  }[];
  damageDone: Summary[];
  damageTaken: {
    name: string;
    guid: number;
    id: number;
    abilityIcon: string;
    total: number;
  }[];
  deathEvents: {
    name: string;
    id: number;
    guid: number;
    type: string;
    icon: string;
    deathTime: number;
    ability: {
      name: string;
      guid: number;
      type: number;
      abilityIcon: string;
    };
  }[];
  gameVersion: 1;
  healingDone: Summary[];
  itemLevel: number;
  totalTime: number;
  logVersion: number;
  playerDetails: {
    dps: Player[];
    healers: Player[];
    tanks: Player[];
  };
};

const getFightSummary = async (
  reportID: string,
  { start_time, end_time }: Report["fights"][number]
): Promise<FightSummary | null> => {
  const endpoint = `https://www.warcraftlogs.com/v1/report/tables/summary/${reportID}`;
  const searchParams = new URLSearchParams({
    api_key: WARCRAFTLOGS_API_KEY,
    translate: "true",
    start: start_time.toString(),
    end: end_time.toString(),
  }).toString();

  const url = `${endpoint}?${searchParams}`;

  try {
    const response = await fetch(url);

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

export type SanitizedWclDataset = {
  dps: number;
  hps: number;
  deaths: number;
  keyLevel: number;
  fightID: number;
  reportID: string;
  affixes: number[];
  inTime: 0 | 1 | 2 | 3;
  timestamp: number;
};

export type SanitizedWclData = [number, SanitizedWclDataset[]];

const isDungeonInTime = ({
  boss,
  completionTime,
}: Pick<Required<Report["fights"][number]>, "boss" | "completionTime">) => {
  const [plus1, plus2, plus3] = dungeonMeta[boss];

  if (completionTime <= plus3) {
    return 3;
  }

  if (completionTime <= plus2) {
    return 2;
  }

  if (completionTime <= plus1) {
    return 1;
  }

  return 0;
};

const getParses = async (
  tuples: WclDungeonData,
  characterName: string
): Promise<SanitizedWclData[]> => {
  return Promise.all(
    tuples.map(
      async ([id, reports]): Promise<SanitizedWclData> => {
        const data = await Promise.all<SanitizedWclDataset | null>(
          reports.map(async ({ fightID, reportID, startTime }) => {
            const report = await getReport(reportID);

            if (!report) {
              return null;
            }

            const fight = report.fights.find((fight) => fight.id === fightID);

            // skip broken requests as well as logs for keys under level 15
            if (
              !fight ||
              !fight.keystoneLevel ||
              fight.keystoneLevel < 15 ||
              !fight.completionTime
            ) {
              return null;
            }

            const summary = await getFightSummary(reportID, fight);

            // skip broken requests as well as broken logs
            if (!summary || summary.totalTime < 5 * 60 * 1000) {
              return null;
            }

            const completionTimeInSeconds = summary.totalTime / 1000;

            const dps = Math.round(
              (summary.damageDone.find(
                (dataset) => dataset.name.toLowerCase() === characterName
              )?.total ?? 0) / completionTimeInSeconds
            );

            const hps = Math.round(
              (summary.healingDone.find(
                (dataset) => dataset.name.toLowerCase() === characterName
              )?.total ?? 0) / completionTimeInSeconds
            );

            const deaths =
              summary.deathEvents.filter(
                (event) => event.name.toLowerCase() === characterName
              )?.length ?? 0;

            const inTime = isDungeonInTime({
              boss: fight.boss,
              completionTime: fight.completionTime,
            });

            return {
              dps,
              hps,
              deaths,
              keyLevel: fight.keystoneLevel,
              inTime,
              reportID,
              fightID,
              affixes: fight.affixes ?? [],
              timestamp: startTime,
            };
          })
        );

        return [id, data.filter(Boolean) as SanitizedWclDataset[]];
      }
    )
  );
};

type LookupParams = Required<MaybeCharacter>;

export async function lookup({
  region,
  realm,
  character,
}: LookupParams): Promise<null | CharacterData> {
  const rioData = await getRioData({ character, region, realm });

  if (!rioData) {
    return null;
  }

  const reports = await getWclReports({
    character,
    region,
    realm,
    role: rioData.active_spec_role,
  });

  const idReportTuples = extractWclDungeonData(reports);
  const wclData = await getParses(idReportTuples, character.toLowerCase());

  return {
    ...rioData,
    wclData,
  };
}
