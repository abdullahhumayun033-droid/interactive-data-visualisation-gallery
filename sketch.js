
// Global variable to store the gallery object. The gallery object is
// a container for all the visualisations.
var gallery;

function setup() {
  // Create a canvas to fill the content div from index.html.
  var c = createCanvas(1024, 576);
  c.parent('app');

  // Create a new gallery object.
  gallery = new Gallery();

  // Add the visualisation objects here.
  gallery.addVisual(new TechDiversityRace());
  gallery.addVisual(new TechDiversityGender());
  gallery.addVisual(new PayGapByJob2017());
  gallery.addVisual(new PayGapTimeSeries());
  gallery.addVisual(new ClimateChange());
  gallery.addVisual(new UKFoodAttitudes());
  gallery.addVisual(new NutrientsTimeSeries());
  gallery.addVisual(new CrimeSankeyDiagram());
  gallery.addVisual(new CrimeBubbleChart());
  gallery.addVisual(new AchievementRatesByInstitution());
  gallery.addVisual(new AchievementRatesOverTime());
  gallery.addVisual(new AchievementRatesByGCSEType());
  gallery.addVisual(new CohortSizeVsAchievementRates());
  gallery.addVisual(new AchievementRatesHeatmap());
  gallery.addVisual(new AchievementRatePictograph());
  gallery.addVisual(new DonutChartAchievementRates());
  gallery.addVisual(new ScoresPairPlot());
  gallery.addVisual(new ScoresBoxPlot());
  gallery.addVisual(new ClusteredBubbleChart());
  gallery.addVisual(new RadarChart());
  gallery.addVisual(new MentalHealthFocusedArea());
  gallery.addVisual(new MentalHealthTreemap());
  gallery.addVisual(new EmissionsVisualization());
  gallery.addVisual(new BoxenPlot());
  gallery.addVisual(new BoxPlot());
  gallery.addVisual(new FacetGrid());
  gallery.addVisual(new Histogram());








}

function draw() {
  background(255);
  if (gallery.selectedVisual != null) {
    gallery.selectedVisual.draw();
  }
}
