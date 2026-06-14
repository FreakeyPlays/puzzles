import packageJson from '../../package.json';
import { Environment } from './environment.config';

declare const __GIT_HASH__: string;

export const environment: Environment = {
  production: true,
  version: `v${packageJson.version}`,
  commitHash: __GIT_HASH__,
};
