function BoxenPlot() {
    this.name = 'Maternal Data : Boxen Plot';
    this.id = 'boxen-plot-maternal';

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
        var colors = [color(255, 182, 193), color(173, 216, 230), color(144, 238, 144)];

        background(255);  // Clear background to redraw

        // Draw chart title
        textSize(20);
        textAlign('center', 'top');
        text('Maternal Health Boxen Plot: Risk Level Analysis Across Key Indicators', width / 2, this.layout.topMargin - 60);

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
            this.drawBoxenPlotWithLayers(filteredData, feature, riskLevel, colors[i], i);
        }
    };

    this.drawBoxenPlotWithLayers = function(filteredData, feature, riskLevel, col, index) {
        var boxHeight = this.layout.plotHeight() / 4;
        var yPos = this.layout.topMargin + index * boxHeight + boxHeight / 2;

        // Extract values and sort them
        var values = filteredData.map(function(row) {
            return row.getNum(feature);
        }).sort((a, b) => a - b);

        // Define the layers of percentiles (Boxen plot layers)
        var percentiles = [0.10, 0.25, 0.50, 0.75, 0.90];
        var layerWidths = [0.9, 0.7, 0.5, 0.3, 0.1];  // Gradually shrinking widths for outer layers

        // Draw each percentile range as a box
        for (var j = 0; j < percentiles.length - 1; j++) {
            var lower = this.calculatePercentile(values, percentiles[j]);
            var upper = this.calculatePercentile(values, percentiles[j + 1]);

            var lowerPos = this.mapValueToX(lower, feature);
            var upperPos = this.mapValueToX(upper, feature);
            var widthShrink = layerWidths[j] * boxHeight / 2;

            fill(col);
            noStroke();
            rect(lowerPos, yPos - widthShrink, upperPos - lowerPos, 2 * widthShrink);
        }

        // Draw Median Line
        stroke(0);
        var median = this.calculatePercentile(values, 0.5);
        var medianPos = this.mapValueToX(median, feature);
        line(medianPos, yPos - boxHeight / 2, medianPos, yPos + boxHeight / 2);

        // Draw risk level label
        fill(0);
        noStroke();
        textSize(14);
        textAlign('right', 'center');
        text(riskLevel, this.layout.leftMargin - this.layout.pad, yPos);
    };

    this.calculatePercentile = function(arr, q) {
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
