function MentalHealthTreemap() {
    this.name = 'Mental Health Data : Treemap by Region';
    this.id = 'mental-health-treemap';

    this.layout = {
        leftMargin: 50,
        rightMargin: width - 50,
        topMargin: 130,  // Adjusted to make space for the title
        bottomMargin: height - 50,
    };

    this.loaded = false;
    this.regionDropdown = null;

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
        this.regionDropdown.position(340, 70);
        this.regionDropdown.option('All');
        for (let i = 0; i < this.regions.length; i++) {
            this.regionDropdown.option(this.regions[i]);
        }
        this.regionDropdown.changed(this.draw.bind(this));

        noLoop();
    };

    this.destroy = function () {
        this.regionDropdown.remove();
    };

    this.draw = function () {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        clear(); // Clear the canvas

        // Add the title
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(24);  // Title size
        text('Regional Breakdown of Mental Health Disorders: DALYs Treemap', width / 2, this.layout.topMargin - 90);

        var selectedRegion = this.regionDropdown.value();

        if (selectedRegion === 'All') {
            this.drawAllRegions();
        } else {
            this.drawRegion(selectedRegion);
        }

        this.drawLegend();
    };

    this.drawRegion = function (region) {
        var filteredData = this.data.findRows(region, 'Entity');

        if (filteredData.length === 0) {
            console.error(`No data found for region: ${region}`);
            return;
        }

        var disorders = [
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Depressive disorders',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Schizophrenia',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Bipolar disorder',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Eating disorders',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Anxiety disorders'
        ];

        var disorderLabels = [
            'Depressive Disorders',
            'Schizophrenia',
            'Bipolar Disorder',
            'Eating Disorders',
            'Anxiety Disorders'
        ];

        var disorderAbbr = [
            'DD',
            'SZ',
            'BD',
            'ED',
            'AD'
        ];

        var colors = [
            color(255, 99, 132, 180), // Red
            color(54, 162, 235, 180), // Blue
            color(75, 192, 192, 180), // Green
            color(255, 205, 86, 180), // Yellow
            color(153, 102, 255, 180)  // Purple
        ];

        var totalDALYs = 0;
        var disorderDALYs = [];
        for (var d = 0; d < disorders.length; d++) {
            var sumDALYs = filteredData.reduce((acc, row) => acc + row.getNum(disorders[d]), 0);
            disorderDALYs.push(sumDALYs);
            totalDALYs += sumDALYs;
        }

        var x = this.layout.leftMargin;
        var y = this.layout.topMargin;
        var widthAvailable = this.layout.rightMargin - this.layout.leftMargin;
        var heightAvailable = this.layout.bottomMargin - this.layout.topMargin;

        for (var d = 0; d < disorders.length; d++) {
            var areaRatio = disorderDALYs[d] / totalDALYs;
            var rectWidth = widthAvailable * areaRatio;
            var rectHeight = heightAvailable * areaRatio;

            fill(colors[d]);
            noStroke();
            rect(x, y, rectWidth, rectHeight);

            fill(0);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(`${disorderAbbr[d]}: ${nf(disorderDALYs[d], 0, 0)}`, x + rectWidth / 2, y + rectHeight / 2);

            if (x + rectWidth + rectWidth > this.layout.rightMargin) {
                x = this.layout.leftMargin;
                y += rectHeight;
            } else {
                x += rectWidth;
            }
        }
    };

    this.drawAllRegions = function () {
        var disorders = [
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Depressive disorders',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Schizophrenia',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Bipolar disorder',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Eating disorders',
            'DALYs (rate) - Sex: Both - Age: Age-standardized - Cause: Anxiety disorders'
        ];

        var disorderLabels = [
            'Depressive Disorders',
            'Schizophrenia',
            'Bipolar Disorder',
            'Eating Disorders',
            'Anxiety Disorders'
        ];

        var disorderAbbr = [
            'DD',
            'SZ',
            'BD',
            'ED',
            'AD'
        ];

        var colors = [
            color(255, 99, 132, 180), // Red
            color(54, 162, 235, 180), // Blue
            color(75, 192, 192, 180), // Green
            color(255, 205, 86, 180), // Yellow
            color(153, 102, 255, 180)  // Purple
        ];

        var totalDALYs = 0;
        var disorderDALYs = [];
        for (var d = 0; d < disorders.length; d++) {
            var sumDALYs = this.data.getColumn(disorders[d]).reduce((acc, val) => acc + parseFloat(val), 0);
            disorderDALYs.push(sumDALYs);
            totalDALYs += sumDALYs;
        }

        var x = this.layout.leftMargin;
        var y = this.layout.topMargin;
        var widthAvailable = this.layout.rightMargin - this.layout.leftMargin;
        var heightAvailable = this.layout.bottomMargin - this.layout.topMargin;

        for (var d = 0; d < disorders.length; d++) {
            var areaRatio = disorderDALYs[d] / totalDALYs;
            var rectWidth = widthAvailable * areaRatio;
            var rectHeight = heightAvailable * areaRatio;

            fill(colors[d]);
            noStroke();
            rect(x, y, rectWidth, rectHeight);

            fill(0);
            textSize(12);
            textAlign(CENTER, CENTER);
            text(`${disorderAbbr[d]}: ${nf(disorderDALYs[d], 0, 0)}`, x + rectWidth / 2, y + rectHeight / 2);

            if (x + rectWidth + rectWidth > this.layout.rightMargin) {
                x = this.layout.leftMargin;
                y += rectHeight;
            } else {
                x += rectWidth;
            }
        }
    };

    this.drawLegend = function () {
        var disorders = [
            'Depressive Disorders',
            'Schizophrenia',
            'Bipolar Disorder',
            'Eating Disorders',
            'Anxiety Disorders'
        ];

        var disorderAbbr = [
            'DD',
            'SZ',
            'BD',
            'ED',
            'AD'
        ];

        var colors = [
            color(255, 99, 132, 180), // Red
            color(54, 162, 235, 180), // Blue
            color(75, 192, 192, 180), // Green
            color(255, 205, 86, 180), // Yellow
            color(153, 102, 255, 180)  // Purple
        ];

        textSize(12);
        textAlign(LEFT, CENTER);
        for (var d = 0; d < disorders.length; d++) {
            fill(colors[d]);
            rect(width - 200, 280 + d * 25, 15, 15);

            fill(0);
            text(`${disorderAbbr[d]} - ${disorders[d]}`, width - 180, 287 + d * 25);
        }
    };
}
