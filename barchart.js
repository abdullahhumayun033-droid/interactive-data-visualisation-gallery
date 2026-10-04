function AchievementRatesByInstitution() {
  // Chart properties
  this.name='Rates Data : Bar Chart'
  this.title = 'Achievement Rates by Institution'; // Chart title
  this.id = 'achievement-rates-by-institution'; // Unique identifier
  this.loaded = false; // Data loaded flag
  this.pad = 100; // Padding for the chart edges
  this.barGap = 10; // Gap between bars

  // Preload function to load CSV data
  this.preload = function() {
    var self = this;
    this.data = loadTable(
      './data/rate.csv', 'csv', 'header',
      function(table) {
        self.loaded = true; // Set loaded flag to true when data is loaded
      }
    );
  };

  // Setup function
  this.setup = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

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

  // Draw function to render the chart
  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    // Extract columns from the loaded data
    var selectedInstitution = this.institutionSelect.value(); // Get the selected institution from the dropdown
    var institutions = this.data.getColumn('Institution Name');
    var successRates = this.data.getColumn('Total Achievement Rate %');

    // Convert successRates from strings to numbers
    successRates = stringsToNumbers(successRates);

    // Filter data based on selected institution
    var filteredData = [];
    for (var i = 0; i < institutions.length; i++) {
      if (selectedInstitution === 'Select an Institution' || institutions[i] === selectedInstitution) {
        filteredData.push({
          institution: institutions[i],
          successRate: successRates[i]
        });
      }
    }

    // Clear background and set stroke properties
    background(255);
    stroke(0);
    strokeWeight(1);

    if (selectedInstitution === 'Select an Institution') {
      // No institution selected
      fill(0);
      textAlign(CENTER, CENTER);
      text('Please select an institution from the dropdown menu', width / 2, height / 2);
      return;
    }

    // Calculate width of each bar based on available space
    var totalBarWidth = (width - 2 * this.pad - (filteredData.length - 1) * this.barGap);
    var barWidth = totalBarWidth / filteredData.length;

    // Calculate maximum success rate for scaling
    var maxSuccessRate = Math.max(...filteredData.map(item => item.successRate));

    // Draw bars for each success rate
    for (var j = 0; j < filteredData.length; j++) {
      var x = this.pad + j * (barWidth + this.barGap);

      // Get the success rate
      var successRate = filteredData[j].successRate;
      var y = map(successRate, 0, maxSuccessRate, height - this.pad, this.pad); // Map y-coordinate based on success rate
      var barHeight = height - this.pad - y; // Calculate bar height

      fill(100, 150, 255); // Set fill color
      rect(x, y, barWidth, barHeight); // Draw rectangle (bar) for the success rate

    }

    // Add axes, labels, and legend
    this.addAxes(filteredData.length, maxSuccessRate, selectedInstitution);
    this.addLabels(selectedInstitution);
  };

  // Function to add x-axis and y-axis
  this.addAxes = function(numBars, maxSuccessRate, selectedInstitution) {
    stroke(200);

    // Add x-axis
    line(this.pad, height - this.pad, width - this.pad, height - this.pad);

    // Add y-axis
    line(this.pad, height - this.pad, this.pad, this.pad);

    // Add y-axis labels
    textAlign(RIGHT);
    textSize(12);
    fill(0);
    for (var i = 0; i <= maxSuccessRate; i += 10) {
      var y = map(i, 0, maxSuccessRate, height - this.pad, this.pad);
      text(i, this.pad - 10, y + 5); // Display success rate values along y-axis
    }
  };

  // Function to add chart title and axis labels
  this.addLabels = function(selectedInstitution) {
    // Add chart title
    textAlign(CENTER);
    textSize(16);
    fill(0);
    text(this.title, width / 2, this.pad / 2);

    // Add x-axis label
    textAlign(CENTER);
    textSize(14);
    fill(0);
    text(selectedInstitution, width / 2, height - this.pad + 30);

    // Add y-axis label
    textAlign(CENTER);
    textSize(14);
    fill(0);
    push();
    translate(this.pad / 2, height / 2);
    rotate(-PI / 2);
    text('Achievement Rate (%)', 0, 0);
    pop();
  };
}

// Utility function to convert strings to numbers
function stringsToNumbers(array) {
  return array.map(Number);
}

// Utility function to calculate the average of an array
function average(array) {
  if (array.length === 0) return 0;
  var sum = array.reduce((acc, val) => acc + val, 0);
  return sum / array.length;
}
