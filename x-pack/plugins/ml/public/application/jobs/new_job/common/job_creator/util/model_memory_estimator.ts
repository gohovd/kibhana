/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License;
 * you may not use this file except in compliance with the Elastic License.
 */

import { i18n } from '@kbn/i18n';
import { Observable, of, Subject, Subscription } from 'rxjs';
import { isEqual, cloneDeep } from 'lodash';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  pluck,
  startWith,
  switchMap,
  map,
  pairwise,
} from 'rxjs/operators';
import { useEffect, useState } from 'react';
import { DEFAULT_MODEL_MEMORY_LIMIT } from '../../../../../../../common/constants/new_job';
import { ml } from '../../../../../services/ml_api_service';
import { JobValidator, VALIDATION_DELAY_MS } from '../../job_validator/job_validator';
import { ErrorResponse } from '../../../../../../../common/types/errors';
import { useMlKibana } from '../../../../../contexts/kibana';
import { JobCreator } from '../job_creator';

export type CalculatePayload = Parameters<typeof ml.calculateModelMemoryLimit$>[0];

export const modelMemoryEstimatorProvider = (jobValidator: JobValidator) => {
  const modelMemoryCheck$ = new Subject<CalculatePayload>();
  const error$ = new Subject<ErrorResponse['body']>();

  return {
    get error$(): Observable<ErrorResponse['body']> {
      return error$.asObservable();
    },
    get updates$(): Observable<string> {
      return modelMemoryCheck$.pipe(
        // delay the request, making sure the validation is completed
        debounceTime(VALIDATION_DELAY_MS + 100),
        // clone the object to compare payloads and proceed further only
        // if the configuration has been changed
        map(cloneDeep),
        distinctUntilChanged(isEqual),
        switchMap(payload => {
          const isPayloadValid = jobValidator.isModelMemoryEstimationPayloadValid;

          return isPayloadValid
            ? ml.calculateModelMemoryLimit$(payload).pipe(
                pluck('modelMemoryLimit'),
                catchError(error => {
                  // eslint-disable-next-line no-console
                  console.error('Model memory limit could not be calculated', error.body);
                  error$.next(error.body);
                  return of(DEFAULT_MODEL_MEMORY_LIMIT);
                })
              )
            : of(DEFAULT_MODEL_MEMORY_LIMIT);
        }),
        startWith(DEFAULT_MODEL_MEMORY_LIMIT)
      );
    },
    update(payload: CalculatePayload) {
      modelMemoryCheck$.next(payload);
    },
  };
};

export const useModelMemoryEstimator = (
  jobCreator: JobCreator,
  jobValidator: JobValidator,
  jobCreatorUpdate: Function,
  jobCreatorUpdated: number
) => {
  const {
    services: { notifications },
  } = useMlKibana();

  // Initialize model memory estimator only once
  const [modelMemoryEstimator] = useState(modelMemoryEstimatorProvider(jobValidator));

  // Listen for estimation results and errors
  useEffect(() => {
    const subscription = new Subscription();

    subscription.add(
      modelMemoryEstimator.updates$
        .pipe(pairwise())
        .subscribe(([previousEstimation, currentEstimation]) => {
          // to make sure we don't overwrite a manual input
          if (
            jobCreator.modelMemoryLimit === null ||
            jobCreator.modelMemoryLimit === previousEstimation
          ) {
            jobCreator.modelMemoryLimit = currentEstimation;
            // required in order to trigger changes on the input
            jobCreatorUpdate();
          }
        })
    );

    subscription.add(
      modelMemoryEstimator.error$.subscribe(error => {
        notifications.toasts.addWarning({
          title: i18n.translate('xpack.ml.newJob.wizard.estimateModelMemoryError', {
            defaultMessage: 'Model memory limit could not be calculated',
          }),
          text: error.message,
        });
      })
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update model memory estimation payload on the job creator updates
  useEffect(() => {
    modelMemoryEstimator.update({
      analysisConfig: jobCreator.jobConfig.analysis_config,
      indexPattern: jobCreator.indexPatternTitle,
      query: jobCreator.datafeedConfig.query,
      timeFieldName: jobCreator.jobConfig.data_description.time_field,
      earliestMs: jobCreator.start,
      latestMs: jobCreator.end,
    });
  }, [jobCreatorUpdated]);
};