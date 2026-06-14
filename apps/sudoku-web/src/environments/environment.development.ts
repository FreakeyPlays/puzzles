import packageJson from '../../package.json';
import gitHash from './git-hash.json';
import { Environment } from './environment.config';

export const environment: Environment = {
  production: false,
  version: `v${packageJson.version} - dev (${gitHash.hash})`,
};
