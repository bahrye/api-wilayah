const fs = require('fs');
const readline = require('readline');
const path = require('path');

const csvFilePath = path.join(__dirname, 'erlange-repo', 'csv', 'dt4.csv');
const sqlFilePath = path.join(__dirname, 'update_kodepos_2.sql');

async function processLineByLine() {
  const fileStream = fs.createReadStream(csvFilePath);
  const writeStream = fs.createWriteStream(sqlFilePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let isFirstLine = true;
  let count = 0;
  for await (const line of rl) {
    if (isFirstLine) {
      isFirstLine = false;
      continue;
    }
    
    // Line format: "11.01.01.2001","Keude Bakongan","23773"
    // Use regex to match CSV
    const match = line.match(/^"([^"]+)","([^"]*)","([^"]*)"$/);
    if (match) {
      const kode = match[1];
      const zip = match[3];
      if (kode && zip && zip.trim() !== '') {
        const sqlQuery = `UPDATE wilayah SET kodepos = '${zip}' WHERE kode = '${kode}';\n`;
        writeStream.write(sqlQuery);
        count++;
      }
    }
  }
  
  writeStream.end();
  console.log(`Finished writing to update_kodepos_2.sql. Processed: ${count}`);
}

processLineByLine();
