 
export const SPI_COUNT_OPTIONS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

const DEFAULT_CHECKLIST = [
  {
    id: 'stitch-check',
    title: 'Stitch Check',
    description: 'Check stitch quality and uniformity',
  },
  {
    id: 'trim-check',
    title: 'Trim Check',
    description: 'Trim attachment quality and placement',
  },
  {
    id: 'tension-check',
    title: 'Tension Check',
    description: 'Check and maintain standard thread tension',
  },
];
 
export function getChecklistForWorkstation(_workstationDetails) {
  return DEFAULT_CHECKLIST;
}