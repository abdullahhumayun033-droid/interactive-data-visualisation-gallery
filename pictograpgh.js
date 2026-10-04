function AchievementRatePictograph() {
  // Name for the visualisation to appear in the menu bar.
  this.name = 'Rates Data : Pairwise Bar Chart';

  // Each visualisation must have a unique ID with no special characters.
  this.id = 'achievement-rate-pictograph';

  // Title to display above the plot.
  this.title = 'Institutional Achievement Rates: Comparative Bar Visualization';

  // Names for each axis.
  this.xAxisLabel = 'Institution';
  this.yAxisLabel = 'Achievement Rate %';

  this.colors = [];
  this.institutionTypes = {};
  this.legendDropdown = null;

  const marginSize = 35;
  const maxInstitutions = 20; // Maximum number of institutions to display at once
  let startInstitutionIndex = 0;

  // Layout object to store all common plot layout parameters and methods.
  this.layout = {
    marginSize: marginSize,

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize - 100,
    topMargin: marginSize + 50,
    bottomMargin: height - marginSize * 2,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,

    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      // Callback function to set the value this.loaded to true.
      function(table) {
        self.loaded = true;
      });
  };

  this.setup = function() {
    // Font defaults.
    textSize(16);

    console.log(this.data.columns);

    // Assign a color to each institution
    for (var i = 0; i < this.data.getRowCount(); i++) {
      var institution = this.data.getString(i, "Institution Name");
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
      this.institutionTypes[institution] = this.colors[i];
    }

    // Find min and max percentage for mapping to canvas height.
    this.minPercentage = 0; // Adjust according to your data
    this.maxPercentage = 100; // Adjust according to your data

    // Create legend drop-down menu
    this.legendDropdown = createSelect();
    this.legendDropdown.position(this.layout.rightMargin - 550, this.layout.topMargin - 60);
    this.legendDropdown.option('Select Institution');
    for (const institution in this.institutionTypes) {
      this.legendDropdown.option(institution);
    }

    // Add event listener to dropdown
    this.legendDropdown.changed(() => this.updateGraph());
  };

  this.destroy = function() {
    // Remove the dropdown menu when the visualisation is destroyed
    if (this.legendDropdown) {
      this.legendDropdown.remove();
    }
  };

  this.updateGraph = function() {
    const selectedInstitution = this.legendDropdown.value();
    if (selectedInstitution && selectedInstitution !== 'Select Institution') {
      let selectedInstitutionIndex = -1;
      for (let i = 0; i < this.data.getRowCount(); i++) {
        if (this.data.getString(i, 'Institution Name') === selectedInstitution) {
          selectedInstitutionIndex = i;
          break;
        }
      }

      if (selectedInstitutionIndex !== -1) {
        startInstitutionIndex = Math.max(0, selectedInstitutionIndex - Math.floor(maxInstitutions / 2));
        startInstitutionIndex = Math.min(startInstitutionIndex, this.data.getRowCount() - maxInstitutions);
      }

      this.draw();
    }
  };

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Draw the title above the plot.
    this.drawTitle();

    // Draw all y-axis labels.
    drawYAxisTickLabels(this.minPercentage,
      this.maxPercentage,
      this.layout,
      this.mapPercentageToHeight.bind(this),
      0);

    // Draw x and y axis.
    drawAxis(this.layout);

    // Draw x and y axis labels.
    drawAxisLabels(this.xAxisLabel,
      this.yAxisLabel,
      this.layout);

    // Plot all data between startYear and endYear using the width
    // of the canvas minus margins.
    const endInstitutionIndex = Math.min(this.data.getRowCount(), startInstitutionIndex + maxInstitutions);

    // The number of x-axis labels to skip so that only
    // numXTickLabels are drawn.
    const xLabelSkip = ceil((endInstitutionIndex - startInstitutionIndex) / this.layout.numXTickLabels);

    // Loop over all rows and draw bars for each institution.
    for (var i = startInstitutionIndex; i < endInstitutionIndex; i++) {
      var row = this.data.getRow(i);
      var institution = row.getString("Institution Name");
      var percentage = row.getNum("Achievement Rate % Grades A* to C");

      // Use the color assigned to each institution
      fill(this.institutionTypes[institution]);

      var barWidth = this.layout.plotWidth() / (endInstitutionIndex - startInstitutionIndex);
      var x = this.layout.leftMargin + ((i - startInstitutionIndex) * barWidth);
      var y = this.mapPercentageToHeight(percentage);
      var barHeight = this.layout.bottomMargin - y;
      rect(x, y, barWidth, barHeight);

      // Add an outline to highlight the selected institution's bar
      if (institution === this.legendDropdown.value()) {
        stroke(0);
        strokeWeight(2);
        noFill();
        rect(x, y, barWidth, barHeight);
        noStroke();
      }

      // No x-axis tick labels
    }

    // Draw legend
    this.drawLegend();
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');

    text(this.title,
      (this.layout.plotWidth() / 2) + this.layout.leftMargin,
      this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.drawLegend = function() {
    const selectedInstitution = this.legendDropdown.value();
    if (selectedInstitution && selectedInstitution !== 'Select Institution') {
      const legendX = this.layout.rightMargin - 120;
      const legendY = this.layout.topMargin + 30;
      const legendRectSize = 15;

      fill(this.institutionTypes[selectedInstitution]);
      rect(legendX, legendY, legendRectSize, legendRectSize);

      fill(0);
      noStroke();
      textAlign(LEFT, CENTER);
      textSize(12);
      text(selectedInstitution, legendX + legendRectSize + 5, legendY + legendRectSize / 2);
    }
  };

  this.mapPercentageToHeight = function(value) {
    return map(value,
      this.minPercentage,
      this.maxPercentage,
      this.layout.bottomMargin, // Smaller percentage at bottom.
      this.layout.topMargin); // Bigger percentage at top.
  };
}

function drawYAxisTickLabels(min, max, layout, mapFunction, decimalPlaces) {
  var range = max - min;
  var interval = range / layout.numYTickLabels;

  for (var i = 0; i <= layout.numYTickLabels; i++) {
    var value = min + (i * interval);
    var y = mapFunction(value);

    noStroke();
    fill(0);
    textAlign(RIGHT, CENTER);
    text(value.toFixed(decimalPlaces), layout.leftMargin - layout.pad, y);
  }
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  // No x-axis tick labels
}

function drawAxis(layout) {
  stroke(0);
  line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin); // y-axis
  line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin); // x-axis
}

function drawAxisLabels(xLabel, yLabel, layout) {
  fill(0);
  noStroke();
  textAlign('center', 'center');

  // x-axis
  text(xLabel,
    (layout.plotWidth() / 2) + layout.leftMargin,
    layout.bottomMargin + (layout.marginSize * 1.5));

  // y-axis
  push();
  translate(layout.leftMargin - (layout.marginSize * 1.5), layout.topMargin + (layout.plotHeight() / 2));
  rotate(-PI / 2);
  text(yLabel, 0, 0);
  pop();
}
