function FacetGrid() {
    this.name = ' Maternal Data : Facet Grid';
    this.id = 'facet-grid-maternal';

    this.layout = {
        leftMargin: 100,
        rightMargin: width - 50,
        topMargin: 100,
        bottomMargin: height - 50,
        pad: 5,  // Reduced padding between bars for better alignment
        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },
        grid: true,
        numXTickLabels: 4, // Show 0-100 with intervals of 25 on the x-axis
        numYTickLabels: 8,
    };

    this.loaded = false;

    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/maternal.csv', 'csv', 'header', function(table) {
            self.loaded = true;
        });
    };

    this.setup = function() {
        textSize(14);
    };

    this.destroy = function() {};

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        var features = ['SystolicBP', 'DiastolicBP', 'BS', 'BodyTemp', 'HeartRate'];
        var riskLevels = ['low risk', 'mid risk', 'high risk'];
        var colors = [color(70, 130, 180, 220), color(255, 165, 0, 220), color(144, 238, 144, 220), color(255, 99, 132, 220), color(153, 102, 255, 220)];

        // Draw chart title
        textSize(20);
        textAlign('center', 'top');
        fill(0);
        noStroke();
        text('Maternal Health Indicators Facet Grid: Risk Level Comparison Across Key Metrics', width / 2, this.layout.topMargin - 60);

        for (var j = 0; j < features.length; j++) {
            var feature = features[j];
            for (var i = 0; i < riskLevels.length; i++) {
                var riskLevel = riskLevels[i];
                var filteredData = this.data.findRows(riskLevel, 'RiskLevel');
                this.drawFacet(filteredData, feature, riskLevel, j, i, colors[j], i === riskLevels.length - 1);  // Only draw x-axis labels for the last row
            }
        }

        // Draw x-axis label
        textAlign('center', 'top');
        textSize(16);
        text('Value', width / 2, height - 20);
    };

    this.drawFacet = function(filteredData, feature, riskLevel, colIndex, rowIndex, col, drawXAxis) {
        var cellWidth = this.layout.plotWidth() / 5;
        var cellHeight = this.layout.plotHeight() / 3;
        var xOffset = this.layout.leftMargin + colIndex * cellWidth;
        var yOffset = this.layout.topMargin + rowIndex * cellHeight;

        // Draw subtle grid lines
        stroke(220);
        strokeWeight(0.5);
        for (var k = 0; k <= this.layout.numXTickLabels; k++) {
            var gridX = map(k, 0, this.layout.numXTickLabels, xOffset, xOffset + cellWidth);
            line(gridX, yOffset, gridX, yOffset + cellHeight);

            // Draw x-axis labels only if it's the last row (high risk)
            if (drawXAxis) {
                textAlign('center', 'top');
                textSize(12);
                noStroke();
                fill(0);
                text(nf((k * 25), 0, 0), gridX, yOffset + cellHeight + this.layout.pad * 2);
            }
        }

        // Draw title for each facet
        fill(0);
        noStroke();
        textSize(12);
        textAlign('center', 'bottom');
        text(riskLevel + ' - ' + feature, xOffset + cellWidth / 2, yOffset - this.layout.pad);

        // Draw data points (bars)
        for (var i = 0; i < filteredData.length; i++) {
            var value = filteredData[i].getNum(feature);
            var rectWidth = this.mapValueToWidth(value, feature);
            var rectHeight = cellHeight / filteredData.length - this.layout.pad;

            fill(col);
            noStroke();
            rect(xOffset, yOffset + i * (rectHeight + this.layout.pad), rectWidth, rectHeight);
        }
    };

    this.mapValueToWidth = function(value, feature) {
        var max = Math.max.apply(Math, this.data.getColumn(feature));
        return map(value, 0, max, 0, this.layout.plotWidth() / 5 - this.layout.pad);
    };
}
