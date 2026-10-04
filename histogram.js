function Histogram() {
    this.name = 'Maternal Data : Histogram';
    this.id = 'histogram-maternal';

    this.layout = {
        leftMargin: 100,
        rightMargin: width - 50,
        topMargin: 80,  // Adjusted for chart title
        bottomMargin: height - 100,
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

    this.selectedFeature = 'Age';  // Default selected feature

    // Define an array of pastel colors
    this.pastelColors = [
        color(173, 216, 230), // Light Blue
        color(255, 182, 193), // Light Pink
        color(240, 230, 140), // Light Yellow
        color(144, 238, 144), // Light Green
        color(221, 160, 221), // Light Purple
        color(255, 228, 196), // Light Orange
        color(255, 218, 185), // Light Peach
        color(255, 240, 245), // Lavender Blush
        color(250, 250, 210), // Light Goldenrod Yellow
        color(255, 239, 213)  // Papaya Whip
    ];

    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/maternal.csv', 'csv', 'header', function(table) {
            self.loaded = true;
        });
    };

    this.setup = function() {
        textSize(16);

        // Create a dropdown menu for selecting different features
        this.featureSelect = createSelect();
        this.featureSelect.position(320, 20);
        this.featureSelect.option('Age');
        this.featureSelect.option('SystolicBP');
        this.featureSelect.option('DiastolicBP');
        this.featureSelect.option('BS');
        this.featureSelect.option('BodyTemp');
        this.featureSelect.option('HeartRate');
        this.featureSelect.changed(() => {
            this.selectedFeature = this.featureSelect.value();
            redraw();
        });

        noLoop();  // Prevent continuous redraws
    };

    this.destroy = function() {
        this.featureSelect.remove();  // Clean up dropdown when switching visualizations
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Draw the histogram for the selected feature
        this.drawHistogram(this.selectedFeature);

        // Draw chart title
        textSize(20);
        textAlign('center', 'top');
        fill(0);
        noStroke();
        text('Maternal Data Histogram: Frequency Distribution Across Key Health Metrics' + ' ' + ' : ' + this.selectedFeature, width / 2, this.layout.topMargin - 50);
    };

    this.drawHistogram = function(feature) {
        var values = this.data.getColumn(feature);

        var bins = 10;
        var binWidth = this.layout.plotWidth() / bins;
        var max = Math.max.apply(Math, values);
        var min = Math.min.apply(Math, values);

        var histogram = new Array(bins).fill(0);

        for (var i = 0; i < values.length; i++) {
            var binIndex = Math.floor(map(values[i], min, max, 0, bins));
            if (binIndex === bins) {
                binIndex--;  // Handle edge case where the value equals max
            }
            histogram[binIndex]++;
        }

        // Find the maximum frequency for scaling the y-axis
        var maxFreq = Math.max.apply(Math, histogram);

        // Draw y-axis labels and tick marks
        textSize(12);
        textAlign('right', 'center');
        for (var k = 0; k <= this.layout.numYTickLabels; k++) {
            var yLabel = map(k, 0, this.layout.numYTickLabels, 0, maxFreq);
            var yLabelPos = map(k, 0, this.layout.numYTickLabels, this.layout.bottomMargin, this.layout.topMargin);
            fill(0);
            noStroke();
            text(int(yLabel), this.layout.leftMargin - 10, yLabelPos);
            stroke(200);
            line(this.layout.leftMargin, yLabelPos, this.layout.rightMargin, yLabelPos);
        }

        for (var i = 0; i < bins; i++) {
            var binX = this.layout.leftMargin + i * binWidth;
            var binHeight = map(histogram[i], 0, maxFreq, 0, this.layout.plotHeight());

            fill(this.pastelColors[i % this.pastelColors.length]);  // Apply pastel colors
            rect(binX, this.layout.bottomMargin - binHeight, binWidth, binHeight);

            fill(0);
            noStroke();
            textAlign('center', 'top');
            var binRangeMin = map(i, 0, bins, min, max);
            var binRangeMax = map(i + 1, 0, bins, min, max);
            text(int(binRangeMin) + '-' + int(binRangeMax), binX + binWidth / 2, this.layout.bottomMargin + 5);
        }

        // Draw x-axis label
        fill(0);
        noStroke();
        textAlign('center', 'top');
        textSize(14);
        text('Ages', this.layout.leftMargin + this.layout.plotWidth() / 2, height - 20);

        // Draw y-axis label
        push();
        textAlign('center', 'center');
        translate(40, this.layout.topMargin + this.layout.plotHeight() / 2);
        rotate(-HALF_PI);
        text('Frequency', 0, 0);
        pop();
    };
}
