export interface InputFile {
  path: string;
  snippetsDelimiter: string;
  matchingRule: 'version'; // simplified to just version matching
}

export const inputFiles: InputFile[] = [
  {
    path: 'src/chain-registry/prompts/_generated.txt',
    snippetsDelimiter: '\n\n----------------------------------------\n\n',
    matchingRule: 'version',
  },
  {
    path: 'src/chain-registry/prompts/_custom.txt',
    snippetsDelimiter: '\n\n----------------------------------------\n\n',
    matchingRule: 'version',
  },
];

export interface OutputFile {
  path: string;
  version: 'v1' | 'v2';
  isDefault?: boolean; // v2 is the default when no version is found
}

export const outputFiles: OutputFile[] = [
  {
    path: 'src/chain-registry/prompts/v1-snippets.txt',
    version: 'v1',
  },
  {
    path: 'src/chain-registry/prompts/v2-snippets.txt',
    version: 'v2',
    isDefault: true,
  },
];
