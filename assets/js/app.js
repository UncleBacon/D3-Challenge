//Define vector dimensions
var svgWidth = 1500;
var svgHeight = 750;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};
//Define chart dimensions
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


//select DOM
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
        d3.max(data, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
}

// function used for updating xAxis var upon click on axis label
function renderXaxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

// function used for updating y-scale var upon click on axis label
function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d[chosenYAxis])).nice()
      .range([height, 0]);
  
    return yLinearScale;
  
}

// function used for updating yAxis var upon click on axis label
function renderYaxes(newyScale, yAxis) {
    var leftAxis = d3.axisLeft(newyScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

return circlesGroup;
}

function renderXCircletext(textGroup, newXScale, chosenXAxis) {

  textGroup.transition()
      .duration(1000)
      .attr("dx", d => newXScale(d[chosenXAxis]))
  
  return textGroup;
  }

function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
  }

function renderYCircletext(textGroup, newYScale, chosenYAxis) {

  textGroup.transition()
      .duration(1000)
      .attr("dy", d => newYScale(d[chosenYAxis])+5);
  
  return textGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

    if (chosenXAxis === "age") {
        var xlabel = "Age: ";
    }
    else if(chosenXAxis === "income"){
        var xlabel = "Income: ";
    }
    else if (chosenXAxis === "poverty") {
        var xlabel = "Poverty: ";
    }

    if(chosenYAxis === "smokes"){
        var ylabel = "Smokes: ";
    }
    else if (chosenYAxis === "obesity"){
        var ylabel = "Obesity: ";
    }
    else if (chosenYAxis=== "healthcare"){
        var ylabel = "w/o Healthcare: ";
    } 


    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
        return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
        });
    
      circlesGroup.call(toolTip);
    
      circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
      })
      // onmouseout event
      .on("mouseout", function(data, index) {
          toolTip.hide(data);
      });
  
    return circlesGroup;
}   

//function for circle radius
function circleRadius(xData){
  if (xData<20){
    var radius = 20;
  }
  else {var radius = (xData/10)*20};
  
  return radius;
}

  // Retrieve data from the CSV file and execute everything below
    d3.csv("assets/data/data.csv").then(function(hwData, err) {
    if (err) throw err;
  console.log(hwData);

    // parse data
    hwData.forEach(function(data) {
      data.age = +data.age;
      data.healthcare = +data.healthcare;
      data.income = +data.income;
      data.obesity = +data.obesity;
      data.poverty = +data.poverty;
      data.smokes = +data.smokes;
    });
 
    // xLinearScale function above csv import
    var xLinearScale = xScale(hwData, chosenXAxis);
  
    // Create y scale function
    var yLinearScale = yScale(hwData, chosenYAxis);
  
    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);
  
    // append y axis
    var yAxis = chartGroup.append("g")
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(hwData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 20)
      .classed("stateCircle",true);

      var textGroup = chartGroup.selectAll()
      .data(hwData)
      .enter()
      .append("text")
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
      .attr("text-anchor", "middle")
      .classed("stateText",true)
      .text(d=>d.abbr);
      


    // Create group for  3 x- axis labels
    var XlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
  
    var PovertyLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");
  
    var AgeLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

      var IncomeLabel = XlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Income (Median)");

    // Create group for  3 Y- axis labels
    var YlabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)");

    var SmokesLabel = YlabelsGroup.append("text")
    .attr("y", 20 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value","smokes")
    .classed("inactive",true)
    .classed("axis-text", true)
    .text("Smokes (%)");

    var ObeseLabel = YlabelsGroup.append("text")
    .attr("y", 40 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value","obesity")
    .classed("inactive",true)
    .classed("axis-text", true)
    .text("Obese (%)");

    var HealthcareLabel = YlabelsGroup.append("text")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("value","healthcare")
      .classed("active",true)
      .classed("axis-text", true)
      .text("Lacks Healthcare (%)");

    circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

    // x axis labels event listener
    XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xvalue = d3.select(this).attr("value");
      if (xvalue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xvalue;

        console.log("Xaxis: ",chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(hwData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXaxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

        //updates circles text with new x values
        textGroup = renderXCircletext(textGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          PovertyLabel
            .classed("active", true)
            .classed("inactive", false);
          AgeLabel 
            .classed("active", false)
            .classed("inactive", true);
          IncomeLabel 
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
            AgeLabel
              .classed("active", true)
              .classed("inactive", false);
            PovertyLabel 
              .classed("active", false)
              .classed("inactive", true);
            IncomeLabel 
              .classed("active", false)
              .classed("inactive", true);
          }
                  
        else {
            IncomeLabel
            .classed("active", true)
            .classed("inactive", false);
          PovertyLabel 
            .classed("active", false)
            .classed("inactive", true);
          AgeLabel 
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });
    // Y axis labels event listener
    YlabelsGroup.selectAll("text")
    .on("click", function() {

        
      // get value of selection
      var yvalue = d3.select(this).attr("value");
      if (yvalue !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = yvalue;

        console.log("Yaxis: ", chosenYAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(hwData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYaxes(yLinearScale, yAxis);

        // updates circles with new x values
        circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

        //updates circles text with new Y values
        textGroup = renderYCircletext(textGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "healthcare") {
          HealthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          ObeseLabel 
            .classed("active", false)
            .classed("inactive", true);
          SmokesLabel 
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
            SmokesLabel
              .classed("active", true)
              .classed("inactive", false);
            HealthcareLabel 
              .classed("active", false)
              .classed("inactive", true);
            ObeseLabel 
              .classed("active", false)
              .classed("inactive", true);
          }
                  
        else {
            ObeseLabel
            .classed("active", true)
            .classed("inactive", false);
            HealthcareLabel 
            .classed("active", false)
            .classed("inactive", true);
            SmokesLabel 
            .classed("active", false)
            .classed("inactive", true);
        }
      }
    });

});