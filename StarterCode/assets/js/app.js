var svgWidth = 960;                                                                                                             
var svgHeight = 500;

var margin = {                                                                                                                  
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;                                                                              
var height = svgHeight - margin.top - margin.bottom;                

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")                                                                                                 
            .append("svg")
            .attr("width", svgWidth)
            .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")                                                                                                                                                                                  

                    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";                                                                                                    
var chosenYAxis = "obesity";                                                                                                    

// function used for updating x-scale var upon click on axis label

function xScale(data, chosenXAxis) {                                                                                            
    //create scales
    var xLinearScale = d3.scaleLinear()
                         .domain([d3.min(data, d => d[chosenXAxis]), d3.max(data, d => d[chosenXAxis])])
                         .range([0, width]);
    
    return xLinearScale;

};

// function used for updating y-scale var upon click on axis label

function yScale(data, chosenYAxis) {                                                                                            
    //create scales
    var yLinearScale = d3.scaleLinear()                                                                                        
                         .domain([d3.min(data, d => d[chosenYAxis]), d3.max(data, d => d[chosenYAxis])])
                         .range([0, height]);

    return yLinearScale;
};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {                                                                                        
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
    };

// function used for updating yAxis var upon click on axis label
function YrenderAxes(newYScale, yAxis) {                                                                                        
    var leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
    .duration(1000)
    .call(leftAxis);
    
    return yAxis;
    };

// function used for updating circles group with a transition to                                                               
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

// function used for updating text group (abbreviations) with a transition to 
// new position of text

function XrenderText(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
                .duration(1000)
                .attr("x", d => newXScale(d[chosenXAxis]))
    return circlesGroup;
};

function YrenderText(abbreviations, newYScale, chosenYAxis) {
    abbreviations.transition()
                .duration(1000)
                .attr("y", d => newYScale(d[chosenYAxis]));
    return abbreviations;
};

// function used for updating text group (abbreviation) with new tooltip

function updateToolTip(chosenXAxis, chosenYAxis, abbreviations) {

    var labelX;
  
    if (chosenXAxis === "poverty") {
      labelX = "Poverty:";
    }

    else if (chosenXAxis === "age"){
       labelX = "Age:";
    }

    else if (chosenXAxis === "income") {
        labelX = "Income:";
      }  

    var labelY;
  
    if (chosenYAxis === "obesity") {
      labelY = "Obese (%):";
    }

    else if (chosenYAxis === "smokes"){
       labelY = "Smokes (%):";
    }

    else if (chosenYAxis === "healthcare") {
      labelY = "Lack of Healthcare (%):";
    }  
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
      });
  
      abbreviations.call(toolTip);
  
      abbreviations.on("mouseover", function(data) {
      toolTip.style("display", "block")
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return abbreviations;
  }


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(data, err) {
    if (err) throw err;

    // parse data
       data.forEach(function(x) {    
                    x.poverty = +x.poverty;
                    x.age = +x.age;
                    x.income = +x.income;
                    x.obesity = +x.obesity;
                    x.smokes = +x.smokes;
                    x.healthcare = +x.healthcare;
                    });

    // xLinearScale function above csv import   
    var xLinearScale = xScale(data, chosenXAxis);                                                               

    // Create y scale function
    var yLinearScale = yScale(data, chosenYAxis);       

    // Create initial axis functions               
    var bottomAxis = d3.axisBottom(xLinearScale);

    var leftAxis = d3.axisLeft(yLinearScale);                         

    // append x axis                                           
    var xAxis = chartGroup.append("g")
                          .attr("transform", `translate(0, ${height})`)
                          .call(bottomAxis);


    // append y axis                                      
    var yAxis = chartGroup.append("g")
                          .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")                     
                                 .data(data)
                                 .enter()
                                 .append("circle")
                                 .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                 .attr("cy", d => yLinearScale(d[chosenYAxis]))
                                 .attr("r", 15)
                                 .classed("stateCircle",true);


    // append initial abbreviations
    var abbreviations = chartGroup.selectAll(".stateText")
                                  .data(data)
                                  .enter()
                                  .append("text")
                                  .attr("x", d => xLinearScale(d[chosenXAxis]))
                                  .attr("y",  d => yLinearScale(d[chosenYAxis]))
                                  .attr("font-size",10)
                                  .classed("stateText",true)
                                  .html(function(d) {
                                                    return (`${d.abbr}`);
                                        });


    // Create group for three x-axis labels                                                                          
    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    //Create three x-axis labels 
    var Poverty_Label = labelsGroup.append("text")                                                                   
                                         .attr("x", 0)
                                         .attr("y", 20)
                                         .attr("value", "poverty") // value to grab for event listener
                                         .classed("active", true)
                                         .text("in Poverty (%)");

    var Age_Label = labelsGroup.append("text")                                                                       
                                         .attr("x", 0)
                                         .attr("y", 40)
                                         .attr("value", "age") // value to grab for event listener
                                         .classed("inactive", true)
                                         .text("Age (Median)");
    
    var Income_Label = labelsGroup.append("text")                                                                    
                                         .attr("x", 0)
                                         .attr("y", 60)
                                         .attr("value", "income") // value to grab for event listener
                                         .classed("inactive", true)
                                         .text("Household Income (Median)");

    // // Create group for three y-axis labels   
    var YlabelsGroup = chartGroup.append("g")                                            
    .attr("transform",`translate(${0 - margin.left/2},${ height / 2})`);

    //Create three y-axis labels
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
    var abbreviations = updateToolTip(chosenXAxis, chosenYAxis, abbreviations);

    // x axis labels event listener
    labelsGroup.selectAll("text").on("click", function() {
        // get value of selection                                                                                           
           var value = d3.select(this).attr("value");
           if (value !== chosenXAxis) {
                    // replaces chosenXAxis with value
                    chosenXAxis = value;

                    console.log(chosenXAxis) //Test

                    // functions here found above csv import                                                           
                    // updates x scale for new data
                    xLinearScale = xScale(data, chosenXAxis);               

                    // updates x axis with transition                                                                 
                    xAxis = renderAxes(xLinearScale, xAxis);    
    
                    // updates circles & abbreviations with new x values
                    circlesGroup = XrenderCircles(circlesGroup, xLinearScale, chosenXAxis);

                    abbreviations = XrenderText(abbreviations, xLinearScale, chosenXAxis);

                    // updates tooltips with new info
                    abbreviations = updateToolTip(chosenXAxis, chosenYAxis, abbreviations);  

                    // changes classes to change bold text
                    if (chosenXAxis === "poverty") {
                            Poverty_Label
                                .classed("active", true)
                                .classed("inactive", false);
                            
                            Age_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                                        
                            Income_Label
                                .classed("active", false)
                                .classed("inactive", true);
                        }
                    else if (chosenXAxis === "age") {
                            Age_Label
                                .classed("active", true)
                                .classed("inactive", false);

                            Poverty_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                        
                            Income_Label
                                .classed("active", false)
                                .classed("inactive", true);
                            }
                                    
                    else if (chosenXAxis === "income") {
                            Income_Label
                                .classed("active", true)
                                .classed("inactive", false);

                            Poverty_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                            
                            Age_Label
                                .classed("active", false)
                                .classed("inactive", true);
                            }
            
    
               }});

    // y axis labels event listener
    YlabelsGroup.selectAll("text").on("click", function() {
        // get value of selection                                            
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                        // replaces chosenYAxis with value
                        chosenYAxis = value;
        
                        console.log(chosenYAxis) //Test
        
                        // functions here found above csv import                       
                        // updates y scale for new data
                        yLinearScale = yScale(data, chosenYAxis);               
        
                            // updates y axis with transition         
                        yAxis = YrenderAxes(yLinearScale, yAxis);    
            
                            // updates circles & abbreviations with new y values
                            circlesGroup = YrenderCircles(circlesGroup, yLinearScale, chosenYAxis);
            
                            abbreviations = YrenderText(abbreviations, yLinearScale, chosenYAxis);

                        // updates tooltips with new info
                        abbreviations = updateToolTip(chosenXAxis, chosenYAxis, abbreviations);

                        // changes classes to change bold text
                        if (chosenYAxis === "obesity") {
                            Obesity_Label
                                .classed("active", true)
                                .classed("inactive", false);
                        
                            Smokes_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                                    
                            Healthcare_Label
                                .classed("active", false)
                                .classed("inactive", true);
                            }
                        else if (chosenYAxis === "smokes") {
                            Smokes_Label
                                .classed("active", true)
                                .classed("inactive", false);

                            Obesity_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                    
                            Healthcare_Label
                                .classed("active", false)
                                .classed("inactive", true);
                            }
                                
                        else if (chosenYAxis === "healthcare") {
                            Healthcare_Label
                                .classed("active", true)
                                .classed("inactive", false);

                            Obesity_Label
                                .classed("active", false)
                                .classed("inactive", true);
                                        
                            Smokes_Label
                                .classed("active", false)
                                .classed("inactive", true);
                            }


                       }});



}).catch(function(error) {
    console.log(error);
                    });
