import { Spinner } from '@2digits/log';
import { simpleGit } from 'simple-git';
import pathe from 'pathe';

export async function initializeRepository(path: string): Promise<void> {
  const spinner = new Spinner();
  spinner.start('Initializing git repository');

  const git = simpleGit(path);

  const isRepo = await git.checkIsRepo();

  if (isRepo) return spinner.fail(`Repository already exists at ${path}`);

  await git.init();

  return spinner.success('Git repository initialized');
}

export async function getRepoRoot(): Promise<string> {
  const git = simpleGit();
  const topLevel = await git.revparse('--show-toplevel');
  return pathe.resolve(topLevel);
}

export async function checkIsGitClean(root: string): Promise<boolean> {
  const git = simpleGit(root);

  const status = await git.status();

  return status.isClean();
}
