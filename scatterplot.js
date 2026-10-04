function CohortSizeVsAchievementRates() {
  this.name = 'Rates Data : ScatterPlot';
  this.id = 'cohort-size-vs-achievement-rates';
  this.title = 'Correlation of Cohort Size with Achievement Rates by Institution Type';
  this.xAxisLabel = 'Overall Cohort';
  this.yAxisLabel = 'Achievement Rate %';
  
  this.institutionTypes = []; // Array to hold institution types
  this.selectedInstitutionType = ''; // Selected institution type
  this.colors = [];
  this.filteredData = []; // Array to hold filtered valid data

  var marginSize = 35; // Size of the margins around the plot

  // Layout configuration
  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 150,
    topMargin: marginSize + 50,
    bottomMargin: height - marginSize * 2,
    pad: 5, // Padding between plot and margins
    plotWidth: function() { return this.rightMargin - this.leftMargin; },
    plotHeight: function() { return this.bottomMargin - this.topMargin; },
    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false; // Flag to check if data is loaded

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      function(table) { 
        self.loaded = true; 
        self.filterData(); // Filter data immediately after loading
        self.populateInstitutionTypes(); // Populate institution types
      }
    );
  };

  // Function to filter out invalid data
  this.filterData = function() {
    var cohortSizes = this.data.getColumn('Overall Cohort');
    var achievementRates = this.data.getColumn('Total Achievement Rate %');
    var institutionTypes = this.data.getColumn('Institution Type');

    this.filteredData = [];

    for (var i = 0; i < cohortSizes.length; i++) {
      var cohortSize = parseFloat(cohortSizes[i]);
      var achievementRate = parseFloat(achievementRates[i]);
      var institutionType = institutionTypes[i];

      if (!isNaN(cohortSize) && cohortSizes[i] !== "-" && !isNaN(achievementRate) && 
          (this.selectedInstitutionType === '' || this.selectedInstitutionType === institutionType)) {
        this.filteredData.push({
          cohortSize: cohortSize,
          achievementRate: achievementRate,
          institutionType: institutionType,
          color: this.getColor(institutionType) // Generate color based on institution type
        });
      }
    }
  };

  // Function to populate institution types
  this.populateInstitutionTypes = function() {
    this.institutionTypes = this.data.getColumn('Institution Type').filter((v, i, a) => a.indexOf(v) === i);
  };

  // Function to get color based on institution type
  this.getColor = function(institutionType) {
    if (!this.colors[institutionType]) {
      this.colors[institutionType] = color(random(0, 255), random(0, 255), random(0, 255));
    }
    return this.colors[institutionType];
  };

  // Setup function to initialize plot properties
  this.setup = function() {
    textSize(16); // Set text size for the plot
    // Colors are generated during filtering now

    // Create a dropdown for institution types
    this.institutionTypeDropdown = createSelect();
    this.institutionTypeDropdown.position(350, 10);
    this.institutionTypeDropdown.option('All');
    for (var i = 0; i < this.institutionTypes.length; i++) {
      this.institutionTypeDropdown.option(this.institutionTypes[i]);
    }
    this.institutionTypeDropdown.changed(() => {
      this.selectedInstitutionType = this.institutionTypeDropdown.value() === 'All' ? '' : this.institutionTypeDropdown.value();
      this.filterData(); // Re-filter data based on selected institution type
    });
  };
    // Function to destroy the dropdown
  this.destroy = function() {
    if (this.institutionTypeDropdown) {
      this.institutionTypeDropdown.remove();
      this.institutionTypeDropdown = null;
    }
  };

  // Draw function to plot the data
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawTitle(); // Draw plot title

    drawYAxisTickLabels(0, 100, this.layout, this.mapAchievementRateToHeight.bind(this), 0); // Draw Y axis tick labels
    drawAxis(this.layout); // Draw X and Y axes
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout); // Draw axis labels

    // Iterate through filtered data
    for (var i = 0; i < this.filteredData.length; i++) {
      var entry = this.filteredData[i];

      var x = this.mapCohortSizeToWidth(entry.cohortSize); // Map cohort size to X position
      var y = this.mapAchievementRateToHeight(entry.achievementRate); // Map achievement rate to Y position

      fill(entry.color); // Set fill color for the point
      ellipse(x, y, 10, 10); // Draw the data point
    }

    this.drawLegend(); // Draw the legend
  };

  // Draw the plot title
  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };

  // Map cohort size to X position
  this.mapCohortSizeToWidth = function(value) {
    return map(value, 0, max(this.filteredData.map(d => d.cohortSize)), this.layout.leftMargin, this.layout.rightMargin);
  };

  // Map achievement rate to Y position
  this.mapAchievementRateToHeight = function(value) {
    return map(value, 0, 100, this.layout.bottomMargin, this.layout.topMargin);
  };

  // Draw the legend
  this.drawLegend = function() {
    var legendX = this.layout.rightMargin + 20;
    var legendY = this.layout.topMargin;
    var legendSize = 10;
    var legendSpacing = 20;

    for (var institutionType in this.colors) {
      fill(this.colors[institutionType]);
      ellipse(legendX, legendY, legendSize, legendSize);
      fill(0);
      textAlign(LEFT, CENTER);
      text(institutionType, legendX + legendSize + 5, legendY);
      legendY += legendSpacing;
    }
  };
}
