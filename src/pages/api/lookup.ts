import type { NextApiRequest, NextApiResponse } from "next";
import nc from "next-connect";
import type { RequestHandler } from "next-connect";

import { createExpirationMiddleware } from "../../utils/api";
import { BAD_REQUEST } from "../../utils/statusCodes";
import type { MaybeCharacter } from "../../hooks/useCharacterParams";
import dummyData from "../../../devData.json";
import { dungeons } from "../../utils/dungeons";

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
  Pick<WarcraftLogsReportEntry, "fightID" | "reportID">[]
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

      const sanitized = sorted.map(({ fightID, reportID }) => ({
        fightID,
        reportID,
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
  reportID: number;
  affixes: number[];
  inTime: 0 | 1 | 2 | 3;
};

export type SanitizedWclData = [number, SanitizedWclDataset[]];

const getParses = async (tuples: WclDungeonData, characterName: string) => {
  return Promise.all(
    tuples.map(async ([id, reports]) => {
      const data = await Promise.all(
        reports.map(async ({ fightID, reportID }) => {
          const report = await getReport(reportID);

          if (!report) {
            return null;
          }

          const fight = (report.fights ?? []).find(
            (fight) => fight.id === fightID
          );

          // skip broken requests as well as logs for keys under level 10
          if (
            !fight ||
            !fight.keystoneLevel ||
            fight.keystoneLevel < 10 ||
            !fight.completionTime
          ) {
            return null;
          }

          const summary = await getFightSummary(reportID, fight);

          // skip broken requests as well as broken logs
          if (!summary || summary.totalTime < 10 * 60 * 1000) {
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

          const [plus1, plus2, plus3] = dungeonMeta[fight.boss];

          const inTime =
            fight.completionTime <= plus3
              ? 3
              : fight.completionTime <= plus2
              ? 2
              : fight.completionTime <= plus1
              ? 1
              : 0;

          return {
            dps,
            hps,
            deaths,
            keyLevel: fight.keystoneLevel,
            inTime,
            reportID,
            fightID,
            affixes: fight.affixes,
          };
        })
      );

      return [id, data.filter(Boolean)];
    })
  );
};

const handler: RequestHandler<NextApiRequest, NextApiResponse> = async (
  req,
  res
) => {
  if (
    !req.query.character ||
    !req.query.region ||
    !req.query.realm ||
    Array.isArray(req.query.realm) ||
    Array.isArray(req.query.character) ||
    Array.isArray(req.query.region)
  ) {
    res.status(BAD_REQUEST).end();
    return;
  }

  if (process.env.NODE_ENV === "development") {
    res.json(dummyData);
    res.end();
    return;
  }

  const { character, region, realm } = req.query;

  const rioData = await getRioData({ character, region, realm });

  if (!rioData) {
    res.status(BAD_REQUEST).end();
    return;
  }

  if (rioData) {
    const reports = await getWclReports({
      character,
      region,
      realm,
      role: rioData.active_spec_role,
    });

    const idReportTuples = extractWclDungeonData(reports);
    const wclData = await getParses(idReportTuples, character.toLowerCase());

    res.json({ ...rioData, wclData });
  }
};

export default nc()
  .use(createExpirationMiddleware())
  .get<NextApiRequest, NextApiResponse>(handler);
