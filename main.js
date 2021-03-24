// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 250};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2), graph_1_height = 500;
let graph_2_width = (MAX_WIDTH / 2) - 100, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width)
    .attr("height", graph_1_height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform

let countRef = svg.append("g");

var svg2 = d3.select("#graph2")
  .append("svg")
  .attr("width", graph_2_width + margin.left + margin.right)
  .attr("height", graph_2_height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

var svg3 = d3.select("#graph3")
  .append("svg")
  .attr("width", graph_3_width + margin.left + margin.right)
  .attr("height", graph_3_height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

let tooltip = d3.select("#graph3")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

d3.csv("../data/netflix.csv").then(function(data) {
    createGraph1(data)
    createGraph2(data)
    createGraph3(data, "R")
});

function createGraph1(data){

  data = getNumTitlesByGenre(data);
  data = sortData(data, function(a,b){return parseInt(b.num_titles) - parseInt(a.num_titles)});

  let x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d){return parseInt(d.num_titles);})])
      .range([0, graph_1_width - margin.left - margin.right]);

  let y = d3.scaleBand()
      .domain(data.map(function(d){return d.Genre;}))
      .range([0, graph_1_height - margin.top - margin.bottom])
      .padding(0.1);

  svg.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

  let bars = svg.selectAll("rect").data(data);

  let color = d3.scaleOrdinal()
      .domain(data.map(function(d){return d.num_titles;}))
      .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), data.length));

  bars.enter()
      .append("rect")
      .merge(bars)
      .attr("fill", function(d) { return color(d['num_titles']) })
      .attr("x", x(0))
      .attr("y", function(d){return y(d.Genre);})
      .attr("width", function(d){return x(parseInt(d.num_titles));})
      .attr("height", y.bandwidth());

  let counts = countRef.selectAll("text").data(data);

  counts.enter()
      .append("text")
      .merge(counts)
      .attr("x", function(d) { return x(parseFloat(d.num_titles)) + 10; })
      .attr("y", function(d) { return y(d.Genre) + 8; })
      .style("text-anchor", "start")
      .text(function(d) { return parseFloat(d.num_titles)});

  svg.append("text")
      .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 25})`)
      .style("text-anchor", "middle")
      .text("Number of Titles");

  svg.append("text")
      .attr("transform", `translate(${-200}, ${(graph_1_height - margin.top - margin.bottom)/2})`)
      .style("text-anchor", "middle")
      .text("Genre");

  svg.append("text")
      .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text("Number of titles per genre");
}

function getNumTitlesByGenre(data) {
  var final_data = [];
  var dictionary = {};
  counter = 0
  data.forEach(function (item) {
    key = item.listed_in
    var split_list = key.split(",")
    split_list.forEach(function (split_genre) {
      split_genre = split_genre.trim();
      if (dictionary[split_genre]  === undefined ){
        dictionary[split_genre] = 1
      } else {
        dictionary[split_genre] = dictionary[split_genre] + 1
      }
    });
  });
  for (var key in dictionary) {
    final_data.push({Genre: key, num_titles:  dictionary[key]})

  }
  return final_data
}

function sortData(data, comparator) {
  return data.sort(comparator);
}

function createGraph2(data){

  data = getAverageByYear(data)
  var x = d3.scaleTime()
    .domain(d3.extent(data, function(d) { return d.date; }))
    .range([ 0, graph_2_width ]);
  svg2.append("g")
    .attr("transform", "translate(0," + graph_2_height + ")")
    .call(d3.axisBottom(x));

  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return + parseInt(d.value); })])
    .range([ graph_2_height, 0 ]);
  svg2.append("g")
    .call(d3.axisLeft(y));

  svg2.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .x(function(d) { return x(d.date) })
      .y(function(d) { return y(parseInt(d.value)) })
      )

  svg2.append("text")
      .attr("transform", `translate(${(graph_2_width) / 2}, ${graph_2_height + 40})`)
      .style("text-anchor", "middle")
      .text("Year");

  svg2.append("text")
      .attr("transform", `translate(${-150}, ${(graph_2_height - margin.top - margin.bottom)/2 + 30})`)      
      .text("Average runtime (min)");

  svg2.append("text")
      .attr("transform", `translate(${graph_2_width / 2}, ${-20})`)
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text("Average runtime of movies by year");
}

function getAverageByYear(data) {
  var final_data = [];
  var dictionary = {};
  counter = 0
  data.forEach(function (item) {
    type = item.type
    if (type != "Movie"){
      return;
    }

    year = item.release_year
    duration = item.duration
    duration = duration.slice(0, -4);
    if (dictionary[year]  === undefined ){
      dictionary[year] = [duration]
    } else {
      var list = dictionary[year]
      list.push(duration)
      dictionary[year] = list
    }
  });

  for (var key in dictionary) {
    vals =  dictionary[key]
    var total = 0
    vals.forEach(function (duration) {
        total += parseInt(duration)
    });
    average = total / vals.length;
    final_data.push({date: d3.timeParse("%Y")(key), value:  average})

  }

  return final_data
}

function createGraph3(data, rating){
  data = getNodesAndLinks(data, rating)

  let mouseover = function(d) {
      let html = `${d.name}<br/>`;

      tooltip.html(html)
          .style("left", `${(d.x) +300}px`)
          .style("top", `${(d.y) + 50}px`)
          .style("box-shadow", `2px 2px 5px}`)
          .style("background-color", "grey")
          .style("width", "80px")
          .style("text-align", "center")
          .style("color", "white")
          .transition()
          .duration(200)
          .style("opacity", 0.9)
  };

  let mouseout = function(d) {
      tooltip.transition()
          .duration(200)
          .style("opacity", 0);
  };

  var link = svg3
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")

  // Initialize the nodes
  var node = svg3
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("r", 5)
      .style("fill", "#69b3a2")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)


  var title = "Actors* that acted together in a Movie with the rating " + rating
  svg3.append("text")
      .attr("transform", `translate(${graph_3_width / 2}, ${-20})`)
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text(title);

  svg3.append("text")
      .attr("transform", `translate(${graph_3_width / 2}, ${(graph_3_height - margin.top - margin.bottom) + 115})`)
      .style("font-size", 15)
      .text("*Only includes popular actors (actors that have been in at least 6 movies) ");

  const forceX = d3.forceX(graph_3_width / 2).strength(0.1);
  const forceY = d3.forceY((graph_3_height + margin.top) / 2).strength(0.1);

  var simulation = d3.forceSimulation(data.nodes)
    .force('x', forceX)
    .force('y',  forceY)
    .force("link", d3.forceLink()
          .id(function(d) { return d.id; })
          .links(data.links)
    )
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(graph_3_width / 2, graph_3_height / 2))
    .on("end", ticked);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
           .attr("cx", function (d) { return d.x; })
           .attr("cy", function(d) { return d.y; });
    }
}

function getNodesAndLinks(data, rating){
  var final_data = [];
  var name_to_id = {};
  var links = []
  var nodes = []

  number_movies = {}
  for (number = 0; number < data.length; number++) {
    item = data[number]
    cast = item.cast

    row_type = item.type
    if (row_type != "Movie"){
      continue
    }

    var split_cast = cast.split(",")
    split_cast.forEach(function (actor) {
      actor = actor.trim()
      if (number_movies[actor] === undefined){
        number_movies[actor] = 1
      } else {
        number_movies[actor] = number_movies[actor] + 1
      }
    });
  }

  id_counter = 1
  for (num = 0; num < data.length; num++) {
    item = data[num]

    row_rating = item.rating
    if (row_rating != rating){
      continue
    }

    row_type = item.type
    if (row_type != "Movie"){
      continue
    }

    cast = item.cast

    var split_cast = cast.split(",")
    if (split_cast.length == 1){
      continue;
    }

    split_cast.forEach(function (actor) {
      actor = actor.trim()
      if (number_movies[actor] < 6){
        return
      }

      if (name_to_id[actor] === undefined){
        name_to_id[actor] = id_counter
        actor_dict = {id: id_counter, name: actor}
        nodes.push(actor_dict)
        id_counter = id_counter + 1
      }

    });

    for (i = 0; i < split_cast.length; i++) {
      for (j = i; j < split_cast.length; j++) {
        actor1 = split_cast[i]
        actor2 = split_cast[j]

        actor1 = actor1.trim()
        actor2 = actor2.trim()
        if (actor1 == actor2){
          continue;
        }

        if (number_movies[actor1] < 6){
          continue;
        }
        if (number_movies[actor2] < 6){
          continue;
        }
        actor1_id = name_to_id[actor1]
        actor2_id = name_to_id[actor2]
        links.push({source: parseInt(actor1_id), target: parseInt(actor2_id)})
      }
    }
  }
  final_data = {nodes: nodes, links: links}

  return final_data
}

function setRating(rating) {
    d3.csv("../data/netflix.csv").then(function(data) {
      var to_remove = d3.select("#graph3");
      to_remove.selectAll("*").remove();

      svg3 = d3.select("#graph3")
        .append("svg")
        .attr("width", graph_3_width + margin.left + margin.right)
        .attr("height", graph_3_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      tooltip = d3.select("#graph3")
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);
      createGraph3(data, rating)
    });
}
