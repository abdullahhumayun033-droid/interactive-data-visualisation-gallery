# Interactive Data Visualisation Gallery

An interactive browser-based data visualisation project built with **JavaScript** and **p5.js**. The application presents multiple datasets through a gallery of chart types and lets users switch between visualisations from a single interface.

This repository is a cleaned portfolio version of university coursework from the **University of London BSc Computer Science programme**. Coursework instructions and IDE/system metadata have been removed so the repository focuses on the implementation itself.

## Highlights

- Interactive visualisation gallery with menu-based navigation
- Multiple real-world datasets stored locally in CSV/XLS/XLSX form
- Reusable chart components and helper functions
- Data loading and transformation with the p5.js Table API
- Custom chart rendering without a dedicated charting framework
- Responsive browser-based presentation using HTML, CSS and JavaScript

## Visualisations Included

The project contains a broad range of chart types and analytical views, including:

- Bar charts
- Line charts
- Stacked bar charts
- Scatter plots
- Heatmaps
- Donut and pie charts
- Pictographs
- Pair plots
- Box plots and boxen plots
- Clustered bubble charts
- Radar charts
- Area charts
- Treemaps
- Histograms
- Faceted views
- Crime-focused visualisations

The bundled datasets cover topics such as technology workforce diversity, gender pay gaps, food attitudes, climate change, crime, student achievement, mental health and emissions.

## Technologies

- JavaScript
- p5.js
- HTML5
- CSS3
- CSV/XLS/XLSX datasets

## Project Structure

```text
.
├── index.html
├── sketch.js
├── gallery.js
├── helper-functions.js
├── style.css
├── *.js
├── data/
└── lib/
    └── p5.min.js
```

`sketch.js` initialises the gallery and registers each visualisation. Individual chart types are implemented in their own JavaScript files, while `gallery.js` handles selection and switching between visualisations.

## Running Locally

Because the visualisations load local data files, run the project through a local HTTP server rather than opening `index.html` directly.

From the project directory:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## GitHub Pages

The project is suitable for GitHub Pages because it is a static HTML/CSS/JavaScript application with bundled local assets and datasets.

## Coursework Context

The repository preserves the implementation while removing course instructions, macOS metadata and IDE-specific files. Some datasets and starter components originated from the coursework environment; the visualisation implementations and project integration represent the submitted project work.

## Author

**Abdullah Humayun**  
BSc Computer Science — University of London / Goldsmiths
