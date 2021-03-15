import { chakra, Table, Th, Tr, Link, Td } from "@chakra-ui/react";
import { formatDistance } from "date-fns";
import React, { memo } from "react";

import type { SanitizedWclDataset } from "../utils/lookup";
import { Affixes } from "./Affixes";
import { Chests } from "./Chests";

const calcAvgTimedMetric = (
  reports: SanitizedWclDataset[],
  metric: "dps" | "deaths" | "hps"
) => {
  const timedKeys = reports.filter((report) => report.inTime > 0);

  if (timedKeys.length === 0) {
    return 0;
  }

  return Math.round(
    timedKeys.reduce((carry, report) => carry + report[metric], 0) /
      timedKeys.length
  ).toLocaleString();
};

type KeystoneTableProps = {
  reports: SanitizedWclDataset[];
};

export function KeystoneTable({ reports }: KeystoneTableProps): JSX.Element {
  return (
    <Table size="sm">
      <thead>
        <tr>
          <Th isNumeric>Key Level</Th>
          <Th>Date</Th>
          <Th>Affixes</Th>
          <Th>Timed</Th>
          <Th isNumeric>DPS</Th>
          <Th isNumeric>HPS</Th>
          <Th isNumeric>Deaths</Th>
          <Th>Log</Th>
        </tr>
      </thead>
      <tbody>
        {reports.map((report) => {
          return (
            <TableRow key={`${report.reportID}${report.fightID}`} {...report} />
          );
        })}
      </tbody>
      <tfoot>
        <Tr>
          <Td colSpan={3} />
          <Td>
            {Math.round(
              (reports.filter((report) => report.inTime > 0).length /
                reports.length) *
                100
            )}
            % in time
          </Td>
          <Td isNumeric>ø timed dps: {calcAvgTimedMetric(reports, "dps")}</Td>
          <Td isNumeric>ø timed hps: {calcAvgTimedMetric(reports, "hps")}</Td>
          <Td isNumeric>
            ø timed deaths: {calcAvgTimedMetric(reports, "deaths")}
          </Td>
          <Td />
        </Tr>
      </tfoot>
    </Table>
  );
}

type TableRowProps = SanitizedWclDataset;

const TableRow = memo(
  ({
    reportID,
    fightID,
    keyLevel,
    affixes,
    inTime,
    hps,
    dps,
    deaths,
    timestamp = 0,
  }: TableRowProps) => {
    const date = new Date(timestamp);

    return (
      <Tr opacity={inTime ? 1 : 0.4}>
        <Td isNumeric>{keyLevel}</Td>
        <Td>
          <time dateTime={date.toISOString()}>
            {formatDistance(timestamp, new Date(), { addSuffix: true })}
          </time>
        </Td>
        <Td>
          <Affixes affixes={affixes} inTime={inTime} />
        </Td>
        <Td>
          <Chests inTime={inTime} />
        </Td>
        <Td isNumeric>{dps.toLocaleString()}</Td>
        <Td isNumeric>{hps.toLocaleString()}</Td>
        <Td
          isNumeric
          color={
            deaths === 0 ? "green.300" : deaths < 3 ? "orange.300" : "red.500"
          }
        >
          {deaths}
        </Td>
        <Td>
          <Link
            rel="noopener noreferrer"
            target="_blank"
            href={`https://www.warcraftlogs.com/reports/${reportID}#fight=${fightID}&type=damage-done`}
          >
            <chakra.img
              height={4}
              loading="lazy"
              src="https://cdnassets.raider.io/assets/img/warcraftlogs-icon-1da8feba74b4d68aa3d428ab7f851275.png"
              alt="WCL"
            />
          </Link>
        </Td>
      </Tr>
    );
  }
);
