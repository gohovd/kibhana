/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { schema } from '@kbn/config-schema';
import { AgentEventSchema, AgentTypeSchema } from '../models';

export const GetAgentsRequestSchema = {
  query: schema.object({
    page: schema.number({ defaultValue: 1 }),
    perPage: schema.number({ defaultValue: 20 }),
    kuery: schema.maybe(schema.string()),
    showInactive: schema.boolean({ defaultValue: false }),
  }),
};

export const GetOneAgentRequestSchema = {
  params: schema.object({
    agentId: schema.string(),
  }),
};

export const PostAgentCheckinRequestSchema = {
  params: schema.object({
    agentId: schema.string(),
  }),
  body: schema.object({
    local_metadata: schema.maybe(schema.recordOf(schema.string(), schema.any())),
    events: schema.maybe(schema.arrayOf(AgentEventSchema)),
  }),
};

export const PostAgentEnrollRequestSchema = {
  body: schema.object({
    type: AgentTypeSchema,
    shared_id: schema.maybe(schema.string()),
    metadata: schema.object({
      local: schema.recordOf(schema.string(), schema.any()),
      user_provided: schema.recordOf(schema.string(), schema.any()),
    }),
  }),
};

export const PostAgentAcksRequestSchema = {
  body: schema.object({
    action_ids: schema.arrayOf(schema.string()),
  }),
  params: schema.object({
    agentId: schema.string(),
  }),
};

export const PostAgentUnenrollRequestSchema = {
  body: schema.oneOf([
    schema.object({
      kuery: schema.string(),
    }),
    schema.object({
      ids: schema.arrayOf(schema.string()),
    }),
  ]),
};

export const GetOneAgentEventsRequestSchema = {
  params: schema.object({
    agentId: schema.string(),
  }),
  query: schema.object({
    page: schema.number({ defaultValue: 1 }),
    perPage: schema.number({ defaultValue: 20 }),
    kuery: schema.maybe(schema.string()),
  }),
};

export const DeleteAgentRequestSchema = {
  params: schema.object({
    agentId: schema.string(),
  }),
};

export const UpdateAgentRequestSchema = {
  params: schema.object({
    agentId: schema.string(),
  }),
  body: schema.object({
    user_provided_metadata: schema.recordOf(schema.string(), schema.any()),
  }),
};

export const GetAgentStatusRequestSchema = {
  query: schema.object({
    configId: schema.maybe(schema.string()),
  }),
};