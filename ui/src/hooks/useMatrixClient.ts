import { matrixService } from '../core/matrix';

export const useMatrixClient = (): any => {
  return matrixService.getClient();
};
