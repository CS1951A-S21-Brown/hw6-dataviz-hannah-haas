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
    .attr("width", graph_1_width)     // HINT: width
    .attr("height", graph_1_height)     // HINT: height
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform

// Set up reference to count SVG group
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

// Set up reference to tooltip
let tooltip = d3.select("#graph3")     // HINT: div id for div containing scatterplot
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Set up reference to tooltip
// let tooltip = d3.select("#graph2")     // HINT: div id for div containing scatterplot
//     .append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);


// TODO: Load the artists CSV file into D3 by using the d3.csv() method
d3.csv("../data/netflix.csv").then(function(data) {
    // TODO: Clean and strip desired amount of data for barplot
    createGraph1(data)
    createGraph2(data)
    createGraph3(data, "R")

});

/**
 * Cleans the provided data using the given comparator then strips to first numExamples
 * instances
 */

function createGraph1(data){

  data = getNumTitlesByGenre(data);

  data = sortData(data, function(a,b){return parseInt(b.num_titles) - parseInt(a.num_titles)});


  let x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d){return parseInt(d.num_titles);})])
      .range([0, graph_1_width - margin.left - margin.right]);

  let y = d3.scaleBand()
      .domain(data.map(function(d){return d.Genre;}))
      .range([0, graph_1_height - margin.top - margin.bottom])
      .padding(0.1);  // Improves readability

  // TODO: Add y-axis label
  svg.append("g")
      .call(d3.axisLeft(y).tickSize(0).tickPadding(10));

  let bars = svg.selectAll("rect").data(data);


  // OPTIONAL: Define color scale
  let color = d3.scaleOrdinal()
      .domain(data.map(function(d){return d.num_titles;}))
      .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), data.length));

  bars.enter()
      .append("rect")
      .merge(bars)
      .attr("fill", function(d) { return color(d['num_titles']) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
      .attr("x", x(0))
      .attr("y", function(d){return y(d.Genre);})  // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
      .attr("width", function(d){return x(parseInt(d.num_titles));})
      .attr("height", y.bandwidth());        // HINT: y.bandwidth() makes a reasonable display height

  let counts = countRef.selectAll("text").data(data);

  // TODO: Render the text elements on the DOM
  counts.enter()
      .append("text")
      .merge(counts)
      .attr("x", function(d) { return x(parseFloat(d.num_titles)) + 10; })       // HINT: Add a small offset to the right edge of the bar, found by x(d.count)
      .attr("y", function(d) { return y(d.Genre) + 8; })       // HINT: Add a small offset to the top edge of the bar, found by y(d.artist)
      .style("text-anchor", "start")
      .text(function(d) { return parseFloat(d.num_titles)});         // HINT: Get the name of the artist


  // TODO: Add x-axis label
  svg.append("text")
      .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${(graph_1_height - margin.top - margin.bottom) + 25})`)        // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
      .style("text-anchor", "middle")
      .text("Number of Titles");

  // TODO: Add y-axis label
  svg.append("text")
      .attr("transform", `translate(${-200}, ${(graph_1_height - margin.top - margin.bottom)/2})`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier        .style("text-anchor", "middle")
      .text("Genre");

  // TODO: Add chart title
  svg.append("text")
      .attr("transform", `translate(${(graph_1_width - margin.left - margin.right) / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
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

    // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return + parseInt(d.value); })])
    .range([ graph_2_height, 0 ]);
  svg2.append("g")
    .call(d3.axisLeft(y));

    // Add the line
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
      .attr("transform", `translate(${(graph_2_width) / 2}, ${graph_2_height + 40})`)        // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
      .style("text-anchor", "middle")
      .text("Year");

  // TODO: Add y-axis label
  svg2.append("text")
      .attr("transform", `translate(${-150}, ${(graph_2_height - margin.top - margin.bottom)/2 + 30})`)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier        .style("text-anchor", "middle")
      .text("Average runtime (min)");

  // TODO: Add chart title
  svg2.append("text")
      .attr("transform", `translate(${graph_2_width / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
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

// function setLocation(location) {
//
//     // TODO: Load the artists CSV file into D3 by using the d3.csv() method. Index into the filenames array
//   d3.csv("../data/video_games.csv").then(function(data) {
//     var to_remove = d3.select("#graph2");
//     to_remove.selectAll("*").remove();
//
//       console.log(location)
//
//       var data = {a: 9, b: 20, c:30, d:8, e:12}
//
//       if (location == "north_america"){
//
//         data = {a: 50, b: 20, c:30, d:8, e:12}
//       }
//
//       let svg2 = d3.select("#graph2")
//           .append("svg")
//           .attr("width", graph_2_width)     // HINT: width
//           .attr("height", graph_2_height)     // HINT: height
//           .append("g")
//           .attr("transform", `translate(${margin.left},${margin.top})`);    // HINT: transform
//
//       // Set up reference to count SVG group
//       let countRef2 = svg2.append("g");
//
//       console.log(data)
//
//       var radius = Math.min(graph_2_width, graph_2_height) / 2 - 30
//
//       // set the color scale
//       var color = d3.scaleOrdinal()
//         .domain(data)
//         .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56"])
//
//           // console.log(num_examples)
//           // data = cleanData(data, function(a,b){return parseInt(b.count) - parseInt(a.count)}, num_examples);
//
//           // TODO: Update the x axis domain with the max count of the provided data
//       var pie = d3.pie()
//         .value(function(d) {return d.value; })
//
//       var data_ready = pie(d3.entries(data))
//       console.log(data_ready)
//
//       let bars = svg.selectAll("rect").data(data);
//
//
//       // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
//       svg2
//         .selectAll('whatever')
//         .data(data_ready)
//         .enter()
//         .merge(bars)
//         .append('path')
//         .attr('d', d3.arc()
//           .innerRadius(0)
//           .outerRadius(radius)
//         )
//         .attr('fill', function(d){ return(color(d.data.key)) })
//         .attr("stroke", "black")
//         .style("stroke-width", "2px")
//         .style("opacity", 0.7)
//         .attr("transform", `translate(${(graph_2_width - margin.left - margin.right) / 2 - 30}, ${100})`)
//
//   });
// }


function createGraph3(data, rating){
  data = getNodesAndLinks(data, rating)
  console.log(data)


  let mouseover = function(d) {

      let html = `${d.name}<br/>`;

      // Show the tooltip and set the position relative to the event X and Y location
      tooltip.html(html)
          .style("left", `${(d.x) +300}px`)
          .style("top", `${(d.y) + 50}px`)
          .style("box-shadow", `2px 2px 5px}`)    // OPTIONAL for students
          .style("background-color", "grey")
          .style("width", "80px")
          .style("text-align", "center")
          .style("color", "white")
          .transition()
          .duration(200)
          .style("opacity", 0.9)
  };

  // Mouseout function to hide the tool on exit
  let mouseout = function(d) {
      // Set opacity back to 0 to hide
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
      .attr("transform", `translate(${graph_3_width / 2}, ${-20})`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text(title);

  svg3.append("text")
      .attr("transform", `translate(${graph_3_width / 2}, ${(graph_3_height - margin.top - margin.bottom) + 115})`)        // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
      .style("text-anchor", "middle")
      .style("font-size", 15)
      .text("*Only includes popular actors (actors that have been in at least 6 movies) ");

  const forceX = d3.forceX(graph_3_width / 2).strength(0.1);
  const forceY = d3.forceY((graph_3_height + margin.top) / 2).strength(0.1);

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data.nodes)
    .force('x', forceX)
    .force('y',  forceY)              // Force algorithm is applied to data.nodes
    .force("link", d3.forceLink()                               // This force provides links between nodes
          .id(function(d) { return d.id; })                     // This provide  the id of a node
          .links(data.links)                                    // and this the list of links
    )
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(graph_3_width / 2, graph_3_height / 2))     // This force attracts nodes to the center of the svg area
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

  // This function is run at each iteration of the force algorithm, updating the nodes position.
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
  // data.forEach(function (item) {
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
      // console.log(name_to_id)

    });

    for (i = 0; i < split_cast.length; i++) {
      for (j = i; j < split_cast.length; j++) {
        actor1 = split_cast[i]
        actor2 = split_cast[j]

        actor1 = actor1.trim()
        actor2 = actor2.trim()
        if (actor1 == actor2){
          // console.log("HERE")
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

  //   year = item.release_year
  //   duration = item.duration
  //   duration = duration.slice(0, -4);
  //   if (dictionary[year]  === undefined ){
  //     dictionary[year] = [duration]
  //   } else {
  //     var list = dictionary[year]
  //     list.push(duration)
  //     dictionary[year] = list
  //   }
  }
  console.log(links)
  console.log(nodes)

  // for (var key in dictionary) {
  //   vals =  dictionary[key]
  //   var total = 0
  //   vals.forEach(function (duration) {
  //       total += parseInt(duration)
  //   });
  //   average = total / vals.length;
  //   final_data.push({date: d3.timeParse("%Y")(key), value:  average})


  final_data = {nodes: nodes, links: links}

  return final_data
}

function setRating(rating) {
    // TODO: Load the artists CSV file into D3 by using the d3.csv() method. Index into the filenames array
    d3.csv("../data/netflix.csv").then(function(data) {
      var to_remove = d3.select("#graph3");
      to_remove.selectAll("*").remove();

      svg3 = d3.select("#graph3")
        .append("svg")
        .attr("width", graph_3_width + margin.left + margin.right)
        .attr("height", graph_3_height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // Set up reference to tooltip
      tooltip = d3.select("#graph3")     // HINT: div id for div containing scatterplot
          .append("div")
          .attr("class", "tooltip")
          .style("opacity", 0);

      createGraph3(data, rating)
    });
}
