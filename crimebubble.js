function CrimeBubbleChart() {
  this.name = 'Crime Data : Bubble Chart';
  this.id = 'crime-bubble-chart';
  this.title = 'Crime Distribution by District: Bubble Chart of Crime Types';
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
    this.data = loadTable(
      './data/crime_data.csv', 'csv', 'header',
      function(table) {
        self.loaded = true;
      }
    );
  };

  this.setup = function() {
    textSize(16);
    console.log(this.data.columns);

    this.districts = [];
    this.crimeTypes = [];

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var district = this.data.getString(i, 'District');
      if (!this.districts.includes(district)) {
        this.districts.push(district);
      }
      var crimeType = this.data.getString(i, 'PrimaryType');
      if (!this.crimeTypes.includes(crimeType)) {
        this.crimeTypes.push(crimeType);
      }
      this.colors.push(color(random(0, 255), random(0, 255), random(0, 255)));
    }
  };

  this.destroy = function() {};

  this.draw = function() {
    if (!this.loaded) {
      console.log('Data not yet loaded');
      return;
    }

    this.drawTitle();
    this.drawAxes();

    for (var i = 0; i < this.data.getRowCount(); i++) {
      var row = this.data.getRow(i);
      var crimeType = row.getString('PrimaryType');
      var district = row.getString('District');
      var frequency = 1; // Each row represents a single occurrence

      var x = this.mapDistrictToWidth(district);
      var y = this.mapCrimeTypeToHeight(crimeType);
      var bubbleSize = sqrt(frequency) * 10; // Adjust the size of the bubble

      // Draw the bubble
      noStroke();
      fill(this.colors[i % this.colors.length]);
      ellipse(x, y, bubbleSize, bubbleSize);

      // Draw the crime type label
      textAlign(RIGHT, CENTER);
      fill(this.colors[i % this.colors.length]);
      text(crimeType, this.layout.leftMargin - 10, this.mapCrimeTypeToHeight(crimeType));
    }
  };

  this.drawTitle = function() {
    fill(0);
    noStroke();
    textAlign('center', 'center');
    text(this.title, (this.layout.plotWidth() / 2) + this.layout.leftMargin, this.layout.topMargin - (this.layout.marginSize / 2));
  };

  this.drawAxes = function() {
    drawAxis(this.layout);
    drawAxisLabels(this.xAxisLabel, this.yAxisLabel, this.layout);
  };

  this.mapDistrictToWidth = function(district) {
    var index = this.districts.indexOf(district);
    return map(index, 0, this.districts.length - 1, this.layout.leftMargin, this.layout.rightMargin);
  };

  this.mapCrimeTypeToHeight = function(crimeType) {
    var index = this.crimeTypes.indexOf(crimeType);
    return map(index, 0, this.crimeTypes.length - 1, this.layout.bottomMargin, this.layout.topMargin);
  };
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
