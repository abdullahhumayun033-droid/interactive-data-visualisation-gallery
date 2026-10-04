function ScoresBoxPlot() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Students Data : Box Plot';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'scores-box-plot';

    // Title to display above the plot.
    this.title = 'Box Plot Analysis of Student Scores: Gender Comparison in Math, Reading, and Writing';

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data.
    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/students.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
            });
    };

    this.setup = function () {
        textSize(16);

        // Create a structure to hold the jitter values for each point
        this.jitterMap = {};
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Clear the background
        background(255);

        // Draw the title
        this.drawTitle();

        // Define the categories (Gender)
        let genders = ['female', 'male'];
        let scores = ['math score', 'reading score', 'writing score'];

        // Define colors for the categories
        let colors = {
            'female': color(255, 105, 180),
            'male': color(0, 100, 255)
        };

        // Draw axes and labels
        this.drawAxesAndLabels(scores);

        // Draw box plots for each score type
        for (let i = 0; i < scores.length; i++) {
            this.drawBoxPlot(scores[i], genders, colors, i);
        }

        // Draw legend
        this.drawLegend(colors);
    };

    this.drawBoxPlot = function (scoreType, categories, colors, index) {
        let padding = 150;  // Increased padding for more space between plots
        let boxWidth = 60;

        let xStart = 150;  // Shifted the start point to the left
        let xCenter = xStart + index * (boxWidth + padding);

        for (let i = 0; i < categories.length; i++) {
            let categoryData = this.data.getColumn(scoreType)
                .filter((val, j) => this.data.getString(j, 'gender') === categories[i])
                .map(Number);
            let q1 = this.calculateQuantile(categoryData, 0.25);
            let median = this.calculateQuantile(categoryData, 0.5);
            let q3 = this.calculateQuantile(categoryData, 0.75);
            let minValue = Math.min(...categoryData);
            let maxValue = Math.max(...categoryData);

            fill(colors[categories[i]]);
            noStroke();

            // Draw the box
            rect(xCenter + i * boxWidth,
                map(q3, 0, 100, height - padding, padding),
                boxWidth,
                map(q1, 0, 100, height - padding, padding) - map(q3, 0, 100, height - padding, padding));

            // Draw the median line
            stroke(0);
            strokeWeight(2);
            line(xCenter + i * boxWidth,
                map(median, 0, 100, height - padding, padding),
                xCenter + i * boxWidth + boxWidth,
                map(median, 0, 100, height - padding, padding));

            // Draw whiskers
            line(xCenter + i * boxWidth + boxWidth / 2,
                map(minValue, 0, 100, height - padding, padding),
                xCenter + i * boxWidth + boxWidth / 2,
                map(q1, 0, 100, height - padding, padding));
            line(xCenter + i * boxWidth + boxWidth / 2,
                map(maxValue, 0, 100, height - padding, padding),
                xCenter + i * boxWidth + boxWidth / 2,
                map(q3, 0, 100, height - padding, padding));

            // Plot individual points
            this.drawDataPoints(scoreType, categories[i], categoryData, xCenter + i * boxWidth, boxWidth, colors[categories[i]]);
        }
    };

    this.drawDataPoints = function (scoreType, category, data, xCenter, boxWidth, color) {
        fill(0);
        noStroke();

        // Initialize jitterMap if it doesn't exist for this category and scoreType
        if (!this.jitterMap[scoreType]) {
            this.jitterMap[scoreType] = {};
        }
        if (!this.jitterMap[scoreType][category]) {
            this.jitterMap[scoreType][category] = [];
        }

        for (let i = 0; i < data.length; i++) {
            // Assign jitter once if it hasn't been assigned yet
            if (!this.jitterMap[scoreType][category][i]) {
                this.jitterMap[scoreType][category][i] = random(-boxWidth / 4, boxWidth / 4);
            }

            let jitter = this.jitterMap[scoreType][category][i];
            let x = xCenter + boxWidth / 2 + jitter;
            let y = map(data[i], 0, 100, height - 100, 100);
            ellipse(x, y, 2, 2);
        }
    };

    this.calculateQuantile = function (data, quantile) {
        let sorted = data.sort((a, b) => a - b);
        let pos = (sorted.length - 1) * quantile;
        let base = Math.floor(pos);
        let rest = pos - base;

        if (sorted[base + 1] !== undefined) {
            return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
        } else {
            return sorted[base];
        }
    };

    this.drawAxesAndLabels = function (scores) {
        let padding = 100;
        let boxWidth = 60;
        let xStart = 150;  // Shifted the start point to the left

        // Draw X-axis
        line(xStart - 50, height - padding, width - padding, height - padding);

        // Draw Y-axis
        line(xStart - 50, height - padding, xStart - 50, padding);

        // Draw Y-axis labels and ticks
        textSize(12);
        fill(0);
        textAlign(RIGHT, CENTER);

        for (let i = 0; i <= 100; i += 20) {
            let y = map(i, 0, 100, height - padding, padding);
            line(xStart - 55, y, xStart - 45, y);
            text(i, xStart - 60, y);
        }

        // Draw X-axis labels
        textSize(12);
        fill(0);
        textAlign(CENTER, CENTER);

        let labelPadding = 60; // Add additional padding between labels

        for (let i = 0; i < scores.length; i++) {
            let x = xStart + i * (boxWidth + padding + labelPadding) + boxWidth / 2;
            text(scores[i].replace(' score', ' Score').charAt(0).toUpperCase() + scores[i].replace(' score', ' Score').slice(1), x, height - padding + 30);
        }

    };

    this.drawLegend = function (colors) {
        let legendX = width - 150;  // Adjusted position for better spacing
        let legendY = 200;

        textSize(12);
        textAlign(LEFT, CENTER);

        for (let category in colors) {
            fill(colors[category]);
            rect(legendX, legendY, 15, 15);
            fill(0);
            text(category, legendX + 20, legendY + 7.5);
            legendY += 25;
        }
    };

    this.drawTitle = function () {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);
        text(this.title, width / 2, 40);
    };
}
