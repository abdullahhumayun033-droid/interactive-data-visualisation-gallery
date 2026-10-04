function MentalHealthFocusedArea() {
    this.name = 'Mental Health: Area Chart';
    this.id = 'mental-health-focused-area';

    this.layout = {
        leftMargin: 100,
        rightMargin: width - 150,
        topMargin: 150,
        bottomMargin: height - 100,
        pad: 5,
        plotWidth: function () {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function () {
            return this.bottomMargin - this.topMargin;
        },
        numXTickLabels: 10,
        numYTickLabels: 8,
    };

    this.loaded = false;
    this.regionDropdown = null;
    this.sizeDropdown = null;

    this.preload = function () {
        var self = this;
        this.data = loadTable(
            './data/mental.csv', 'csv', 'header',
            function (table) {
                self.loaded = true;
                self.regions = [...new Set(table.getColumn('Entity'))]; // Extract unique regions
            });
    };

    this.setup = function () {
        textSize(16);

        // Create the dropdown for regions
        this.regionDropdown = createSelect();
        this.regionDropdown.position(350, 70);
        this.regionDropdown.option('All');
        for (let i = 0; i < this.regions.length; i++) {
            this.regionDropdown.option(this.regions[i]);
        }
        this.regionDropdown.changed(this.draw.bind(this));

        // Create the dropdown for disorder size
        this.sizeDropdown = createSelect();
        this.sizeDropdown.position(350, 90);
        this.sizeDropdown.option('Smaller Disorders');
        this.sizeDropdown.option('Larger Disorders');
        this.sizeDropdown.changed(this.draw.bind(this));

        noLoop();
    };

    this.destroy = function () {
        this.regionDropdown.remove();
        this.sizeDropdown.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        clear(); // Clear the canvas

        var selectedRegion = this.regionDropdown.value();
        var selectedSize = this.sizeDropdown.value();

        if (selectedRegion === 'All') {
            this.drawAllRegions(selectedSize);
        } else {
            this.drawRegion(selectedRegion, selectedSize);
        }
    };

    this.drawRegion = function (region, size) {
        var filteredData = this.data.findRows(region, 'Entity');

        if (filteredData.length === 0) {
            console.error(`No data found for region: ${region}`);
            return;
        }

        var years = filteredData.map(row => row.get('Year'));
        var uniqueYears = [...new Set(years)];

        // Define disorders based on selected size
        var disorders, disorderLabels, colors;
        if (size === 'Smaller Disorders') {
            disorders = [
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Eating disorders',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Anxiety disorders'
            ];
            disorderLabels = ['Eating Disorders', 'Anxiety Disorders'];
            colors = [
                color(255, 0, 0, 180), // Yellow
                color(153, 102, 255, 180)  // Purple
            ];
        } else {
            disorders = [
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Depressive disorders',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Schizophrenia',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Bipolar disorder'
            ];
            disorderLabels = ['Depressive Disorders', 'Schizophrenia', 'Bipolar Disorder'];
            colors = [
                color(255, 99, 132, 180), // Red
                color(54, 162, 235, 180), // Blue
                color(0, 255, 0, 180)  // Green
            ];
        }

        var maxDALY = 0;
        var disorderMaxes = disorders.map((disorder) => {
            return Math.max(...filteredData.map(row => row.getNum(disorder) || 0));
        });

        maxDALY = Math.max(...disorderMaxes);

        fill(0);
        textAlign(CENTER);
        textSize(16);
        text(`Mental Health Disorder DALYs Regional and Global Area Chart Analysis: ${size} (${region})`, width / 2, this.layout.topMargin - 100);

        textSize(16);
        fill(0);
        text('Year', width / 2, height - 40);

        push();
        translate(30, height / 2);
        rotate(-PI / 2);
        text('DALYs Rate', 0, 0);
        pop();

        for (var d = 0; d < disorders.length; d++) {
            beginShape();
            for (var y = 0; y < uniqueYears.length; y++) {
                var x = map(y, 0, uniqueYears.length - 1, this.layout.leftMargin, this.layout.rightMargin);

                var currentDisorderRate = 0;
                for (var i = 0; i < filteredData.length; i++) {
                    if (filteredData[i].get('Year') == uniqueYears[y]) {
                        currentDisorderRate = filteredData[i].getNum(disorders[d]) || 0;
                    }
                }

                var yPosCurrent = map(currentDisorderRate, 0, maxDALY, this.layout.bottomMargin, this.layout.topMargin);

                fill(colors[d]);
                noStroke();
                vertex(x, yPosCurrent);
            }
            vertex(this.layout.rightMargin, this.layout.bottomMargin);
            vertex(this.layout.leftMargin, this.layout.bottomMargin);
            endShape(CLOSE);
        }

        textSize(10);
        for (var y = 0; y < uniqueYears.length; y++) {
            var x = map(y, 0, uniqueYears.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            textAlign(CENTER);
            fill(0);
            text(uniqueYears[y], x, this.layout.bottomMargin + 20);
        }

        for (var i = 0; i <= this.layout.numYTickLabels; i++) {
            var y = map(i, 0, this.layout.numYTickLabels, this.layout.bottomMargin, this.layout.topMargin);
            var label = nf((i / this.layout.numYTickLabels) * maxDALY, 0, 0);
            textAlign(RIGHT);
            fill(0);
            text(label, this.layout.leftMargin - 15, y);
            stroke(200);
            line(this.layout.leftMargin, y, this.layout.rightMargin, y);
        }

        textSize(12);
        textAlign(LEFT);
        for (var d = 0; d < disorders.length; d++) {
            fill(colors[d]);
            rect(this.layout.rightMargin + 20, this.layout.topMargin + d * 20, 15, 15);
            fill(0);
            text(disorderLabels[d], this.layout.rightMargin + 40, this.layout.topMargin + d * 20 + 12);
        }
    };

    this.drawAllRegions = function (size) {
        var years = this.data.getColumn('Year');
        var uniqueYears = [...new Set(years)];

        var disorders, disorderLabels, colors;
        if (size === 'Smaller Disorders') {
            disorders = [
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Eating disorders',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Anxiety disorders'
            ];
            disorderLabels = ['Eating Disorders', 'Anxiety Disorders'];
            colors = [
                color(255, 0, 0, 180), // Red
                color(153, 102, 255, 180)  // Purple
            ];
        } else {
            disorders = [
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Depressive disorders',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Schizophrenia',
                'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Bipolar disorder'
            ];
            disorderLabels = ['Depressive Disorders', 'Schizophrenia', 'Bipolar Disorder'];
            colors = [
                color(255, 99, 132, 180), // Red
                color(54, 162, 235, 180), // Blue
                color(75, 192, 192, 180)  // Green
            ];
        }

        var maxDALY = 0;

        // Calculate the cumulative DALYs to set up the plot boundaries correctly
        for (var y = 0; y < uniqueYears.length; y++) {
            var cumulative = 0;
            for (var d = 0; d < disorders.length; d++) {
                for (var i = 0; i < this.data.getRowCount(); i++) {
                    if (this.data.getNum(i, 'Year') == uniqueYears[y]) {
                        cumulative += this.data.getNum(i, disorders[d]) || 0;
                    }
                }
            }
            if (cumulative > maxDALY) {
                maxDALY = cumulative;
            }
        }

        fill(0);
        textAlign(CENTER);
        textSize(16);
        text(`Mental Health Disorder DALYs Regional and Global Area Chart Analysis ${size} Disorders`, width / 2, this.layout.topMargin - 100);

        textSize(16);
        fill(0);
        text('Year', width / 2, this.layout.bottomMargin + 50);

        push();
        translate(this.layout.leftMargin - 70, height / 2);
        rotate(-PI / 2);
        text('Cumulative DALYs Rate', 0, 0);
        pop();

        var cumulativeData = {};

        // Calculate cumulative data for each disorder
        for (var d = 0; d < disorders.length; d++) {
            cumulativeData[disorders[d]] = [];
            for (var y = 0; y < uniqueYears.length; y++) {
                var cumulativeBelow = 0;
                for (var d2 = 0; d2 < d; d2++) {
                    for (var i = 0; i < this.data.getRowCount(); i++) {
                        if (this.data.getNum(i, 'Year') == uniqueYears[y]) {
                            cumulativeBelow += this.data.getNum(i, disorders[d2]) || 0;
                        }
                    }
                }

                var currentDisorderRate = 0;
                for (var i = 0; i < this.data.getRowCount(); i++) {
                    if (this.data.getNum(i, 'Year') == uniqueYears[y]) {
                        currentDisorderRate += this.data.getNum(i, disorders[d]) || 0;
                    }
                }

                cumulativeData[disorders[d]].push({
                    x: map(y, 0, uniqueYears.length - 1, this.layout.leftMargin, this.layout.rightMargin),
                    yTop: map(cumulativeBelow + currentDisorderRate, 0, maxDALY, this.layout.bottomMargin, this.layout.topMargin),
                    yBottom: map(cumulativeBelow, 0, maxDALY, this.layout.bottomMargin, this.layout.topMargin)
                });
            }
        }

        // Draw the areas
        for (var d = 0; d < disorders.length; d++) {
            beginShape();
            for (var y = 0; y < uniqueYears.length; y++) {
                var point = cumulativeData[disorders[d]][y];
                fill(colors[d]);
                noStroke();
                vertex(point.x, point.yTop);
            }
            for (var y = uniqueYears.length - 1; y >= 0; y--) {
                var point = cumulativeData[disorders[d]][y];
                vertex(point.x, point.yBottom);
            }
            endShape(CLOSE);
        }

        textSize(10);
        for (var y = 0; y < uniqueYears.length; y++) {
            var x = map(y, 0, uniqueYears.length - 1, this.layout.leftMargin, this.layout.rightMargin);
            textAlign(CENTER);
            fill(0);
            text(uniqueYears[y], x, this.layout.bottomMargin + 20);
        }

        for (var i = 0; i <= this.layout.numYTickLabels; i++) {
            var y = map(i, 0, this.layout.numYTickLabels, this.layout.bottomMargin, this.layout.topMargin);
            var label = nf((i / this.layout.numYTickLabels) * maxDALY, 0, 0);
            textAlign(RIGHT);
            fill(0);
            text(label, this.layout.leftMargin - 15, y);
            stroke(200);
            line(this.layout.leftMargin, y, this.layout.rightMargin, y);
        }

        textSize(12);
        textAlign(LEFT);
        for (var d = 0; d < disorders.length; d++) {
            fill(colors[d]);
            rect(this.layout.rightMargin + 20, this.layout.topMargin + d * 20, 15, 15);
            fill(0);
            text(disorderLabels[d], this.layout.rightMargin + 40, this.layout.topMargin + d * 20 + 12);
        }
    };
}