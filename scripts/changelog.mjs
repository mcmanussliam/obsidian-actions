import {execFileSync} from 'child_process';

const [, , baseRef, headRef = 'HEAD'] = process.argv;

if (!baseRef) {
  console.error('Usage: node scripts/changelog.mjs <base-ref> [head-ref]');
  process.exit(1);
}

const TYPE_TITLES = {
  feat: 'Features',
  fix: 'Fixes',
  perf: 'Performance',
  refactor: 'Refactors',
  docs: 'Documentation',
  test: 'Tests',
  build: 'Build',
  ci: 'CI',
  chore: 'Chores',
  revert: 'Reverts',
};

const CONVENTIONAL_RE = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/;

function gitLog(fromRef, toRef) {
  const range = `${fromRef}..${toRef}`;
  const output = execFileSync(
    'git',
    ['log', '--reverse', '--pretty=format:%H%x09%s', range],
    {encoding: 'utf8'}
  );

  return output
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [hash, subject] = line.split('\t');
      return {hash, subject};
    });
}

function parseCommit(commit) {
  const match = commit.subject.match(CONVENTIONAL_RE);
  if (!match?.groups) {
    return {
      ...commit,
      type: 'other',
      description: commit.subject,
      scope: undefined,
      breaking: false,
    };
  }

  return {
    ...commit,
    type: match.groups.type,
    description: match.groups.description,
    scope: match.groups.scope,
    breaking: Boolean(match.groups.breaking),
  };
}

function formatEntry(commit) {
  const scope = commit.scope ? `**${commit.scope}:** ` : '';
  const breaking = commit.breaking ? ' [breaking]' : '';
  return `- ${scope}${commit.description}${breaking} (${commit.hash.slice(0, 7)})`;
}

function buildSections(commits) {
  const sections = new Map();

  for (const commit of commits) {
    const title = TYPE_TITLES[commit.type] ?? 'Other';
    const entries = sections.get(title) ?? [];
    entries.push(formatEntry(commit));
    sections.set(title, entries);
  }

  return sections;
}

try {
  const commits = gitLog(baseRef, headRef).map(parseCommit);

  if (!commits.length) {
    console.log(`No commits found between ${baseRef} and ${headRef}.`);
    process.exit(0);
  }

  const sections = buildSections(commits);

  console.log(`# Changelog`);
  console.log('');
  console.log(`Range: \`${baseRef}..${headRef}\``);
  console.log('');

  for (const [title, entries] of sections) {
    console.log(`## ${title}`);
    console.log('');

    for (const entry of entries) {
      console.log(entry);
    }

    console.log('');
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to generate changelog: ${message}`);
  process.exit(1);
}
