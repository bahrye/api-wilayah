const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvFilePath = path.join(__dirname, 'temp-repo', 'data', 'kodepos.csv');

async function processLineByLine() {
  const fileStream = fs.createReadStream(csvFilePath);
  const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

  let isFirstLine = true;
  let skipped = 0;
  for await (const line of rl) {
    if (isFirstLine) { isFirstLine = false; continue; }
    
    let [kodeDesa, kodePos] = line.split(';');
    
    let kD = kodeDesa ? kodeDesa.trim() : null;
    let kP = kodePos ? kodePos.trim() : null;

    if (!(kD && kP && kD.length === 10)) {
      console.log(`Skipped line: '${line}'`);
      console.log(`kodeDesa: '${kodeDesa}', kodePos: '${kodePos}'`);
      skipped++;
      if (skipped > 5) break;
    }
  }
}

processLineByLine();
