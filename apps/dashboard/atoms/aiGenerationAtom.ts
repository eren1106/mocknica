import { atom } from "jotai";
import { IEndpoint, ISchema } from "@/types";

export interface AIGeneratedData {
  schemas?: ISchema[];
  endpoints: IEndpoint[];
}

// Atom to store AI generated data
export const aiGeneratedDataAtom = atom<AIGeneratedData | null>(null);

// Derived atom to check if AI data exists
export const hasAIGeneratedDataAtom = atom((get) => {
  const data = get(aiGeneratedDataAtom);
  return data !== null;
});
