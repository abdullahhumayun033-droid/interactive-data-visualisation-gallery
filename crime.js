function CrimeSankeyDiagram() {
  this.name = 'Crime Data : Line Chart';
  this.id = 'crime-sankey-diagram';
  this.title = 'District-Wise Crime Analysis: Line Chart Visualization of Crime Types';
  this.xAxisLabel = 'Districts';
  this.yAxisLabel = 'Crime Types';

  this.colors = [];
  var marginSize = 35;

  this.layout = {
    marginSize: marginSize,
    leftMargin: marginSize * 2 + 50,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: height - marginSize * 2,
    pad: 5,
    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },
    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },
    grid: true,
    numXTickLabels: 10,
    numYTickLabels: 8,
  };

  this.loaded = false;

  this.preload = function() {
    var self = this;
    console.log("Attempting to load data...");
    this.data = loadTable(
      './data/crime_data.csv', 'csv', 'header',
      function(table) {
        console.log("Data loaded successfully:", table);
        self.loaded = true;
      },
      function(error) {
        console.error("Error loading data:", error);
      }
    );
  };

  this.setup = function() {
    textSize(16);
    console.log(this.data.columns);

    // Find all unique districts
    this.districts = [...new Set(this.data.getColumn('District').map(Number))].sort((a, b) => a - b);
    this.startDistrict = this.districts[0];
    this.endDistrict = this.districts[this.districts.length - 1];

    for (var i = 0; i < this.data.getRowCount(); i++) {
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
    }

    this.minCount = 0; // Adjust according to your data
    this.maxCount = 100; // Adjust according to your data
  };

  this.destroy = function() {};

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawTitle();
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);

    var numDistricts = this.districts.length;
    var xLabelSkip = ceil(numDistricts / this.layout.numXTickLabels);

    // Group data by district and crime type to count occurrences
    var groupedData = {};

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var crimeType = row.getString('PrimaryType');
      var district = row.getNum('District');

      if (!groupedData[crimeType]) {
        groupedData[crimeType] = {};
      }

      if (!groupedData[crimeType][district]) {
        groupedData[crimeType][district] = 0;
      }

      groupedData[crimeType][district]++;
    }

    var crimeTypes = Object.keys(groupedData);
    var verticalSpacing = this.layout.plotHeight() / crimeTypes.length;
    for (var i = 0; i < crimeTypes.length; i++) {
      var crimeType = crimeTypes[i];
      var previousX = null;
      var previousY = null;

      for (var j = 0; j < this.districts.length; j++) {
        var district = this.districts[j];
        var count = groupedData[crimeType][district] || 0;

        var x = this.mapDistrictToWidth(district);
        var y = this.mapCountToHeight(count) - (i * verticalSpacing / 2); // Adjust y for spacing

        if (previousX !== null && previousY !== null) {
          stroke(this.colors[i]);
          line(previousX, previousY, x, y);
        } else {
          // Draw the crime type label for the first point
          noStroke();
          fill(this.colors[i]);
          textAlign(RIGHT, CENTER);
          text(crimeType, this.layout.leftMargin - 15, y);
        }

        if (j % xLabelSkip === 0) {
          drawXAxisTickLabel(district, this.layout, this.mapDistrictToWidth.bind(this));
        }

        previousX = x;
        previousY = y;
      }
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.mapDistrictToWidth = function(value) {
    return map(value, this.startDistrict, this.endDistrict, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapCountToHeight = function(value) {
    return map(value, this.minCount, this.maxCount, this.layout.bottomMargin, this.layout.topMargin );
  };
}

function drawXAxisTickLabel(value, layout, mapFunction) {
  textSize(12);
  fill(0);
  noStroke();
  textAlign(CENTER, CENTER);

  var x = mapFunction(value);
  push();
  translate(x, layout.bottomMargin + layout.marginSize / 2);
  rotate(PI / 4);
  text(value, 0, 0);
  pop();
}

function drawAxis(layout) {
  stroke(0);
  line(layout.leftMargin, layout.topMargin, layout.leftMargin, layout.bottomMargin);
  line(layout.leftMargin, layout.bottomMargin, layout.rightMargin, layout.bottomMargin);
}

function drawAxisLabels(xLabel, yLabel, layout) {
  fill(0);
  noStroke();
  textAlign('center', 'center');

  text(xLabel, (layout.plotWidth() / 2) + layout.leftMargin, layout.bottomMargin + (layout.marginSize * 1.5));

  push();
  translate(layout.leftMargin - (layout.marginSize * 1.5), layout.topMargin + (layout.plotHeight() / 2));
  rotate(-PI / 2);
  text(yLabel, 0, 0);
  pop();
}
