function ScoresPairPlot() {
    // Name for the visualisation to appear in the menu bar.
    this.name = 'Students Data : Scores Pair Plot';

    // Each visualisation must have a unique ID with no special characters.
    this.id = 'scores-pair-plot';

    // Title to display above the plot.
    this.title = 'Comparative Pair Plot of Student Scores in Math, Reading, and Writing';

    // Define different score combinations
    this.scoreCombinations = {
        'Math vs Reading': { x: 'math score', y: 'reading score' },
        'Math vs Writing': { x: 'math score', y: 'writing score' },
        'Reading vs Writing': { x: 'reading score', y: 'writing score' }
    };

    // Axis Labels for different score combinations
    this.xAxisLabels = {
        'Math vs Reading': 'Math Score',
        'Math vs Writing': 'Math Score',
        'Reading vs Writing': 'Reading Score'
    };

    this.yAxisLabels = {
        'Math vs Reading': 'Reading Score',
        'Math vs Writing': 'Writing Score',
        'Reading vs Writing': 'Writing Score'
    };

    var marginSize = 50; // Increased margin size for better spacing

    // Layout object to store all common plot layout parameters and methods.
    this.layout = {
        marginSize: marginSize,

        leftMargin: marginSize * 2,  // Adjusted left margin
        rightMargin: width - marginSize * 2,
        topMargin: marginSize * 2 + 50,     // Adjusted top margin
        bottomMargin: height - marginSize * 2,  // Adjusted bottom margin
        pad: 20,

        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },

        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },

        grid: true,
        numXTickLabels: 5,
        numYTickLabels: 5,
    };

    // Property to represent whether data has been loaded.
    this.loaded = false;

    // The currently selected score combination
    this.selectedCombination = 'Math vs Reading';

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

        // Create a dropdown menu to select different score combinations
        this.dropdown = createSelect();
        this.dropdown.position(this.layout.leftMargin + 300, this.layout.topMargin - 80);
        for (var combination in this.scoreCombinations) {
            this.dropdown.option(combination);
        }

        var self = this;
        this.dropdown.changed(function () {
            self.selectedCombination = self.dropdown.value();
            self.draw(); // Redraw the plot with the new selection
        });
    };

    this.destroy = function () {
        // Remove the dropdown when switching visualizations
        this.dropdown.remove();
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

        // Get the selected data combination
        var xData = this.data.getColumn(this.scoreCombinations[this.selectedCombination].x).map(Number);
        var yData = this.data.getColumn(this.scoreCombinations[this.selectedCombination].y).map(Number);
        var gender = this.data.getColumn('gender');

        // Define colors for different categories (e.g., gender)
        var colors = {
            'female': color(255, 105, 180),
            'male': color(0, 100, 255)
        };

        // Draw scatter plot for the selected pair of scores
        this.drawScatterPlot(xData, yData, this.selectedCombination, gender, colors);

        // Draw legend
        this.drawLegend(colors);
    };

    this.drawScatterPlot = function (xData, yData, plotTitle, categories, colors) {
        // Draw axes
        this.drawAxes();

        // Draw axis labels
        this.drawAxisLabels(plotTitle);

        // Draw grid lines
        if (this.layout.grid) {
            this.drawGridLines();
        }

        // Draw scatter plot points
        for (var i = 0; i < xData.length; i++) {
            var x = map(xData[i], 0, 100, this.layout.leftMargin, this.layout.rightMargin);
            var y = map(yData[i], 0, 100, this.layout.bottomMargin, this.layout.topMargin);
            var categoryColor = colors[categories[i]];

            fill(categoryColor);
            noStroke();
            ellipse(x, y, 6, 6);
        }

        // Draw axis ticks and labels
        this.drawAxisTicks();
    };

    this.drawAxes = function () {
        stroke(0);
        strokeWeight(1);

        // X-axis
        line(this.layout.leftMargin, this.layout.bottomMargin, this.layout.rightMargin, this.layout.bottomMargin);

        // Y-axis
        line(this.layout.leftMargin, this.layout.topMargin, this.layout.leftMargin, this.layout.bottomMargin);
    };

    this.drawAxisLabels = function (plotTitle) {
        textSize(14);
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);

        // X-axis label
        text(this.xAxisLabels[plotTitle],
            this.layout.leftMargin + this.layout.plotWidth() / 2,
            this.layout.bottomMargin + this.layout.marginSize * 0.7);

        // Y-axis label
        push();
        translate(this.layout.leftMargin - this.layout.marginSize * 0.7, this.layout.topMargin + this.layout.plotHeight() / 2);
        rotate(-HALF_PI);
        text(this.yAxisLabels[plotTitle], 0 , -20);
        pop();
    };

    this.drawAxisTicks = function () {
        textSize(12);
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);

        // X-axis ticks
        for (let i = 0; i <= 5; i++) {
            let xValue = i * 20;
            let xPos = map(xValue, 0, 100, this.layout.leftMargin, this.layout.rightMargin);
            line(xPos, this.layout.bottomMargin - 5, xPos, this.layout.bottomMargin + 5);
            text(xValue, xPos, this.layout.bottomMargin + 20);
        }

        // Y-axis ticks
        for (let i = 0; i <= 5; i++) {
            let yValue = i * 20;
            let yPos = map(yValue, 0, 100, this.layout.bottomMargin, this.layout.topMargin);
            line(this.layout.leftMargin - 5, yPos, this.layout.leftMargin + 5, yPos);
            text(yValue, this.layout.leftMargin - 25, yPos);
        }
    };

    this.drawGridLines = function () {
        stroke(200);
        strokeWeight(0.5);

        // Vertical grid lines
        for (let i = 1; i < 5; i++) {
            let xValue = i * 20;
            let xPos = map(xValue, 0, 100, this.layout.leftMargin, this.layout.rightMargin);
            line(xPos, this.layout.bottomMargin, xPos, this.layout.topMargin);
        }

        // Horizontal grid lines
        for (let i = 1; i < 5; i++) {
            let yValue = i * 20;
            let yPos = map(yValue, 0, 100, this.layout.bottomMargin, this.layout.topMargin);
            line(this.layout.leftMargin, yPos, this.layout.rightMargin, yPos);
        }
    };

    this.drawLegend = function (colors) {
        let legendX = this.layout.rightMargin + 30;
        let legendY = this.layout.topMargin ;

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
        textAlign(CENTER, CENTER);
        textSize(20);
        text(this.title,
            this.layout.leftMargin + this.layout.plotWidth() / 2,
            this.layout.topMargin - this.layout.marginSize * 0.8 - 80);
    };
}
