import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";
import Humanize from "humanize-plus";
import dataJson from "../data/data.json";
import "./app.scss";

const dataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const margin = { top: 32, right: 64, bottom: 128, left: 64 };
const w = 1280 - margin.right - margin.left;
const h = 800 - margin.top - margin.bottom;

let tooltip;
let dataset;

const createTooltip = () => {
  tooltip = d3
    .select(".js-wrapper")
    .append("div")
    .attr("class", "tooltip js-tooltip")
    .attr("id", "tooltip")
    .style("opacity", 0);
};

const fetchData = async () => {
  let res = null;

  try {
    res = await d3.json(dataUrl);
    return res;
  } catch (e) {
    console.error(e.message);
  }

  return res;
};

const createVisualization = () => {
  const svg = d3
    .select(".js-d3")
    .append("svg")
    .classed("svg", true)
    .attr("width", w + margin.left + margin.right)
    .attr("height", h + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  createTooltip();

  const color = d3.scaleOrdinal(d3.schemePastel1);

  const treemap = d3.treemap().size([w, h]).paddingInner(1);

  const root = d3
    .hierarchy(dataset)
    .eachBefore((d) => {
      // eslint-disable-next-line no-param-reassign
      d.data.id = (d.parent ? `${d.parent.data.id}.` : "") + d.data.name;
    })
    .sum((d) => d.value)
    .sort((a, b) => b.height - a.height || b.value - a.value);

  treemap(root);

  const cell = svg
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", (d) => {
      return `translate(${d.x0}, ${d.y0})`;
    });

  cell
    .append("rect")
    .attr("id", (d) => {
      return d.data.id;
    })
    .attr("class", "tile")
    .attr("width", (d) => {
      return d.x1 - d.x0;
    })
    .attr("height", (d) => {
      return d.y1 - d.y0;
    })
    .attr("data-name", (d) => {
      return d.data.name;
    })
    .attr("data-category", (d) => {
      return d.data.category;
    })
    .attr("data-value", (d) => {
      return d.data.value;
    })
    .attr("fill", (d) => {
      return color(d.data.category);
    })
    .on("mousemove", (d) => {
      tooltip.style("opacity", 0.9);
      tooltip
        .html(
          `Name: ${d.data.name} <br> Category: ${d.data.category}
            <br> Value: $${Humanize.formatNumber(d.data.value)}`
        )
        .attr("data-value", d.data.value)
        .style("left", `${d3.event.pageX + 10}px`)
        .style("top", `${d3.event.pageY - 28}px`);
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  cell
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    .data((d) => {
      return d.data.name.split(/(?=[A-Z][^A-Z])/g);
    })
    .enter()
    .append("tspan")
    .attr("x", 4)
    .attr("y", (d, i) => {
      return 12 + i * 10;
    })
    .text((d) => {
      return d;
    });

  let categories = root.leaves().map((nodes) => {
    return nodes.data.category;
  });
  categories = categories.reduce((acc, item) => {
    if (!acc.includes(item)) acc.push(item);
    return acc;
  }, []);

  const ordinal = d3.scaleOrdinal().domain(categories).range(d3.schemePastel1);

  svg
    .append("g")
    .attr("id", "legend")
    .attr("transform", `translate(0, ${h + 32})`);

  const legend = legendColor()
    .orient("horizontal")
    .title("Genres")
    .shapeWidth(60)
    .shapePadding(20)
    .labelWrap(50)
    .scale(ordinal);

  svg.select("#legend").call(legend);

  d3.selectAll(".swatch").attr("class", "legend-item");
};

const runApp = async () => {
  d3.select(".js-d3").html("");

  dataset = await fetchData();

  if (!dataset) dataset = dataJson;

  createVisualization();
};

export default runApp;
