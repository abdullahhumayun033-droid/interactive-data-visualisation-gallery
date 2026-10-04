function AchievementRatesByGCSEType() {
  this.name = 'Rates Data : Stacked Bar Chart';
  this.id = 'achievement-rates-by-gcse-type';
  this.title = 'Comparison of Achievement Rates Across Different GCSE Types';

  var marginSize = 50;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 120,
    topMargin: marginSize + 50,
    bottomMargin: height - marginSize * 2 - 100,
    pad: 5,
    plotWidth: function() { return this.rightMargin - this.leftMargin; },
    plotHeight: function() { return this.bottomMargin - this.topMargin; },
    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false;
  this.colors = {
    'All GCSE Type': color(0, 150, 0),
    'GCSE English': color(255, 165, 0),
    'GCSE Mathematics': color(0, 0, 255),
  };

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      function(table) { self.loaded = true; }
    );
  };

  this.setup = function() {
    textSize(16);
    this.gcseTypeSelect = createSelect();
    this.gcseTypeSelect.position(350, 10);
    var gcseTypes = this.data.getColumn('GCSE Type');
    var uniqueGCSETypes = [...new Set(gcseTypes)];
    uniqueGCSETypes.sort();
    this.gcseTypeSelect.option('Select GCSE Type');
    for (let type of uniqueGCSETypes) {
      this.gcseTypeSelect.option(type);
    }
    this.gcseTypeSelect.changed(() => this.draw());
    this.draw();
  };
    // Function to destroy the dropdown
  this.destroy = function() {
    if (this.gcseTypeSelect) {
      this.gcseTypeSelect.remove();
      this.gcseTypeSelect = null;
    }
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }
    background(255);
    this.drawTitle();
    var selectedGCSEType = this.gcseTypeSelect.value();
    if (selectedGCSEType === 'Select GCSE Type') {
      fill(0);
      textAlign(CENTER, CENTER);
      text('Please select a GCSE type from the dropdown menu', width / 2, height / 2);
      return;
    }
    var filteredData = this.data.findRows(selectedGCSEType, 'GCSE Type');
    if (!Array.isArray(filteredData) || filteredData.length === 0) {
      console.error('Filtered data is not valid:', filteredData);
      return;
    }

    var institutionNames = filteredData.map(row => row.getString('Institution Name'));
    var achievementRates = filteredData.map(row => parseFloat(row.getString('Total Achievement Rate %')));

    var counts = {};
    for (var i = 0; i < institutionNames.length; i++) {
      var institution = institutionNames[i];
      var rate = achievementRates[i];
      if (!counts[institution]) {
        counts[institution] = [];
      }
      counts[institution].push(rate);
    }

    var averageAchievementRates = {};
    for (var institution in counts) {
      var rates = counts[institution];
      var averageRate = rates.reduce((a, b) => a + b, 0) / rates.length;
      averageAchievementRates[institution] = averageRate;
    }

    var x = this.layout.leftMargin;
    var barWidth = this.layout.plotWidth() / Object.keys(averageAchievementRates).length;

    var institutions = Object.keys(averageAchievementRates);
    var displayedInstitutions = Math.floor(this.layout.plotWidth() / 100); // Only show labels at intervals based on available width

    for (var i = 0; i < institutions.length; i++) {
      var institution = institutions[i];
      var rate = averageAchievementRates[institution];
      var barHeight = map(rate, 0, 100, 0, this.layout.plotHeight());

      fill(this.colors[selectedGCSEType] || color(150));
      rect(x, this.layout.bottomMargin - barHeight, barWidth * 0.8, barHeight); // Reduced width for better spacing

      if (i % Math.ceil(institutions.length / displayedInstitutions) == 0) {
        fill(0);
        textSize(8);
        textAlign(RIGHT, CENTER);
        push();
        translate(x + (barWidth * 0.4) + 80, this.layout.bottomMargin + 10);
        rotate(-PI / 4);
        text(institution, 0, 0);
        pop();
      }
      x += barWidth; // Adding spacing between bars
    }

    textAlign(CENTER);
    textSize(14);
    fill(0);
    push();
    translate(this.layout.leftMargin - 40, this.layout.topMargin + this.layout.plotHeight() / 2);
    rotate(-HALF_PI);
    text('Achievement Rate %', 0, 0);
    pop();
    this.drawLegend();
  };

  this.drawLegend = function() {
    var legendX = this.layout.rightMargin + 10;
    var legendY = this.layout.topMargin;
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14); // Increased legend text size for better readability
    text("Legend:", legendX, legendY);
    legendY += 20;
    for (var gcse in this.colors) {
      fill(this.colors[gcse]);
      rect(legendX, legendY, 15, 15);
      fill(0);
      text(gcse, legendX + 20, legendY + 8);
      legendY += 20;
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };
}

// Utility function to convert strings to numbers (not currently used)
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the average of an array (not currently used)
function average(array) {
  if (array.length === 0) return 0;
  var sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}
