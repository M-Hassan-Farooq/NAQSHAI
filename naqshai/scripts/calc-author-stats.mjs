import { execSync } from 'child_process';

const output = execSync('git log --numstat --format="COMMIT_AUTHOR:%an"', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });

const stats = {};
let currentAuthor = 'Unknown';
const commitSeen = new Set();

for (const line of output.split('\n')) {
  const trimmed = line.trim();
  if (trimmed.startsWith('COMMIT_AUTHOR:')) {
    currentAuthor = trimmed.replace('COMMIT_AUTHOR:', '').trim();
    if (currentAuthor === 'Muhammad Hassan Farooq') currentAuthor = 'Hassan';
    if (!stats[currentAuthor]) {
      stats[currentAuthor] = {
        author: currentAuthor,
        added: 0,
        deleted: 0,
        net: 0,
        commits: 0,
        byCategory: {
          core_lib_and_math: { added: 0, deleted: 0 },
          pages_and_api: { added: 0, deleted: 0 },
          components_and_ui: { added: 0, deleted: 0 },
          test_suites_and_scripts: { added: 0, deleted: 0 },
          docs_and_migrations: { added: 0, deleted: 0 },
          other: { added: 0, deleted: 0 }
        }
      };
    }
    stats[currentAuthor].commits++;
  } else if (trimmed) {
    const parts = trimmed.split(/\s+/);
    if (parts.length >= 3) {
      const added = parseInt(parts[0], 10);
      const deleted = parseInt(parts[1], 10);
      const filePath = parts[2];
      
      // Exclude lock files and binary noise for accurate source code metrics
      if (filePath.includes('package-lock.json') || filePath.includes('.next') || filePath.includes('.pptx')) continue;
      
      if (!isNaN(added) && !isNaN(deleted)) {
        stats[currentAuthor].added += added;
        stats[currentAuthor].deleted += deleted;
        
        let cat = 'other';
        if (filePath.includes('lib/')) {
          cat = 'core_lib_and_math';
        } else if (filePath.includes('/api/')) {
          cat = 'pages_and_api';
        } else if (filePath.includes('components/')) {
          cat = 'components_and_ui';
        } else if (filePath.includes('app/')) {
          cat = 'pages_and_api';
        } else if (filePath.includes('scripts/') || filePath.includes('scratch/')) {
          cat = 'test_suites_and_scripts';
        } else if (filePath.includes('supabase/') || filePath.includes('docs/') || filePath.includes('documentation/')) {
          cat = 'docs_and_migrations';
        }
        
        stats[currentAuthor].byCategory[cat].added += added;
        stats[currentAuthor].byCategory[cat].deleted += deleted;
      }
    }
  }
}

for (const s of Object.values(stats)) {
  s.net = s.added - s.deleted;
}

console.log(JSON.stringify(stats, null, 2));

