export default function timeline({
  el,
  data,
  x1Accessor,
  x2Accessor,
  yAccessor,
  detailAccessor,
}) {
  let width;

  const minWidth = 640;
  const marginTop = 16;
  const marginRight = 96;
  const marginBottom = 16;
  const marginLeft = 96;

  const eventStrokeWidth = 16;
  const labelPadding = 6;
  const nameLabelHeight = 14;
  const yBandwidth = eventStrokeWidth + labelPadding + nameLabelHeight;
  const yPadding = 16;
  const yStep = yBandwidth + yPadding;

  const height = marginTop + marginBottom + yStep * data.length + yPadding * 2;

  const x = d3
    .scaleUtc()
    .domain([d3.min(data, x1Accessor), d3.max(data, x2Accessor)]);

  const y = d3
    .scaleBand()
    .domain(data.map(yAccessor))
    .range([marginTop, height - marginBottom])
    .padding(yPadding / yStep);

  const formatDate = d3.utcFormat("%b %d, %Y");

  const container = d3.select(el).classed("timeline", true);
  const svg = container.append("svg");
  const eventsG = svg.append("g").attr("class", "events");
  const topXAxisG = svg.append("g").attr("class", "axis");
  const bottomXAxisG = svg.append("g").attr("class", "axis");
  const nameLabelsG = svg.append("g").attr("class", "name-labels");
  const dateLabelsG = svg.append("g").attr("class", "date-labels");

  new ResizeObserver(resized).observe(el);

  function resized() {
    const containerWidth = el.clientWidth;
    const currentWidth = Math.max(minWidth, containerWidth);
    if (width === currentWidth) return;
    width = currentWidth;

    x.range([marginLeft, width - marginRight]);

    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    render();
  }

  function render() {
    topXAxisG
      .attr("transform", `translate(0,${marginTop})`)
      .call(
        d3
          .axisTop(x)
          .ticks(width / 80)
          .tickPadding(0)
          .tickSize(-(height - marginTop - marginBottom)),
      )
      .call((g) => g.select(".domain").remove());

    bottomXAxisG
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(
        d3
          .axisBottom(x)
          .ticks(width / 80)
          .tickPadding(0)
          .tickSize(0),
      )
      .call((g) => g.select(".domain").remove());

    eventsG
      .selectChildren(".event")
      .data(data, yAccessor)
      .join((enter) =>
        enter
          .append("line")
          .attr("class", "event")
          .attr("stroke-width", eventStrokeWidth),
      )
      .attr(
        "transform",
        (d) =>
          `translate(0,${y(yAccessor(d)) + yBandwidth - eventStrokeWidth / 2})`,
      )
      .attr("x1", (d) => x(x1Accessor(d)))
      .attr("x2", (d) => x(x2Accessor(d)));

    nameLabelsG
      .selectChildren(".name-label")
      .data(data, yAccessor)
      .join((enter) =>
        enter
          .append("text")
          .attr("class", "name-label")
          .attr("y", -eventStrokeWidth / 2 - labelPadding),
      )
      .attr(
        "transform",
        (d) =>
          `translate(0,${y(yAccessor(d)) + yBandwidth - eventStrokeWidth / 2})`,
      )
      .attr("x", (d) => x(x1Accessor(d)))
      .selectChildren()
      .data((d) => [
        {
          label: yAccessor(d),
          className: "name-label__title",
        },
        {
          label: ` (${detailAccessor(d)})`,
          className: "name-label__detail",
        },
      ])
      .join((enter) =>
        enter
          .append("tspan")
          .attr("class", (d) => d.className)
          .text((d) => d.label),
      );

    dateLabelsG
      .selectChildren(".date-label")
      .data(data, yAccessor)
      .join((enter) => enter.append("g").attr("class", "date-label"))
      .attr(
        "transform",
        (d) =>
          `translate(0,${y(yAccessor(d)) + yBandwidth - eventStrokeWidth / 2})`,
      )
      .selectChildren()
      .data((d) => [
        {
          date: x1Accessor(d),
          textAnchor: "end",
          dx: -labelPadding,
          label: formatDate(x1Accessor(d)),
          className: "date-label__start",
        },
        {
          date: x2Accessor(d),
          textAnchor: "start",
          dx: labelPadding,
          label: formatDate(x2Accessor(d)),
          className: "date-label__end",
        },
      ])
      .join((enter) =>
        enter
          .append("text")
          .attr("class", (d) => d.className)
          .attr("text-anchor", (d) => d.textAnchor)
          .attr("dx", (d) => d.dx)
          .attr("dy", "0.32em")
          .text((d) => d.label),
      )
      .attr("x", (d) => x(d.date));
  }
}
