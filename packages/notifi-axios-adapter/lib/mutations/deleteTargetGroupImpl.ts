import { makeRequest } from '../utils/axiosRequest';
import collectDependencies from '../utils/collectDependencies';
import {
  DeleteTargetGroupInput,
  DeleteTargetGroupResult,
} from '@notifi-network/notifi-core';

const DEPENDENCIES: string[] = [];

const MUTATION = `
mutation deleteTargetGroup(
  $id: String!
) {
  deleteTargetGroup(targetGroupInput: {
    id: $id
  }) {
    id
  }
}
`.trim();

const deleteTargetGroupImpl = makeRequest<
  DeleteTargetGroupInput,
  DeleteTargetGroupResult
>(collectDependencies(...DEPENDENCIES, MUTATION), 'deleteTargetGroup');

export default deleteTargetGroupImpl;
