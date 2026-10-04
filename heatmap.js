function AchievementRatesHeatmap() {
    this.name = 'Rates Data : Heatmap';
    this.id = 'achievementRatesHeatmap';
    this.title = 'Achievement Rates Across Institution Types and Age Groups: Heatmap Visualization';
    this.xAxisLabel = 'Institution Type';
    this.yAxisLabel = 'Age Group';

    this.colors = [
        '#4CAF50', '#FFC107', '#FF5722', '#03A9F4', '#E91E63',
        '#9C27B0', '#673AB7', '#3F51B5', '#00BCD4', '#009688',
        '#8BC34A', '#CDDC39'
    ];

    var marginSize = 35;

    this.layout = {
        marginSize: marginSize,
        leftMargin: marginSize * 2,
        rightMargin: width - marginSize * 2,
        topMargin: marginSize * 2,
        bottomMargin: height - marginSize * 2,
        pad: 5,
        plotWidth: function() {
            return this.rightMargin - this.leftMargin;
        },
        plotHeight: function() {
            return this.bottomMargin - this.topMargin;
        },
        grid: true,
        numXTickLabels: 15,
        numYTickLabels: 15,
    };

    this.loaded = false;

    this.preload = function() {
        var self = this;
        console.log('Starting preload...');
        this.data = loadTable(
            './data/rate.csv', 'csv', 'header',
            function(table) {
                console.log('Data loaded');
                self.loaded = true;
            },
            function(err) {
                console.error('Error loading data:', err);
            }
        );
    };

    this.setup = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded in setup');
            return;
        }

        textSize(10);

        this.institutionTypes = [...new Set(this.data.getColumn('Institution Type'))];
        this.ageGroups = [...new Set(this.data.getColumn('Age'))];
        this.achievementRates = this.data.getColumn('Total Achievement Rate %').map(rate => parseFloat(rate) || 0);

        console.log('Institution Types:', this.institutionTypes);
        console.log('Age Groups:', this.ageGroups);
        console.log('Achievement Rates:', this.achievementRates);

        this.matrix = this.createMatrix();
        console.log('Matrix:', this.matrix);
    };

    this.destroy = function() {};

    this.createMatrix = function() {
        let matrix = {};
        for (let i = 0; i < this.data.getRowCount(); i++) {
            let institutionType = this.data.getString(i, 'Institution Type');
            let ageGroup = this.data.getString(i, 'Age');
            let rate = parseFloat(this.data.getString(i, 'Total Achievement Rate %')) || 0;

            if (!matrix[institutionType]) {
                matrix[institutionType] = {};
            }

            matrix[institutionType][ageGroup] = rate;
        }
        return matrix;
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded in draw');
            return;
        }

        this.drawTitle();

        let cols = this.institutionTypes.length;
        let rows = this.ageGroups.length;

        let cellWidth = this.layout.plotWidth() / cols;
        let cellHeight = this.layout.plotHeight() / rows;

        let maxValue = Math.max(...this.achievementRates);

        for (let col = 0; col < cols; col++) {
            for (let row = 0; row < rows; row++) {
                let institutionType = this.institutionTypes[col];
                let ageGroup = this.ageGroups[row];
                let rate = this.matrix[institutionType][ageGroup] || 0;

                let colorIndex = map(rate, 0, maxValue, 0, 1);

                console.log(`Institution Type: ${institutionType}, Age Group: ${ageGroup}, Rate: ${rate}, Color Index: ${colorIndex}`);

                fill(lerpColor(color(255), color(this.colors[col % this.colors.length]), colorIndex));
                rect(this.layout.leftMargin + col * cellWidth, this.layout.topMargin + row * cellHeight, cellWidth, cellHeight);

                fill(0);
                noStroke();
                textAlign(CENTER, CENTER);
                textSize(10);
                text(rate.toFixed(1), this.layout.leftMargin + col * cellWidth + cellWidth / 2, this.layout.topMargin + row * cellHeight + cellHeight / 2);
            }
        }

        for (let i = 0; i < this.institutionTypes.length; i++) {
            fill(0);
            noStroke();
            textAlign(CENTER, CENTER);
            textSize(10);
            text(this.institutionTypes[i], this.layout.leftMargin + i * cellWidth + cellWidth / 2, this.layout.bottomMargin + this.layout.marginSize / 2);
        }

        for (let i = 0; i < this.ageGroups.length; i++) {
            fill(0);
            noStroke();
            textAlign(RIGHT, CENTER);
            textSize(10);
            text(this.ageGroups[i], this.layout.leftMargin - this.layout.pad, this.layout.topMargin + i * cellHeight + cellHeight / 2);
        }

        this.drawXAxisLabel();
        this.drawYAxisLabel();
    };

    this.drawXAxisLabel = function() {
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);

        text(this.xAxisLabel,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.bottomMargin + (this.layout.marginSize / 1.5) + 30);
    };

    this.drawYAxisLabel = function() {
        push();
        translate(this.layout.leftMargin - (this.layout.marginSize * 1.5), 
                  (this.layout.plotHeight() / 2) + this.layout.topMargin);
        rotate(-PI / 2);
        fill(0);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(14);

        text(this.yAxisLabel, 0, 0);
        pop();
    };

    this.drawTitle = function() {
        fill(0);
        noStroke();
        textAlign('center', 'center');
        textSize(20);

        text(this.title,
            (this.layout.plotWidth() / 2) + this.layout.leftMargin,
            this.layout.topMargin - (this.layout.marginSize / 2));
    };
}
