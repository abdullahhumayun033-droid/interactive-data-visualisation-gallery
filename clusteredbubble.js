function ClusteredBubbleChart() {

    // Name for the visualisation to appear in the menu bar.
    this.name = 'Covid Student Data : Clustered Bubble Chart';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'clustered-bubble-chart';

    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        leftMargin: 100,
        rightMargin: width - 150, // Adjusted right margin for better spacing
        topMargin: 100,
        bottomMargin: height - 100,
        pad: 5,

        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        }
    };

    // Colors for different categories.
    this.colorMap = {
        'Laptop/Desktop': [66, 135, 245],  // Use RGB array instead of color object
        'Smartphone': [245, 127, 66],
        'Tablet': [66, 245, 200]
    };

    // Default color for undefined mediums
    this.defaultColor = [150, 150, 150];

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // Preload the data.
    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/covidstudent.csv', 'csv', 'header', function(table) {
            self.loaded = true;
        });
    };

    this.setup = function() {
        textSize(16);
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        // Clear the background before drawing the new frame
        background(255);

        // Draw the title of the chart
        this.drawTitle();

        // Draw the axes and tick labels
        this.drawAxes();

        // Draw the axis labels
        this.drawAxisLabels();

        // Loop over every row in the data.
        for (var i = 0; i < this.data.getRowCount(); i++) {

            var student = {
                rating: this.data.getString(i, 'Rating of Online Class experience'),
                timeSpent: this.data.getNum(i, 'Time spent on Online Class'),
                medium: this.data.getString(i, 'Medium for online class')
            };

            var x = this.mapRatingToX(student.rating);
            var y = this.mapTimeToY(student.timeSpent);
            var size = this.mapTimeToSize(student.timeSpent);

            // Check if the medium exists in the color map
            if (this.colorMap.hasOwnProperty(student.medium)) {
                fill(this.colorMap[student.medium][0], this.colorMap[student.medium][1], this.colorMap[student.medium][2]);
            } else {
                fill(this.defaultColor[0], this.defaultColor[1], this.defaultColor[2]);
            }

            noStroke();
            ellipse(x, y, size, size);
        }

        // Draw the legend
        this.drawLegend();
    };

    this.mapRatingToX = function(rating) {
        var ratings = ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'];
        var index = ratings.indexOf(rating);
        return map(index, 0, ratings.length - 1, this.layout.leftMargin, this.layout.rightMargin);
    };

    this.mapTimeToY = function(time) {
        return map(time, 0, 10, this.layout.bottomMargin, this.layout.topMargin);
    };

    this.mapTimeToSize = function(time) {
        return map(time, 0, 15, 15, 50);
    };

    this.drawAxes = function() {
        stroke(0);
        strokeWeight(1);

        // Draw X-axis
        line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.rightMargin, this.layout.bottomMargin);

        // Draw Y-axis
        line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.leftMargin, this.layout.topMargin);

        // X-axis labels
        textAlign(CENTER, TOP);
        textSize(12);
        var ratings = ['Very poor', 'Poor', 'Average', 'Good', 'Excellent'];
        for (var i = 0; i < ratings.length; i++) {
            var x = this.mapRatingToX(ratings[i]);
            text(ratings[i], x, this.layout.bottomMargin + 10);
        }

        // Y-axis labels
        textAlign(RIGHT, CENTER);
        textSize(12);
        for (var j = 0; j <= 10; j += 2) {
            var y = this.mapTimeToY(j);
            text(j + ' hrs', this.layout.leftMargin - 10, y);
        }
    };

    this.drawAxisLabels = function() {
        // X-axis label
        textAlign(CENTER, CENTER);
        textSize(14);
        text('Rating of Online Class Experience', (this.layout.leftMargin + this.layout.rightMargin) / 2, this.layout.bottomMargin + 40);

        // Y-axis label
        push();
        translate(this.layout.leftMargin - 60, (this.layout.topMargin + this.layout.bottomMargin) / 2);
        rotate(-HALF_PI);
        text('Time Spent on Online Classes (hours)', 0, 0);
        pop();
    };

    this.drawTitle = function() {
        textSize(20);
        fill(0);
        textAlign(CENTER, TOP);
        text('Student Online Learning: Time Spent vs Experience Rating by Device Type', width / 2, this.layout.topMargin - 60);
    };

    this.drawLegend = function() {
        // Adjust legend placement to ensure visibility within the canvas
        var legendX = this.layout.rightMargin + 20; // Position legend closer to the right margin
        var legendY = this.layout.topMargin + 20;

        textSize(12);
        textAlign(LEFT, CENTER);

        for (var medium in this.colorMap) {
            if (this.colorMap.hasOwnProperty(medium)) {
                fill(this.colorMap[medium][0], this.colorMap[medium][1], this.colorMap[medium][2]);
                rect(legendX + 20, legendY, 15, 15);
                fill(0);
                text(medium, legendX + 40, legendY + 7.5);
                legendY += 25;
            }
        }
    };

    this.destroy = function() {
        // Clear the background when the chart is closed
        background(255);
    };
}
