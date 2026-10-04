function EmissionsVisualization() {

    this.name = 'Gas Data : Bar Chart';

    this.id = 'emissions-by-region';

    this.layout = {
        leftMargin: 150, // Increased margin for better alignment
        rightMargin: 100, // Added some margin on the right
        topMargin: 100, // Space for the title
        bottomMargin: 70, // Increased bottom margin for better spacing
        pad: 15, // Increased padding for better separation of bars

        plotWidth: function() {
            return width - this.leftMargin - this.rightMargin;
        }
    };

    this.loaded = false;

    this.co2Colour = color(255, 80, 80); // Softer Red for CO2
    this.ghgColour = color(80, 80, 255); // Softer Blue for Greenhouse Gas

    this.preload = function() {
        var self = this;
        this.data = loadTable(
            './data/gas.csv', 'csv', 'header',
            function(table) {
                self.loaded = true;
                console.log('Data loaded successfully');
            },
            function() {
                console.error('Failed to load data');
            }
        );
    };

    this.setup = function() {
        textSize(18);
        if (this.loaded) {
            this.regions = [...new Set(this.data.getColumn('Region'))];
            console.log('Regions:', this.regions);
            this.selectedRegion = this.regions[0];
            this.createDropdown();
        } else {
            console.error('Data not loaded, setup aborted');
        }
    };

    this.createDropdown = function() {
        let self = this;
        this.dropdown = createSelect();
        this.dropdown.position(400, 60);
        this.regions.forEach(function(region) {
            self.dropdown.option(region);
        });
        this.dropdown.changed(function() {
            self.selectedRegion = self.dropdown.value();
            console.log('Selected region:', self.selectedRegion);
            self.draw();
        });
    };

    this.destroy = function() {
        if (this.dropdown) {
            this.dropdown.remove();
        }
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255);

        // Draw the chart title
        textAlign(CENTER, CENTER);
        textSize(24);
        text('CO2 and GreenHouse Gas Emissions by Region', width / 2, this.layout.topMargin / 2);

        var regionData = this.data.findRow(this.selectedRegion, 'Region');

        if (!regionData) {
            console.log('No data found for the selected region');
            return;
        }

        var co2Emission = parseFloat(regionData.getString('CO2 Emissions (Mt)')) || 0;
        var ghgEmission = parseFloat(regionData.getString('Greenhouse Gas Emissions (Mt)')) || 0;

        // Draw grid lines for better readability
        stroke(220);
        strokeWeight(1);
        let gridY = (height - this.layout.bottomMargin + this.layout.topMargin) / 2;
        line(this.layout.leftMargin, gridY, width - this.layout.rightMargin, gridY);

        var lineY = (height + this.layout.topMargin - this.layout.bottomMargin) / 2;

        // Draw CO2 emissions bar
        fill(this.co2Colour);
        let co2BarWidth = this.mapValueToWidth(co2Emission);
        if (co2BarWidth > 0) {
            rect(this.layout.leftMargin, lineY - 40, co2BarWidth, 30);
        }

        // Draw Greenhouse Gas emissions bar
        fill(this.ghgColour);
        let ghgBarWidth = this.mapValueToWidth(ghgEmission);
        if (ghgBarWidth > 0) {
            rect(this.layout.leftMargin, lineY + 10, ghgBarWidth, 30);
        }

        // Draw the Y-axis line
        stroke(150);
        strokeWeight(2); // Increased weight for better visibility
        line(this.layout.leftMargin, this.layout.topMargin, this.layout.leftMargin, height - this.layout.bottomMargin);

        // Draw the X-axis labels and ticks
        this.drawXAxisLabels();

        // Draw legend
        this.drawLegend();
    };

    this.mapValueToWidth = function(value) {
        let co2Values = this.data.getColumn('CO2 Emissions (Mt)').map(Number).filter(v => !isNaN(v));
        let ghgValues = this.data.getColumn('Greenhouse Gas Emissions (Mt)').map(Number).filter(v => !isNaN(v));
        let maxValue = max(co2Values.concat(ghgValues));
        if (maxValue > 0) {
            return map(value, 0, maxValue, 0, this.layout.plotWidth());
        }
        return 0;
    };

    this.drawXAxisLabels = function() {
        let maxValue = this.getMaxValue();
        let numTicks = 5;
        let tickSpacing = this.layout.plotWidth() / numTicks;

        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, TOP);

        for (let i = 0; i <= numTicks; i++) {
            let x = this.layout.leftMargin + i * tickSpacing;
            let value = int(map(i, 0, numTicks, 0, maxValue));
            text(value + ' Mt', x, height - this.layout.bottomMargin + 10);
            stroke(200);
            line(x, this.layout.topMargin, x, height - this.layout.bottomMargin);
        }
    };

    this.getMaxValue = function() {
        let co2Values = this.data.getColumn('CO2 Emissions (Mt)').map(Number).filter(v => !isNaN(v));
        let ghgValues = this.data.getColumn('Greenhouse Gas Emissions (Mt)').map(Number).filter(v => !isNaN(v));
        return max(co2Values.concat(ghgValues));
    };

    this.drawLegend = function() {
        let legendX = width - 210; // Increased spacing for better alignment
        let legendY = 30;
        let legendSpacing = 20;

        fill(this.co2Colour);
        rect(legendX, legendY, 10, 10);
        fill(0);
        textSize(8);
        textAlign(LEFT, CENTER);
        text('CO2 Emissions', legendX + 30, legendY + 5);

        fill(this.ghgColour);
        rect(legendX, legendY + legendSpacing, 10, 10);
        fill(0);
        textSize(8);
        textAlign(LEFT, CENTER);
        text('Greenhouse Gas Emissions', legendX + 30, legendY + 5+ legendSpacing);
    };
}
