import * as d3 from "d3";
import "./app.scss";

const dataUrl =
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

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

const runApp = async () => {};

export default runApp;
