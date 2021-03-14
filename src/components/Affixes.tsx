import { chakra, HStack } from "@chakra-ui/react";

import type { SanitizedWclDataset } from "../utils/lookup";

const affixIconMap: Record<number, { name: string; icon: string }> = {
  121: {
    name: "Prideful",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_animarevendreth_buff.jpg",
  },
  10: {
    name: "Fortified",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/ability_toughness.jpg",
  },
  11: {
    name: "Bursting",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/ability_ironmaidens_whirlofblood.jpg",
  },
  3: {
    name: "Volcanic",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_shaman_lavasurge.jpg",
  },
  122: {
    name: "Inspiring",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_holy_prayerofspirit.jpg",
  },
  124: {
    name: "Storming",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_nature_cyclone.jpg",
  },
  9: {
    name: "Tyrannical",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/achievement_boss_archaedas.jpg",
  },
  6: {
    name: "Raging",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/ability_warrior_focusedrage.jpg",
  },
  14: {
    name: "Quaking",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_nature_earthquake.jpg",
  },
  8: {
    name: "Sanguine",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_shadow_bloodboil.jpg",
  },
  12: {
    name: "Grievous",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/ability_backstab.jpg",
  },
  123: {
    name: "Spiteful",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_holy_prayerofshadowprotection.jpg",
  },
  7: {
    name: "Bolstering",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/ability_warrior_battleshout.jpg",
  },
  4: {
    name: "Necrotic",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_deathknight_necroticplague.jpg",
  },
  13: {
    name: "Explosive",
    icon:
      "https://assets.rpglogs.com/img/warcraft/abilities/spell_fire_felflamering_red.jpg",
  },
};

type AffixesProps = Pick<SanitizedWclDataset, "affixes" | "inTime">;

export function Affixes({ affixes, inTime }: AffixesProps): JSX.Element {
  return (
    <HStack spacing={1}>
      {affixes.map((affix) => {
        const src = affixIconMap[affix]?.icon ?? "unknown";
        const alt = affixIconMap[affix]?.name ?? affix;

        return (
          <chakra.img
            height={4}
            loading="lazy"
            src={src}
            alt={alt}
            key={affix}
            filter={inTime ? undefined : "grayscale(1)"}
          />
        );
      })}
    </HStack>
  );
}
