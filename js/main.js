import timeline from "./timeline.js";

d3.csv("data/data.csv", d3.autoType).then((data) => {
  timeline({
    el: document.querySelector("#chart"),
    data,
    x1Accessor: (d) => d["Release date"],
    x2Accessor: (d) => d["Latest update date"],
    yAccessor: (d) => d["OS version"],
    detailAccessor: (d) => d["Latest version"],
  });
});
