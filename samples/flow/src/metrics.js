/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const { Glean, _MetricTypes: { EventMetricType } } = require("glean");

const _INSTANCE = new Glean("svelte-sample-app", "svelte");

export default {
  cmOnboarding : {
    joinCommunity: new EventMetricType(_INSTANCE, "cm.onboarding", "join_community"),
    acceptTerms: new EventMetricType(_INSTANCE, "cm.onboarding", "accept_terms"),
    skipSurvey: new EventMetricType(_INSTANCE, "cm.onboarding", "skip_survey"),
    submitSurvey: new EventMetricType(_INSTANCE, "cm.onboarding", "submit_survey"),
  },
  cmStudies : {
    clickStudy: new EventMetricType(_INSTANCE, "cm.studies", "click_study"),
  },
};

