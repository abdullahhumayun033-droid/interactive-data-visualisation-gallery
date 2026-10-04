function RadarChart() {
    this.name = 'Covid Students Data : Radar Chart';
    this.id = 'radar-chart';
    this.layout = {
        centerX1: width / 4,  // Center for the first chart
        centerY: height / 2,
        centerX2: (3 * width) / 4,  // Center for the second chart
        radius: min(width, height) / 4,
        numAxes: 6
    };

    this.colorMap = {
        'Group 1': [255, 0, 0, 100],  // Red with opacity
        'Group 2': [0, 0, 255, 100]   // Blue with opacity
    };

    this.loaded = false;

    this.preload = function() {
        var self = this;
        this.data = loadTable('./data/covidstudent.csv', 'csv', 'header', function(table) {
            self.loaded = true;
            self.cleanData();
        });
    };

    this.cleanData = function() {
        var numericColumns = [
            'Time spent on Online Class',
            'Time spent on self study',
            'Time spent on fitness',
            'Time spent on sleep',
            'Time spent on social media',
            'Time spent on TV'
        ];

        for (var r = 0; r < this.data.getRowCount(); r++) {
            for (var c = 0; c < numericColumns.length; c++) {
                var value = this.data.getString(r, numericColumns[c]);
                if (isNaN(value) || value.trim() === '') {
                    this.data.setNum(r, numericColumns[c], 0);
                }
            }
        }
    };

    this.setup = function() {
        textSize(16);
    };

    this.draw = function() {
        if (!this.loaded) {
            console.log('Data not yet loaded');
            return;
        }

        background(255);

        // Draw the chart title
        this.drawChartTitle('Comparative Radar Analysis of Time Spent on Activities by Age Groups During COVID-19');

        var activities = [
            'Time spent on Online Class',
            'Time spent on self study',
            'Time spent on fitness',
            'Time spent on sleep',
            'Time spent on social media',
            'Time spent on TV'
        ];

        var group1Data = this.getGroupData('Age of Subject', 21, activities);
        var group2Data = this.getGroupData('Age of Subject', 20, activities);

        // Debugging output for group data
        console.log("Group 1 Data (Age 21):", group1Data);
        console.log("Group 2 Data (Age 20):", group2Data);

        // Draw the first radar chart
        if (group1Data.every(this.isValidNumber)) {
            this.drawRadarChart(group1Data, this.colorMap['Group 1'], this.layout.centerX1, 'Age Group: 21');
        } else {
            console.log('Error: Invalid data in Group 1');
        }

        // Draw the second radar chart
        if (group2Data.every(this.isValidNumber)) {
            this.drawRadarChart(group2Data, this.colorMap['Group 2'], this.layout.centerX2, 'Age Group: 20');
        } else {
            console.log('Error: Invalid data in Group 2');
        }

        // Draw axes for both charts
        this.drawAxes(activities, this.layout.centerX1);
        this.drawAxes(activities, this.layout.centerX2);
    };

    this.getGroupData = function(groupColumn, groupValue, activities) {
        var groupData = [];
        var filteredRows = this.data.findRows(groupValue.toString(), groupColumn);

        for (var i = 0; i < activities.length; i++) {
            var activity = activities[i];
            var activityData = filteredRows.map(function(row) {
                var num = row.getNum(activity);
                return !isNaN(num) ? num : null;
            }).filter(val => val !== null);

            var average = activityData.length > 0 ? activityData.reduce((a, b) => a + b, 0) / activityData.length : 0;
            groupData.push(average);
        }
        return groupData;
    };

    this.drawRadarChart = function(groupData, groupColor, centerX, label) {
        fill(groupColor[0], groupColor[1], groupColor[2], groupColor[3]);
        noStroke();
        beginShape();
        for (var i = 0; i < groupData.length; i++) {
            var angle = TWO_PI / this.layout.numAxes * i;
            var radius = this.mapActivityToRadius(groupData[i]);
            var x = centerX + cos(angle) * radius;
            var y = this.layout.centerY + sin(angle) * radius;
            vertex(x, y);
        }
        endShape(CLOSE);

        // Draw the label below the radar chart
        fill(0);
        textAlign(CENTER, TOP);
        textSize(16);
        text(label, centerX, this.layout.centerY + this.layout.radius + 20);
    };

    this.mapActivityToRadius = function(value) {
        // Example: Amplify differences by mapping to a wider range
        return map(value, 0, 10, 0, this.layout.radius * 1.3);
    };


    this.drawAxes = function(activities, centerX) {
        stroke(0);
        for (var i = 0; i < this.layout.numAxes; i++) {
            var angle = TWO_PI / this.layout.numAxes * i;
            var x = centerX + cos(angle) * this.layout.radius;
            var y = this.layout.centerY + sin(angle) * this.layout.radius;
            line(centerX, this.layout.centerY, x, y);

            textAlign(CENTER, CENTER);
            textSize(12);
            text(activities[i], x + (x > centerX ? 20 : -20), y);
        }

        noFill();
        stroke(150);
        for (var j = 1; j <= 5; j++) {
            ellipse(centerX, this.layout.centerY, this.layout.radius * 2 * j / 5);
        }
    };

    this.drawChartTitle = function(title) {
        fill(0);
        textAlign(CENTER, TOP);
        textSize(24);
        text(title, width / 2, 40);
    };

    this.isValidNumber = function(value) {
        return typeof value === 'number' && !isNaN(value);
    };
}
