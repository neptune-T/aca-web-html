import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), '_data');
const travelFilePath = path.join(dataDirectory, 'travel.json');

export function getTravelData() {
  if (!fs.existsSync(travelFilePath)) {
    console.warn("'travel.json' not found. Returning empty data.");
    return { world: {}, china: {}, details: { world: {}, china: {} } };
  }

  const fileContents = fs.readFileSync(travelFilePath, 'utf8');
  return JSON.parse(fileContents);
}
