var svgWidth = 960;                                                                                                             //(A)
var svgHeight = 500;

var margin = {                                                                                                                  //(B)
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;                                                                              //(C)
var height = svgHeight - margin.top - margin.bottom;                

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("body")                                                                                                     //(D)
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")                                                                                                //(E)                                                                                  

                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";                                                                                                    //(F)
var chosenYAxis = "obesity";                                                                                                    //Y Scale upgrade - (A)

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {                                                                                            //(H)
    //create scales
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(data, d => d[chosenXAxis]), d3.max(data, d => d[chosenXAxis])])
                         .range([0, width]);
    
    return xLinearScale;

};

function yScale(data, chosenYAxis) {                                                                                            //(H)
    //create scales
    var yLinearScale = d3.scaleLinear()                                                                                        // Y Scale upgrade - (B)
                         .domain([d3.min(data, d => d[chosenYAxis]), d3.max(data, d => d[chosenYAxis])])
                         .range([0, height]);

    return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {                                                                                        //(V)
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
    };

function YrenderAxes(newYScale, yAxis) {                                                                                        //(V)
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    
    return yAxis;
    };



// function used for updating circles group with a transition to                                                               //(X)
// new circles
function XrenderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr("cx", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
};

function YrenderCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
};

// function used for updating circles group with new tooltip                                                                // Tooltip (A)
function updateToolTip(chosenXAxis, chosenYAxis,circlesGroup) {

    var labelX;
  
    if (chosenXAxis === "poverty") {
      labelX = "Poverty:";
    }

    else if (chosenXAxis === "age"){
      labelX = "Age:";
    }
    
    else {
        labelX = "Income:";
      }

    var labelY;

    if (chosenYAxis === "obesity") {
        labelY = "Obesity:";
      }
  
    else if (chosenYAxis === "smokes"){
        labelY = "Smokes:";
      }
      
     else {
          labelY = "Healthcare:";
        }
    
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
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
  };




// Retrieve data from the CSV file and execute everything below
d3.csv("/assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // parse data
       data.forEach(function(x) {                                                                                               //(G)    
                    x.poverty = +x.poverty;
                    x.age = +x.age;
                    x.income = +x.income;
                    x.obesity = +x.obesity;
                    x.smokes = +x.smokes;
                    x.healthcare = +x.healthcare;
                    });

    // xLinearScale function above csv import                                                                               //(I --> see above)
    var xLinearScale = xScale(data, chosenXAxis);                                                               

    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);                                                                           //(J)  // Y Scale upgrade - (C)

// Create initial axis functions                                                                                            //(K)
var bottomAxis = d3.axisBottom(xLinearScale);

var leftAxis = d3.axisLeft(yLinearScale);                         

// append x axis                                                                                                            //(L)
var xAxis = chartGroup.append("g")
                      .attr("transform", `translate(0, ${height})`)
                      .call(bottomAxis);


// append y axis                                                                                                            //(M)
var yAxis = chartGroup.append("g")
    .call(leftAxis);

// append initial circles
    var circlesGroup = chartGroup.selectAll("circle")                                                                       //(N)
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle",true);

 var abbreviations = chartGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y",  d => yLinearScale(d[chosenYAxis]+0.2))
    .classed("stateText",true)
    .html(function(d) {
        return (`${d.abbr}`);
      });


// Create group for three x-axis labels                                                                                     //(O)
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var Poverty_Label = labelsGroup.append("text")                                                                          //(P)
                                         .attr("x", 0)
                                         .attr("y", 20)
                                         .attr("value", "poverty") // value to grab for event listener
                                         .classed("active", true)
                                         .text("in Poverty (%)");

    var Age_Label = labelsGroup.append("text")                                                                              //(Q)
                                         .attr("x", 0)
                                         .attr("y", 40)
                                         .attr("value", "age") // value to grab for event listener
                                         .classed("inactive", true)
                                         .text("Age (Median)");
    
    var Income_Label = labelsGroup.append("text")                                                                           //(R)
                                         .attr("x", 0)
                                         .attr("y", 60)
                                         .attr("value", "income") // value to grab for event listener
                                         .classed("inactive", true)
                                         .text("Household Income (Median)");

    // append y axis
    var YlabelsGroup = chartGroup.append("g")                                                                               //Y scale upgrade (D)
    .attr("transform",`translate(${0 - margin.left/2},${ height / 2})`);

    var Obesity_Label = YlabelsGroup.append("text")
                                    .attr("transform", "rotate(-90)")                         
                                    .attr("x",0)
                                    .attr("y",0)
                                    .attr("dy", "1em")
                                    .attr("value","obesity")
                                    .classed("active",true)
                                    .text("Obese (%)");

    var Smokes_Label = YlabelsGroup.append("text")
                                   .attr("transform", "rotate(-90)")                                
                                   .attr("x",0)
                                   .attr("y",-17)
                                   .attr("dy", "1em")
                                   .attr("value","smokes")
                                   .classed("inactive",true)
                                   .text("Smokes (%)");

    var Healthcare_Label = YlabelsGroup.append("text")
                                       .attr("transform", "rotate(-90)")                                
                                       .attr("x",0)
                                       .attr("y",-34)
                                       .attr("dy", "1em")
                                       .attr("value","healthcare")
                                       .classed("inactive",true)
                                       .text("Lack of Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function() {
        // get value of selection                                                                                           //(T)
           var value = d3.select(this).attr("value");
           if (value !== chosenXAxis) {
                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    console.log(chosenXAxis) //Test

                    // functions here found above csv import                                                                //(U) 
                    // updates x scale for new data
                    xLinearScale = xScale(data, chosenXAxis);               

                    // updates x axis with transition                                                                       //(W --> see above)
                    xAxis = renderAxes(xLinearScale, xAxis);    
    
                    // updates circles with new x values
                    circlesGroup = XrenderCircles(circlesGroup, xLinearScale, chosenXAxis);
                    
                    // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);
               }});

    YlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection                                                                                           //(T)
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                        // replaces chosenXAxis with value
                        chosenYAxis = value;
        
                        console.log(chosenYAxis) //Test
        
                        // functions here found above csv import                                                                //(U) 
                        // updates x scale for new data
                        yLinearScale = yScale(data, chosenYAxis);               
        
                            // updates x axis with transition                                                                       //(W --> see above)
                        yAxis = YrenderAxes(yLinearScale, yAxis);    
            
                            // updates circles with new x values
                            circlesGroup = YrenderCircles(circlesGroup, yLinearScale, chosenYAxis);

                             // updates tooltips with new info
                    circlesGroup = updateToolTip(chosenXAxis,chosenYAxis,circlesGroup);
            
                       }});



}).catch(function(error) {
    console.log(error);
                    });
                              

                  //  append("text")                                                                                               //(S)
                  //  .attr("transform", "rotate(-90)")
                 //   .attr("y", 0 - margin.left/2)
                   // .attr("x", 0 - (height / 2))
                  //  .attr("dy", "1em")
                  //  .classed("axis-text", true)
                //    .text("Obese (%)");
