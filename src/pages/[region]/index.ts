import { useCharacterParams } from "../../hooks/useCharacterParams";
import { useMissingCharacterParamsToast } from "../../hooks/useMissingCharacterParamsToast";

export default function Region(): null {
  const characterParams = useCharacterParams();
  useMissingCharacterParamsToast(characterParams);

  return null;
}
