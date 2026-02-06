import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), '_data');
const honorsFilePath = path.join(dataDirectory, 'honors.json');

export function getHonorsData() {
  if (!fs.existsSync(honorsFilePath)) {
    console.warn("'honors.json' not found. Returning empty array.");
    return [];
  }
  
  const fileContents = fs.readFileSync(honorsFilePath, 'utf8');
  return JSON.parse(fileContents);
}
