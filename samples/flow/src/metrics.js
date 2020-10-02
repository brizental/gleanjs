/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Glean, _MetricTypes } from "glean";

const _INSTANCE = new Glean("svelte-sample-app", "svelte");

export default {
  cmOnboarding : {
    joinCommunity: new _MetricTypes.EventMetricType(_INSTANCE, "cm.onboarding", "join_community"),
    acceptTerms: new _MetricTypes.EventMetricType(_INSTANCE, "cm.onboarding", "accept_terms"),
    skipSurvey: new _MetricTypes.EventMetricType(_INSTANCE, "cm.onboarding", "skip_survey"),
    submitSurvey: new _MetricTypes.EventMetricType(_INSTANCE, "cm.onboarding", "submit_survey"),
  },
  cmStudies : {
    clickStudy: new _MetricTypes.EventMetricType(_INSTANCE, "cm.studies", "click_study"),
  },
};

