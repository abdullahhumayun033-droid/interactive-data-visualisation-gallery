function DonutChartAchievementRates() {
  this.name = 'Achievement Rates : Donut Chart';
  this.id = 'donut-chart-achievement-rates';
  this.title = 'Achievement Rates by Institution Type: Donut Chart Analysis Across Age Groups';

  var marginSize = 50;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 180,
    topMargin: marginSize + 90,
    bottomMargin: height - marginSize * 2 - 100,
    pad: 5,
    plotWidth: function() { return this.rightMargin - this.leftMargin; },
    plotHeight: function() { return this.bottomMargin - this.topMargin; },
  };

  this.loaded = false;
  this.colors = {
    'General FE and Tertiary College': color(0, 150, 0),
    'Other Institution Type': color(255, 165, 0),
    'Sixth Form College': color(0, 0, 255),
    'Special College': color(255, 0, 0),
    'Private Sector Public Funded': color(0, 255, 255),
    'Other Public Funded': color(255, 0, 255),
    'Schools': color(128, 0, 128),
    'All Institution Type': color(128, 128, 0),
    // Add more institution types and colors as needed
  };

  this.ageGroups = []; // Array to hold age groups
  this.selectedAgeGroup = ''; // Selected age group

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      function(table) {
        console.log('Data loaded');
        self.loaded = true;
        self.filterData(); // Filter data immediately after loading
        self.populateAgeGroups(); // Populate age groups
      }
    );
  };

  // Function to filter out invalid data
  this.filterData = function() {
    var institutionTypes = this.data.getColumn('Institution Type');
    var achievementRates = this.data.getColumn('Total Achievement Rate %');
    var ages = this.data.getColumn('Age');

    this.filteredData = [];

    for (var i = 0; i < institutionTypes.length; i++) {
      var institutionType = institutionTypes[i];
      var achievementRate = parseFloat(achievementRates[i]);
      var age = ages[i];

      if (!isNaN(achievementRate) && 
          (this.selectedAgeGroup === '' || this.selectedAgeGroup === age)) {
        this.filteredData.push({
          institutionType: institutionType,
          achievementRate: achievementRate,
          age: age,
          color: this.colors[institutionType] || color(150) // Default color if not defined
        });
      }
    }
  };

  // Function to populate age groups
  this.populateAgeGroups = function() {
    this.ageGroups = this.data.getColumn('Age').filter((v, i, a) => a.indexOf(v) === i).sort();
  };

  this.setup = function() {
    console.log('Setting up the chart...');
    textSize(16);
      

    // Create a dropdown for age groups
    this.ageSelect = createSelect();
    this.ageSelect.position(350, 10);
    this.ageSelect.option('select age group');
    for (var i = 0; i < this.ageGroups.length; i++) {
      this.ageSelect.option(this.ageGroups[i]);
    }
    this.ageSelect.changed(() => {
      this.selectedAgeGroup = this.ageSelect.value() === 'select age group' ? '' : this.ageSelect.value();
      this.filterData(); // Re-filter data based on selected age group
      this.draw(); // Redraw the chart
    });

    this.draw();
  };
// Function to destroy the dropdown
  this.destroy = function() {
    if (this.ageSelect) {
      this.ageSelect.remove();
      this.ageSelect = null;
    }
  };
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }
    background(255);
    this.drawTitle();

    if (this.selectedAgeGroup === '') {
      fill(0);
      textAlign(CENTER, CENTER);
      text('Please select an age group from the dropdown menu', width / 2, height / 2);
      return;
    }

    var counts = {};
    for (var i = 0; i < this.filteredData.length; i++) {
      var entry = this.filteredData[i];
      var type = entry.institutionType;
      var rate = entry.achievementRate;
      if (!counts[type]) {
        counts[type] = 0;
      }
      counts[type] += rate;
    }

    var totalRates = Object.values(counts).reduce((a, b) => a + b, 0);

    var startAngle = 0;
    var cx = this.layout.leftMargin + this.layout.plotWidth() / 2;
    var cy = this.layout.topMargin + this.layout.plotHeight() / 2;
    var radius = Math.min(this.layout.plotWidth() + 100, this.layout.plotHeight()) / 3 + 100;

    for (var type in counts) {
      var rate = counts[type];
      var angle = map(rate, 0, totalRates, 0, TWO_PI);

      fill(this.colors[type] || color(150));
      arc(cx, cy, radius * 2, radius * 2, startAngle, startAngle + angle, PIE);
      startAngle += angle;
    }

    fill(255);
    ellipse(cx, cy, radius * 1.2, radius * 1.2); // Create donut hole

    this.drawLegend();
  };

  this.drawLegend = function() {
    var legendX = this.layout.rightMargin + 10;
    var legendY = this.layout.topMargin;
    fill(0);
    textAlign(LEFT, CENTER);
    textSize(14);
    text("Legend:", legendX, legendY);
    legendY += 20;
    for (var type in this.colors) {
      fill(this.colors[type]);
      rect(legendX, legendY, 15, 15);
      fill(0);
      text(type, legendX + 20, legendY + 8);
      legendY += 20;
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2) - 100);
  };
}
