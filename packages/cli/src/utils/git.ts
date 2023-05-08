import { Spinner } from '@2digits/log';
import { simpleGit } from 'simple-git';

export async function initializeRepository(path: string): Promise<void> {
  const spinner = new Spinner();
  spinner.start('Initializing git repository');

  const git = simpleGit(path);

  const isRepo = await git.checkIsRepo();

  if (isRepo) return spinner.fail(`Repository already exists at ${path}`);

  await git.init();

  return spinner.success('Git repository initialized');
}
