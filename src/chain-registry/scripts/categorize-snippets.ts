import fs from 'fs';
import path from 'path';
import { inputFiles, outputFiles, OutputFile } from './configs.js';

interface Snippet {
  content: string;
  source: string;
  language: string;
}

interface ProcessingStats {
  totalProcessed: number;
  categorizedCounts: Record<string, number>;
  uncategorized: number;
  ignoredByLanguage: number;
  inputFileCounts: Record<string, number>;
}

const IGNORED_LANGUAGES = new Set(['bash', 'shell', 'sh', 'mermaid']);

async function readSnippets(filePath: string, delimiter: string): Promise<Snippet[]> {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const snippets = content.split(delimiter).filter((s) => s.trim());

  return snippets.map((snippet) => {
    // Extract SOURCE field from the snippet
    const sourceMatch = snippet.match(/SOURCE:\s*([^\n]+)/);
    const source = sourceMatch ? sourceMatch[1].trim() : '';

    // Extract language from the LANGUAGE field
    const languageMatch = snippet.match(/LANGUAGE:\s*([^\n]+)/);
    const language = languageMatch ? languageMatch[1].trim().toLowerCase() : '';

    return {
      content: snippet.trim(),
      source,
      language,
    };
  });
}

function categorizeByVersion(source: string): ('v1' | 'v2')[] {
  const sourceNormalized = source.toLowerCase();
  const hasV1 = sourceNormalized.includes('v1');
  const hasV2 = sourceNormalized.includes('v2');

  // If it has both v1 and v2, return both
  if (hasV1 && hasV2) {
    return ['v1', 'v2'];
  }
  // If it has only v1, return v1
  else if (hasV1) {
    return ['v1'];
  }
  // If it has only v2, return v2
  else if (hasV2) {
    return ['v2'];
  }
  // Default to v2 if neither v1 nor v2 is found
  else {
    return ['v2'];
  }
}

async function categorizeSnippets() {
  const stats: ProcessingStats = {
    totalProcessed: 0,
    categorizedCounts: {},
    uncategorized: 0,
    ignoredByLanguage: 0,
    inputFileCounts: {},
  };

  // Initialize output map to store categorized snippets
  const categorizedSnippets: Record<string, Snippet[]> = {};
  outputFiles.forEach((file: OutputFile) => {
    categorizedSnippets[file.path] = [];
    stats.categorizedCounts[file.path] = 0;
  });

  // Process each input file
  for (const inputFile of inputFiles) {
    const snippets = await readSnippets(inputFile.path, inputFile.snippetsDelimiter);
    stats.inputFileCounts[inputFile.path] = snippets.length;
    stats.totalProcessed += snippets.length;

    // Categorize each snippet
    for (const snippet of snippets) {
      // Skip snippets with ignored languages
      if (IGNORED_LANGUAGES.has(snippet.language)) {
        stats.ignoredByLanguage++;
        continue;
      }

      // Determine version(s) based on source
      const versions = categorizeByVersion(snippet.source);

      // Add snippet to all applicable output files
      for (const version of versions) {
        const outputFile = outputFiles.find((file) => file.version === version);
        if (outputFile) {
          categorizedSnippets[outputFile.path].push(snippet);
          stats.categorizedCounts[outputFile.path]++;
        } else {
          stats.uncategorized++;
        }
      }
    }
  }

  // Write categorized snippets to output files
  for (const [filePath, snippets] of Object.entries(categorizedSnippets)) {
    // Create directory if it doesn't exist
    const dir = path.dirname(filePath);
    await fs.promises.mkdir(dir, { recursive: true });

    // Write snippets to file using the same delimiter as input file
    const content = snippets.map((s) => s.content).join(inputFiles[0].snippetsDelimiter);
    await fs.promises.writeFile(filePath, content);
  }

  // Log processing statistics
  console.log('\nChain Registry Snippets Categorization Completed!');
  console.log('\n----------------------------');
  console.log(`Total snippets processed: ${stats.totalProcessed}`);

  console.log('\nInput files:');
  for (const [filePath, count] of Object.entries(stats.inputFileCounts)) {
    console.log(`  ${filePath}: ${count} snippets`);
  }

  console.log('\nCategorized snippets by output file:');
  for (const [filePath, count] of Object.entries(stats.categorizedCounts)) {
    console.log(`  ${filePath}: ${count} snippets`);
  }

  console.log('\nOther snippets:');
  console.log(
    `  Skipped (${Array.from(IGNORED_LANGUAGES).join(', ')}): ${stats.ignoredByLanguage}`
  );
  console.log(`  Uncategorized: ${stats.uncategorized}`);
  console.log('----------------------------');

  return stats;
}

categorizeSnippets().catch(console.error);
