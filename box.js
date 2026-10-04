function BoxPlot() {
    this.name = 'Maternal Data : Box Plot';
    this.id = 'box-plot-maternal';

    this.layout = {
        leftMargin: 100,
        rightMargin: width - 30,
        topMargin: 70,
        bottomMargin: height - 70,
        pad: 5,
        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },
        grid: true,
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    this.loaded = false;

    // Dropdown elements
    this.featureSelect;

    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/maternal.csv', 'csv', 'header', function(table) {
            self.loaded = true;
        });
    };

    this.setup = function() {
        textSize(14);

        // Create dropdown for feature selection
        this.featureSelect = createSelect();
        this.featureSelect.position(this.layout.leftMargin + 300, this.layout.topMargin - 40);
        this.featureSelect.option('SystolicBP');
        this.featureSelect.option('DiastolicBP');
        this.featureSelect.option('BS');
        this.featureSelect.option('BodyTemp');
        this.featureSelect.option('HeartRate');
        this.featureSelect.selected('SystolicBP');
    };

    this.destroy = function() {
        this.featureSelect.remove();
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        var feature = this.featureSelect.value();
        var riskLevels = ['low risk', 'mid risk', 'high risk'];
        var colors = [color(70, 130, 180), color(255, 165, 0), color(144, 238, 144)];

        background(255);  // Clear background to redraw

        // Draw chart title
        textSize(20);
        textAlign('center', 'top');
        text('Maternal Health Box Plot: Risk Level Comparison Across Key Health Indicators', width / 2, this.layout.topMargin - 60);

        // Draw x-axis label
        textSize(16);
        textAlign('center', 'top');
        text(feature, width / 2, height - 40);

        // Draw x-axis tick marks and labels
        var max = Math.max.apply(Math, this.data.getColumn(feature));
        for (var i = 0; i <= this.layout.numXTickLabels; i++) {
            var x = map(i, 0, this.layout.numXTickLabels, this.layout.leftMargin, this.layout.rightMargin);
            var value = nf((i * max) / this.layout.numXTickLabels, 0, 2);

            stroke(0);
            line(x, this.layout.bottomMargin, x, this.layout.bottomMargin + 5);

            noStroke();
            textSize(12);
            textAlign('center', 'top');
            text(value, x, this.layout.bottomMargin + 10);
        }

        for (var i = 0; i < riskLevels.length; i++) {
            var riskLevel = riskLevels[i];
            var filteredData = this.data.findRows(riskLevel, 'RiskLevel');
            this.drawBoxenPlotWithFullStatistics(filteredData, feature, riskLevel, colors[i], i);
        }
    };

    this.drawBoxenPlotWithFullStatistics = function(filteredData, feature, riskLevel, col, index) {
        var boxHeight = this.layout.plotHeight() / 4;
        var yPos = this.layout.topMargin + index * boxHeight + boxHeight / 2;

        // Extract values and sort them
        var values = filteredData.map(function(row) {
            return row.getNum(feature);
        }).sort((a, b) => a - b);

        // Calculate Q1, Q2 (Median), Q3, Min, and Max
        var q1 = this.calculateQuartile(values, 0.25);
        var median = this.calculateQuartile(values, 0.5);
        var q3 = this.calculateQuartile(values, 0.75);
        var iqr = q3 - q1;
        var min = Math.min(...values);
        var max = Math.max(...values);

        // Determine whisker bounds (within 1.5 * IQR)
        var whiskerMin = Math.max(min, q1 - 1.5 * iqr);
        var whiskerMax = Math.min(max, q3 + 1.5 * iqr);

        // Draw Q1-Q3 Box
        fill(col);
        noStroke();
        var q1Pos = this.mapValueToX(q1, feature);
        var q3Pos = this.mapValueToX(q3, feature);
        rect(q1Pos, yPos - boxHeight / 4, q3Pos - q1Pos, boxHeight / 2);

        // Draw Median Line
        stroke(0);
        var medianPos = this.mapValueToX(median, feature);
        line(medianPos, yPos - boxHeight / 4, medianPos, yPos + boxHeight / 4);

        // Draw Whiskers
        stroke(0);
        var whiskerMinPos = this.mapValueToX(whiskerMin, feature);
        var whiskerMaxPos = this.mapValueToX(whiskerMax, feature);
        line(whiskerMinPos, yPos, q1Pos, yPos);  // Whisker from Min to Q1
        line(q3Pos, yPos, whiskerMaxPos, yPos);  // Whisker from Q3 to Max

        // Draw Min and Max as horizontal lines
        line(whiskerMinPos, yPos - boxHeight / 8, whiskerMinPos, yPos + boxHeight / 8);  // Min line
        line(whiskerMaxPos, yPos - boxHeight / 8, whiskerMaxPos, yPos + boxHeight / 8);  // Max line

        // Draw risk level label
        fill(0);
        noStroke();
        textSize(14);
        textAlign('right', 'center');
        text(riskLevel, this.layout.leftMargin - this.layout.pad, yPos);

        // Draw outliers as points
        values.forEach(value => {
            if (value < whiskerMin || value > whiskerMax) {
                var outlierPos = this.mapValueToX(value, feature);
                fill(0);
                ellipse(outlierPos, yPos, 5, 5);  // Draw outlier as a small circle
            }
        });
    };

    this.calculateQuartile = function(arr, q) {
        const pos = (arr.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (arr[base + 1] !== undefined) {
            return arr[base] + rest * (arr[base + 1] - arr[base]);
        } else {
            return arr[base];
        }
    };

    this.mapValueToX = function(value, feature) {
        var max = Math.max.apply(Math, this.data.getColumn(feature));
        return map(value, 0, max, this.layout.leftMargin, this.layout.rightMargin);
    };
}
