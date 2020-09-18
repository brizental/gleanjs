/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

export default {
  cmOnboarding : {
    joinCommunity: new Glean._MetricTypes.EventMetricType("cm.onboarding", "join_community"),
    acceptTerms: new Glean._MetricTypes.EventMetricType("cm.onboarding", "accept_terms"),
    skipSurvey: new Glean._MetricTypes.EventMetricType("cm.onboarding", "skip_survey"),
    submitSurvey: new Glean._MetricTypes.EventMetricType("cm.onboarding", "submit_survey"),
  },
  cmStudies : {
    clickStudy: new Glean._MetricTypes.EventMetricType("cm.studies", "click_study"),
  },
};

