/* eslint-disable unicorn/numeric-separators-style */
const createTimer = (initialTime: number): [number, number, number] => [
  initialTime * 60 * 1000,
  initialTime * 60 * 1000 * 0.8,
  initialTime * 60 * 1000 * 0.6,
];

export const dungeons = [
  { id: 12284, name: "Sanguine Depths", timer: createTimer(41), slug: "SD" },
  {
    id: 12285,
    name: "Spires of Ascension",
    timer: createTimer(39),
    slug: "SoA",
  },
  { id: 12286, name: "The Necrotic Wake", timer: createTimer(36), slug: "NW" },
  {
    id: 12287,
    name: "Halls of Atonement",
    timer: createTimer(31),
    slug: "HoA",
  },
  { id: 12289, name: "Plaguefall", timer: createTimer(38), slug: "PF" },
  {
    id: 12290,
    name: "Mists of Tirna Scithe",
    timer: createTimer(30),
    slug: "MoTS",
  },
  { id: 12291, name: "De Other Side", timer: createTimer(43), slug: "DOS" },
  { id: 12293, name: "Theatre of Pain", timer: createTimer(37), slug: "TOP" },
];
