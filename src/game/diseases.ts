import { Disease, DiseaseType } from './types';

export const DISEASES: Record<DiseaseType, Disease> = {
  bloaty_head: {
    type: 'bloaty_head',
    name: 'Bloaty Head',
    diagnosisChain: ['gp_office'],
    treatmentRoom: 'deflation',
    treatmentCost: 300,
    difficulty: 20,
  },
  slack_tongue: {
    type: 'slack_tongue',
    name: 'Slack Tongue',
    diagnosisChain: ['gp_office'],
    treatmentRoom: 'pharmacy',
    treatmentCost: 150,
    difficulty: 10,
  },
  invisibility: {
    type: 'invisibility',
    name: 'Invisibility',
    diagnosisChain: ['gp_office', 'pharmacy'],
    treatmentRoom: 'pharmacy',
    treatmentCost: 200,
    difficulty: 30,
  },
};

export const DISEASE_TYPES: DiseaseType[] = ['bloaty_head', 'slack_tongue', 'invisibility'];

export function getDisease(type: DiseaseType): Disease {
  return DISEASES[type];
}
