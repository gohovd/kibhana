/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */
import { deserializeFollowerIndex } from '../../../../../common/services/follower_index_serialization';
import {
  getFollowerIndexStatsMock,
  getFollowerIndexListStatsMock,
  getFollowerIndexInfoMock,
  getFollowerIndexListInfoMock,
} from '../../../../../fixtures';
import { callWithRequestFactory } from '../../../lib/call_with_request_factory';
import { isEsErrorFactory } from '../../../lib/is_es_error_factory';
import { registerFollowerIndexRoutes } from '../follower_index';
import { createRouter, callRoute } from './helpers';

jest.mock('../../../lib/call_with_request_factory');
jest.mock('../../../lib/is_es_error_factory');
jest.mock('../../../lib/license_pre_routing_factory', () => ({
  licensePreRoutingFactory: ({ requestHandler }) => requestHandler,
}));

const DESERIALIZED_KEYS = Object.keys(
  deserializeFollowerIndex({
    ...getFollowerIndexInfoMock(),
    ...getFollowerIndexStatsMock(),
  })
);

let routeRegistry;

/**
 * Helper to extract all the different server route handler so we can easily call them in our tests.
 *
 * Important: This method registers the handlers in the order that they appear in the file, so
 * if a 'server.route()' call is moved or deleted, then the HANDLER_INDEX_TO_ACTION must be updated here.
 */
const registerHandlers = () => {
  const HANDLER_INDEX_TO_ACTION = {
    0: 'list',
    1: 'get',
    2: 'create',
    3: 'edit',
    4: 'pause',
    5: 'resume',
    6: 'unfollow',
  };

  routeRegistry = createRouter(HANDLER_INDEX_TO_ACTION);
  registerFollowerIndexRoutes({
    __LEGACY: {},
    router: routeRegistry.router,
  });
};

/**
 * Queue to save request response and errors
 * It allows us to fake multiple responses from the
 * callWithRequestFactory() when the request handler call it
 * multiple times.
 */
let requestResponseQueue = [];

/**
 * Helper to mock the response from the call to Elasticsearch
 *
 * @param {*} err The mock error to throw
 * @param {*} response The response to return
 */
const setHttpRequestResponse = (error, response) => {
  requestResponseQueue.push({ error, response });
};

const resetHttpRequestResponses = () => (requestResponseQueue = []);

const getNextResponseFromQueue = () => {
  if (!requestResponseQueue.length) {
    return null;
  }

  const next = requestResponseQueue.shift();
  if (next.error) {
    return Promise.reject(next.error);
  }
  return Promise.resolve(next.response);
};

describe('[CCR API Routes] Follower Index', () => {
  let routeHandler;

  beforeAll(() => {
    isEsErrorFactory.mockReturnValue(() => false);
    callWithRequestFactory.mockReturnValue(getNextResponseFromQueue);
    registerHandlers();
  });

  describe('list()', () => {
    beforeEach(() => {
      routeHandler = routeRegistry.getRoutes().list;
    });

    it('deserializes the response from Elasticsearch', async () => {
      const totalResult = 2;
      const infoResult = getFollowerIndexListInfoMock(totalResult);
      const statsResult = getFollowerIndexListStatsMock(
        totalResult,
        infoResult.follower_indices.map(index => index.follower_index)
      );
      setHttpRequestResponse(null, infoResult);
      setHttpRequestResponse(null, statsResult);

      const {
        options: { body: response },
      } = await callRoute(routeHandler);
      const followerIndex = response.indices[0];

      expect(response.indices.length).toEqual(totalResult);
      expect(Object.keys(followerIndex)).toEqual(DESERIALIZED_KEYS);
    });
  });

  describe('get()', () => {
    beforeEach(() => {
      routeHandler = routeRegistry.getRoutes().get;
    });

    it('should return a single resource even though ES return an array with 1 item', async () => {
      const mockId = 'test1';
      const followerIndexInfo = getFollowerIndexInfoMock(mockId);
      const followerIndexStats = getFollowerIndexStatsMock(mockId);

      setHttpRequestResponse(null, { follower_indices: [followerIndexInfo] });
      setHttpRequestResponse(null, { indices: [followerIndexStats] });

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: mockId } });
      expect(Object.keys(response)).toEqual(DESERIALIZED_KEYS);
    });
  });

  describe('create()', () => {
    beforeEach(() => {
      resetHttpRequestResponses();
      routeHandler = routeRegistry.getRoutes().create;
    });

    it('should return 200 status when follower index is created', async () => {
      setHttpRequestResponse(null, { acknowledge: true });

      const response = await callRoute(
        routeHandler,
        {},
        {
          body: {
            name: 'follower_index',
            remoteCluster: 'remote_cluster',
            leaderIndex: 'leader_index',
          },
        }
      );

      expect(response.options.body).toEqual({ acknowledge: true });
    });
  });

  describe('pause()', () => {
    beforeEach(() => {
      resetHttpRequestResponses();
      routeHandler = routeRegistry.getRoutes().pause;
    });

    it('should pause a single item', async () => {
      setHttpRequestResponse(null, { acknowledge: true });

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1' } });

      expect(response.itemsPaused).toEqual(['1']);
      expect(response.errors).toEqual([]);
    });

    it('should accept a list of ids to pause', async () => {
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });

      const response = await callRoute(routeHandler, {}, { params: { id: '1,2,3' } });

      expect(response.options.body.itemsPaused).toEqual(['1', '2', '3']);
    });

    it('should catch error and return them in array', async () => {
      const error = new Error('something went wrong');
      error.response = '{ "error": {} }';

      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(error);

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1,2' } });

      expect(response.itemsPaused).toEqual(['1']);
      expect(response.errors[0].id).toEqual('2');
    });
  });

  describe('resume()', () => {
    beforeEach(() => {
      resetHttpRequestResponses();
      routeHandler = routeRegistry.getRoutes().resume;
    });

    it('should resume a single item', async () => {
      setHttpRequestResponse(null, { acknowledge: true });

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1' } });

      expect(response.itemsResumed).toEqual(['1']);
      expect(response.errors).toEqual([]);
    });

    it('should accept a list of ids to resume', async () => {
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });

      const response = await callRoute(routeHandler, {}, { params: { id: '1,2,3' } });

      expect(response.options.body.itemsResumed).toEqual(['1', '2', '3']);
    });

    it('should catch error and return them in array', async () => {
      const error = new Error('something went wrong');
      error.response = '{ "error": {} }';

      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(error);

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1,2' } });

      expect(response.itemsResumed).toEqual(['1']);
      expect(response.errors[0].id).toEqual('2');
    });
  });

  describe('unfollow()', () => {
    beforeEach(() => {
      resetHttpRequestResponses();
      routeHandler = routeRegistry.getRoutes().unfollow;
    });

    it('should unfollow await single item', async () => {
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1' } });

      expect(response.itemsUnfollowed).toEqual(['1']);
      expect(response.errors).toEqual([]);
    });

    it('should accept a list of ids to unfollow', async () => {
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });

      const response = await callRoute(routeHandler, {}, { params: { id: '1,2,3' } });

      expect(response.options.body.itemsUnfollowed).toEqual(['1', '2', '3']);
    });

    it('should catch error and return them in array', async () => {
      const error = new Error('something went wrong');
      error.response = '{ "error": {} }';

      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(null, { acknowledge: true });
      setHttpRequestResponse(error);

      const {
        options: { body: response },
      } = await callRoute(routeHandler, {}, { params: { id: '1,2' } });

      expect(response.itemsUnfollowed).toEqual(['1']);
      expect(response.errors[0].id).toEqual('2');
    });
  });
});