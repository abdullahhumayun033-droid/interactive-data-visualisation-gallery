function AchievementRatesOverTime() {
  this.name = 'Rates Data : Line Chart';
  this.id = 'achievement-rates-over-time';
  this.title = 'Institutional Achievement Rates by Age: Trends Over Time';
  this.xAxisLabel = 'Age';
  this.yAxisLabel = 'Achievement Rate % (Grade A* to C)';

  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize + 50,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function() { return this.rightMargin - this.leftMargin; },
    plotHeight: function() { return this.bottomMargin - this.topMargin; },
    grid: true,
    numXTickLabels: 2,
    numYTickLabels: 8,
  };

  this.loaded = false;

  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      function(table) { self.loaded = true; }
    );
  };

  this.setup = function() {
    textSize(16);

    // Create a select dropdown for institutions
    this.institutionSelect = createSelect();
    this.institutionSelect.position(350, 10); // Position the dropdown

    // Get all unique institutions from the data
    var institutions = this.data.getColumn('Institution Name');
    var uniqueInstitutions = [...new Set(institutions)];
    uniqueInstitutions.sort();

    // Add options to the dropdown for each unique institution
    this.institutionSelect.option('Select an Institution'); // Default option
    for (let institution of uniqueInstitutions) {
      this.institutionSelect.option(institution);
    }

    // Call draw function when institution is changed
    this.institutionSelect.changed(() => this.draw());

    // Initial draw of the chart
    this.draw();
  };
// Function to destroy the dropdown
  this.destroy = function() {
    if (this.institutionSelect) {
      this.institutionSelect.remove();
      this.institutionSelect = null;
    }
  };
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Clear the background
    background(255);

    this.drawTitle();

    drawYAxisTickLabels(0, 100, this.layout, this.mapAchievementRateToHeight.bind(this), 0);
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    var selectedInstitution = this.institutionSelect.value();

    if (selectedInstitution === 'Select an Institution') {
      // No institution selected
      fill(0);
      textAlign(CENTER, CENTER);
      text('Please select an institution from the dropdown menu', width / 2, height / 2);
      return;
    }

    var ageAchievementRates = {};

    // Aggregate data by age for the selected institution
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      if (row.getString('Institution Name') === selectedInstitution) {
        var age = row.getString('Age');
        var achievementRateStr = row.getString('Achievement Rate % Grades A* to C');
        var achievementRate = parseFloat(achievementRateStr);

        if (!isNaN(achievementRate)) {
          if (!ageAchievementRates[age]) {
            ageAchievementRates[age] = [];
          }
          ageAchievementRates[age].push(achievementRate);
        }
      }
    }

    var averageAchievementRates = {};
    for (var age in ageAchievementRates) {
      var rates = ageAchievementRates[age];
      var sum = rates.reduce((a, b) => a + b, 0);
      averageAchievementRates[age] = rates.length > 0 ? sum / rates.length : 0;
    }

    var previous = null;
    var ageCategories = ['16-18', '19+'];

    for (var i = 0; i < ageCategories.length; i++) {
      var age = ageCategories[i];
      var achievementRate = averageAchievementRates[age];
      var current = { 'age': age, 'achievementRate': achievementRate };

      if (previous != null) {
        stroke(0);
        line(this.mapAgeToWidth(previous.age), this.mapAchievementRateToHeight(previous.achievementRate),
          this.mapAgeToWidth(current.age), this.mapAchievementRateToHeight(current.achievementRate));
      }

      drawXAxisTickLabel(current.age, this.layout, this.mapAgeToWidth.bind(this));

      previous = current;
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapAgeToWidth = function(value) {
    var ageCategories = ['16-18', '19+'];
    var index = ageCategories.indexOf(value);
    return map(index, 0, ageCategories.length - 1, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapAchievementRateToHeight = function(value) {
    return map(value, 0, 100, this.layout.bottomMargin, this.layout.topMargin);
  };
}
