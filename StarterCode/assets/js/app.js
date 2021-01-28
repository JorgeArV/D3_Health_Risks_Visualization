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
var chosenXAxis = "Poverty";                                                                                                    //(F)

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {                                                                                            //(H)
            //create scales
            var xLinearScale = d3.scaleLinear()
                                 .domain([d3.min(data, d => d[chosenXAxis]), d3.max(data, d => d[chosenXAxis])])
                                 .range([0, width]);
            
            return xLinearScale;

};

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {                                                                                        //(V)
            var bottomAxis = d3.axisBottom(newXScale);

            xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

            return xAxis;
            };

// function used for updating circles group with a transition to                                                               //(X)
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {
            circlesGroup.transition()
                        .duration(1000)
                        .attr("cx", d => newXScale(d[chosenXAxis]));
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
                    x.healthcare = +x.healtcare;
                    });

    // xLinearScale function above csv import                                                                                   //(I --> see above)
        var xLinearScale = xScale(data, chosenXAxis);                                                               

    // Create y scale function
        var yLinearScale = d3.scaleLinear()                                                                                     //(J)
                             .domain([0, d3.max(data, d => d.obesity)])
                             .range([height, 0]);

    // Create initial axis functions                                                                                            //(K)
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);                         

    // append x axis                                                                                                            //(L)
        var xAxis = chartGroup.append("g")
                              .attr("transform", `translate(0, ${height})`)
                              .call(bottomAxis);

    // append y axis                                                                                                            //(M)
        chartGroup.append("g")
                  .call(leftAxis);

    // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")                                                                       //(N)
                                     .data(data)
                                     .enter()
                                     .append("circle")
                                     .attr("cx", d => xLinearScale(d[chosenXAxis]))
                                     .attr("cy", d => yLinearScale(d.obesity))
                                     .attr("r", 20)
                                     .classed("stateCircle",true);
                                     
    // Create group for three x-axis labels                                                                                     //(O)
        var labelsGroup = chartGroup.append("g")
                                    .attr("transform", `translate(${width / 2}, ${height + 20})`);


        var Poverty_Label = labelsGroup.append("text")                                                                          //(P)
                                         .attr("x", 0)
                                         .attr("y", 20)
                                         .attr("value", "Poverty") // value to grab for event listener
                                         .classed("active", true)
                                         .text("in Poverty (%)");

        var Age_Label = labelsGroup.append("text")                                                                              //(Q)
                                     .attr("x", 0)
                                     .attr("y", 40)
                                     .attr("value", "Age") // value to grab for event listener
                                     .classed("inactive", true)
                                     .text("Age (Median)");

        

    // append y axis
        chartGroup.append("text")                                                                                               //(S)
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0 - margin.left)
                  .attr("x", 0 - (height / 2))
                  .attr("dy", "1em")
                  .classed("axis-text", true)
                  .text("Obese (%)");

    // updateToolTip function above csv import
        //var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);                                                            //(?? - Pending formulas above)!!

    // x axis labels event listener
        labelsGroup.selectAll("text").on("click", function() {
                    // get value of selection                                                                                      //(T)
                       var value = d3.select(this).attr("value");
                       if (value !== chosenXAxis) {
                                // replaces chosenXAxis with value
                                chosenXAxis = value;

                                console.log(chosenXAxis) //Test
                           }});

    // functions here found above csv import                                                                                       //(U) 
    // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

    // updates x axis with transition                                                                                               //(W --> see above)
        xAxis = renderAxes(xLinearScale, xAxis);    

     // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);
     
     
}).catch(function(error) {
        console.log(error);
        });
                                      