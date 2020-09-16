import QtQuick 2.0
import QtQuick.Controls 2.0
import QtQuick.LocalStorage 2.0

import "../../dist/glean.js" as Glean
import "metrics.js" as Metrics

    Button {
        text: "Hello World"
        anchors.centerIn: parent
        onClicked: Metrics.GleanMetrics.test.record()
    }
