const splitStringToRows = (inputData: string) => {
  // Use the split method with a regular expression to split the input string into an array of lines.
  let lines = inputData.split(/\r?\n/);

  // Remove any leading or trailing whitespace from each line.
  // Remove any empty lines.
  lines = lines.map((line) => (line ?? '').trim()).filter(Boolean);
  return lines;
}

const parseColItem = (data = '') => {
  return data.replace(/(^")|("$)/gm, '').replace(/"{2}/gm, '"');
}

const parseCsvRow = (inputString: string) => {
  const regex = /("[^"]*"|[^,]+)(?:,|$)/g;
  const result = [];
  let match;

  while ((match = regex.exec(inputString)) !== null) {
    const item = match[1].replace(/,$/, '')
    result.push(parseColItem(item));
  }
  return result;
}

export const parseCSVContent = (content: string): string[][] => {
  const rows = splitStringToRows(content);
  return rows.map(parseCsvRow);
}

export const getDataFromRows = (rows: string[][], log: (...messages: unknown[]) => void) => {
  const [colsNames, ...rowsData] = rows;
  log('Columns: ', colsNames);
  const mappedCols = colsNames.map((colName, index) => /^[a-zA-Z\d_-]{1,}$/.test(colName) ? [colName, index] : null)
    .filter(Boolean);
  return rowsData.map((row) => {
    log('Row: ', row.join(','));
    const data = mappedCols.reduce((res, item) => ({
      ...res,
      [item[0]]: row[item[1]]
    }), {} as Record<string, string>);
    return data;
  });
}