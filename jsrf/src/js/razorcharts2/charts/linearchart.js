/**
 * Wrapper for LinearChart
 */

define(['vendor/lodash',
        'leonardo/leomain', 
        'razorcharts2/scales/scale',
        'razorcharts2/axes/bottomaxis',
        'razorcharts2/axes/leftaxis',
        'razorcharts2/axes/rightaxis',
        'razorcharts2/utils/graphutils',
        'razorcharts2/plots/column',
        'razorcharts2/plots/stackedcolumn',
        'razorcharts2/plots/line',
        'razorcharts2/plots/area',
        'razorcharts2/plots/stackedarea',
        'razorcharts2/axes/ygrid',
        'razorcharts2/utils/optimizeticks'], function (_, Leonardo, Scale, BottomAxis, LeftAxis, RightAxis, GraphUtils, Column, StackedColumn, Line, Area, StackedArea, YGrid, OptimizeTicks) {

    var plots = {
        'column': Column,
        'line': Line,
        'area': Area
    };

    var stackedPlots = {
        'column': StackedColumn,
        'line': Line,
        'area': StackedArea
    };

    var plotOrder = ['column', 'area', 'line'];
    var LinearChart = function() {
        this.options = {
            tooltip: {
                onShow: function () {

                },
                onHide: function () {

                }
            }
        };
        this.plots = {};
    };

    /**
     * Sets the config for the chart
     * @param  {Object} _options The options object given by the chart object
     */
    LinearChart.prototype.config = function (_options) {
        // Setting the options and a bunch of shared private variables
        var options = this.options = _.extend(this.options, _options);
        this.series = options.series;
        this.labels = options.labels;
        this.xAxisOptions = options.xAxis || {};
        this.yAxisOptions = options.yAxis || {
            format: function (val) {
                return val;
            }
        };
        configureEvents (this);
        if(options.stacked) {
            configureStackedLinearChart (this);
        } else if(options.dualAxis) {
            configureDualAxisLinearChart (this);
        } else {
            configureLinearChart (this);
        }
    };

    function configureEvents (self) {
        var eventManager = self.options.eventManager;
        eventManager.bind('tooltip', function (obj) {
            self.options.tooltip.onShow (obj.position.x, obj.position.y, obj);
        });
        eventManager.bind('tooltip.mouseout', function (obj) {
            self.options.tooltip.onMouseOut ();
        });
        eventManager.bind('highlight.highlight', function (obj) {
            obj.plot.attr ({
                fill: Leonardo.color(obj.color).darken(0.2).toHex()
            });
        });
        eventManager.bind('highlight.normal', function (obj) {
            obj.plot.attr ({
                fill: obj.color
            });
        });
    };

    function configureLinearChart (self) {
        calcScaleBounds (self);
        configureScales (self);
        configureAxis (self);
        configurePlots (self);
    }

    function configureStackedLinearChart (self) {
        calcStackedScaleBounds (self);
        configureScales (self);
        configureAxis (self);
        configurePlotsForStacked (self);
    }

    function configureDualAxisLinearChart (self) {
        var series = self.options.series;
        var leftSeries = _.where(series, {yAxis: 'left'});
        var rightSeries = _.where(series, {yAxis: 'right'});
        if(!leftSeries.length) {
            self.hideLeftAxis = true;
        }
        if(!rightSeries.length) {
            self.hideRightAxis = true;
        }
        setDualAxisDefaults (self);
        calcDualAxisScaleBounds (self);
        configureDualAxisScales (self);
        configureDualAxis (self);
        configurePlots (self);
    }

    function setDualAxisDefaults (self) {
        var series = self.options.series;

        for(var i=0; i<series.length; i++) {
            series[i].yAxis = series[i].yAxis || 'left';
        }

        self.dataMin = {};
        self.dataMax = {};
        self.yScale = {};
        self.yDomain = {};
        self.yAxis = {};
        self.yGrid = {};
    };

    function configurePlots (self) {
        var series = self.options.series;
        dividePlotsByDisplayType (self);
        
        for(var i=0; i<plotOrder.length; i++) {
            var plotType = plotOrder[i];
            var plotSeries = self.plotsByDisplayType[plotType] || [];
            var plot = plots[plotType];

            for(var j=0; j<plotSeries.length; j++) {
                if(self.options.dualAxis) {
                    plotSeries[j].scale = self.yScale[plotSeries[j].yAxis];
                } else {
                    plotSeries[j].scale = self.yScale;    
                }
            }
            if(plot && plotSeries && plotSeries.length) {
                self.plots[plotType] = new plot();
                self.plots[plotType].config({
                    plotItemHoverPointer: self.options.plotItemHoverPointer,
                    series: plotSeries,
                    labels: self.options.labels,
                    minValue: self.yAxisOptions.minValue,
                    maxValue: self.yAxisOptions.maxValue,
                    eventManager: self.options.eventManager
                });
            }
        }
    };

    function configurePlotsForStacked (self) {
        var series = self.options.series;
        dividePlotsByDisplayType (self);

        for(var i=0; i<plotOrder.length; i++) {
            var plotType = plotOrder[i];
            var plotSeries = self.plotsByDisplayType[plotType];
            var plot = stackedPlots[plotType];

            for(var j=0; j<series.length; j++) {
                series[j].scale = self.yScale;
            }

            if(plot && plotSeries && plotSeries.length) {
                self.plots[plotType] = new plot();
                self.plots[plotType].config({
                    plotItemHoverPointer: self.options.plotItemHoverPointer,
                    series: plotSeries,
                    labels: self.options.labels,
                    eventManager: self.options.eventManager
                });
            }
        }
    };

    function dividePlotsByDisplayType (self) {
        var series = self.options.series;
        self.plotsByDisplayType = {};

        for(var i=0; i<series.length; i++) {
            var displayType = series[i].displayType;
            if(!_.isArray(self.plotsByDisplayType[displayType])) {
                self.plotsByDisplayType[displayType] = [];
            }
            self.plotsByDisplayType[displayType].push(series[i]);
        }
    }

    function calcScaleBounds (self) {
        var allData = [],
            series = self.options.series;
        for(var i=0; i<series.length; ++i) {
            allData = allData.concat(series[i].data);
        }
        self.dataMin = _.min (allData);
        self.dataMax = _.max (allData);
    }

    function calcDualAxisScaleBounds (self) {
        var allData = [],
            series = self.options.series,
            leftSeries = _.where (series, {yAxis: 'left'}),
            rightSeries = _.where (series, {yAxis: 'right'});

        for(var i=0; i<leftSeries.length; i++) {
            allData = allData.concat (leftSeries[i].data);
        }
        
        self.dataMin.left = _.min (allData);
        self.dataMax.left = _.max (allData);

        allData = [];

        for(var i=0; i<rightSeries.length; i++) {
            allData = allData.concat (rightSeries[i].data);
        }

        self.dataMin.right = _.min (allData);
        self.dataMax.right = _.max (allData);
    };

    function calcStackedScaleBounds (self) {
        var negevData = [],
            posiData = [],
            series = self.options.series;
        for(var i=0; i<series.length; i++) {
            var data = series[i].data;
            for(var j=0; j<series[i].data.length; j++) {
                posiData[j] = typeof posiData[j] === 'undefined' ? 0 : posiData[j];
                negevData[j] = typeof negevData[j] === 'undefined' ? 0 : negevData[j];
                if(data[j] >= 0) {
                    posiData[j] += data[j];
                } else {
                    negevData[j] += data[j];
                }
            }
        }

        self.dataMin = _.min (negevData);
        self.dataMax = _.max (posiData);
    };


    function configureScales (self) {
        // Create an ordinal scale for the x axis
        self.xScale = new Scale.ordinal ();
        self.xScale.domain (self.options.labels);

        self.yScale = new Scale.linear ();
        self.yDomain = yAxisDomain (self);
        self.yScale.domain ([self.yDomain.min, self.yDomain.max]);
    }

    function configureDualAxisScales (self) {
        // Create an ordinal scale for the x axis
        self.xScale = new Scale.ordinal ();
        self.xScale.domain (self.options.labels);
        var domains = dualYAxisDomain (self);
        self.yScale.left = new Scale.linear ();
        self.yDomain.left = domains.left;
        self.yScale.left.domain ([self.yDomain.left.min, self.yDomain.left.max]);

        self.yScale.right = new Scale.linear ();
        self.yDomain.right = domains.right;
        self.yScale.right.domain ([self.yDomain.right.min, self.yDomain.right.max]);
    }

    function configureAxis (self) {
        self.xAxis = new BottomAxis ();
        self.xAxis.config ({
            type: 'ordinal',
            scale: self.xScale,
            ticks: self.labels,
            format: self.options.xAxis.format,
            labelStep: self.options.labelStep
        });

        self.yAxis = new LeftAxis ();
        self.yAxis.config({
            type: 'linear',
            scale: self.yScale,
            ticks: self.yDomain.ticks,
            label: self.options.yAxis.label,
            format: self.options.yAxis.format
        });

        self.yGrid = new YGrid ();
        self.yGrid.config ({
            type: 'linear',
            scale: self.yScale,
            ticks: self.yDomain.ticks
        });
    }

    function configureDualAxis (self) {
        self.xAxis = new BottomAxis ();
        self.xAxis.config({
            type: 'ordinal',
            scale: self.xScale,
            ticks: self.labels,
            format: self.options.xAxis.format
        });

        self.yAxis.left = new LeftAxis ();
        self.yAxis.left.config({
            type: 'linear',
            scale: self.yScale.left,
            ticks: self.hideLeftAxis ? []: self.yDomain.left.ticks,
            label: self.hideLeftAxis ? '' : self.options.yAxis[0].label,
            format: self.options.yAxis.format
        });

        self.yAxis.right = new RightAxis ();
        self.yAxis.right.config({
            type: 'linear',
            scale: self.yScale.right,
            ticks: self.hideRightAxis ? [] : self.yDomain.right.ticks,
            label: self.hideRightAxis ? '' : self.options.yAxis[1].label,
            format: self.options.yAxis.format
        });

        self.yGrid = new YGrid ();
        self.yGrid.config ({
            type: 'linear',
            scale: self.hideLeftAxis ? self.yScale.right : self.yScale.left,
            ticks: self.hideLeftAxis ? self.yDomain.right.ticks : self.yDomain.left.ticks
        });
    }

    function yAxisDomain (self) {
        var min = self.dataMin < 0 ? self.dataMin : 0;
        var max = self.dataMax;
        
        var domain;
        if(_.isNumber(self.yAxisOptions.minValue) || _.isNumber(self.yAxisOptions.maxValue)) {
            var numTicks = 5;
            min = self.yAxisOptions.minValue || min;
            max = self.yAxisOptions.maxValue || max;
            numTicks = self.yAxisOptions.numTicks || numTicks;
            var ticks = [],
                unit = (max - min) / numTicks;
            for(var i=0; i<numTicks + 1; i++) {
                ticks[i] = min + unit * i;
            }
            domain = {
                min: min,
                max: max,
                numTicks: numTicks,
                unit: unit,
                ticks: ticks
            };
        } else {
            domain = GraphUtils.prettyDomain (min, max);
        }
        return domain;
    }

    function dualYAxisDomain (self) {
        var minLeft = self.dataMin.left < 0 ? self.dataMin.left : 0;
        var maxLeft = self.dataMax.left;
        var minRight = self.dataMin.right < 0 ? self.dataMin.right : 0;
        var maxRight = self.dataMax.right;

        var pd = GraphUtils.dualAxisDomain ([minLeft, maxLeft], [minRight, maxRight]);
        return {
            left: pd.lDomain,
            right: pd.rDomain
        };
    }

    /**
     * Call this function to render the chart
     * @param  {Number} w width of the chart
     * @param  {Number} h height of the chart
     */
    LinearChart.prototype.renderTo = function (paper, core, w, h) {
        this.paper = paper;
        this.width = w;
        this.height = h;
        this.core = core;
        // Create Containers group elemets for the chart inner components
        createContainers (this);

        // Set the xScale and render xAxis
        this.xScale.range ([0, w]);
        this.xAxis.renderTo (paper, this.xAxisContainer, w, h);
        OptimizeAxisTicks (this);
        renderYAxis (this);
        // Resize the xAxis since the space taken by yAxis was not considered while rendering
        this.xScale.range ([0, w - this.yAxisWidth]);
        this.xAxis.resizeTo (w - this.yAxisWidth, h);
        this.xAxisContainer.translate(this.yAxisTranslate, (h - this.xAxis.height()));

        // Resize yAxis again since the xaxis labels might have been broken down into lines or tilted
        resizeYAxis (this);

        // Render the plots
        renderPlots (this, w - this.yAxisWidth, h - this.xAxis.height());
        this.plotContainer.translate (this.yAxisTranslate, 0);

        this.core.translate(10,15);
    };

    function renderYAxis (self) {
        var paper = self.paper;
        if(self.options.dualAxis) {
            self.yScale.left.range ([0, self.height - self.xAxis.height()]);
            self.yAxis.left.renderTo (paper, self.yAxisContainer.left, self.width, self.height - self.xAxis.height ());
            self.yAxisContainer.left.translate (self.yAxis.left.width(), 0);

            self.yScale.right.range ([0, self.height - self.xAxis.height()]);
            self.yAxis.right.renderTo (paper, self.yAxisContainer.right, self.width, self.height - self.xAxis.height ());
            self.yAxisContainer.right.translate (self.width - self.yAxis.right.width(), 0);

            self.yAxisWidth = self.yAxis.left.width () + self.yAxis.right.width ();
            self.yAxisTranslate = self.yAxis.left.width ();
        } else {
            // Set the yScale negating the space taken by the xAxis and render the yAxis
            self.yScale.range ([0, self.height - self.xAxis.height()]);
            self.yAxis.renderTo (paper, self.yAxisContainer, self.width, self.height - self.xAxis.height());
            self.yAxisContainer.translate (self.yAxis.width(), 0);
            self.yAxisTranslate = self.yAxisWidth = self.yAxis.width ();
        }
        self.yGrid.renderTo (paper, self.gridContainer, self.width - self.yAxisWidth, self.height - self.xAxis.height ());
    };

    /**
     * Call this function to resize the chart
     * @param  {Number} w width of the chart
     * @param  {Number} h height of the chart
     */
    LinearChart.prototype.resizeTo = function (w, h) {
        this.width = w;
        this.height = h;

        // Set the xScale and render xAxis
        this.xScale.range ([0, w]);
        this.xAxis.resizeTo (w, h);
        OptimizeAxisTicks (this);
        resizeYAxis (this);
        // Resize the xAxis since the space taken by yAxis was not considered while rendering
        this.xScale.range ([0, w - this.yAxisWidth]);
        this.xAxis.resizeTo (w - this.yAxisWidth, h);
        this.xAxisContainer.translate(this.yAxisTranslate, (h - this.xAxis.height()));
        // Resize yAxis again since the xaxis labels might have been broken down into lines or tilted
        resizeYAxis (this);

        resizePlots (this, w - this.yAxisWidth, h - this.xAxis.height());
        this.plotContainer.translate (this.yAxisTranslate, 0);
    };

    function resizeYAxis (self) {
        var w = self.width,
            h = self.height;

        if(self.options.dualAxis) {
            self.yScale.left.range ([0, h - self.xAxis.height ()]);
            self.yAxis.left.resizeTo (w, h - self.xAxis.height());
            self.yAxisContainer.left.translate (self.yAxis.left.width (), 0);

            self.yScale.right.range ([0, h - self.xAxis.height ()]);
            self.yAxis.right.resizeTo (w, h - self.xAxis.height ());
            self.yAxisContainer.right.translate (w - self.yAxis.right.width (), 0);
            self.yAxisWidth = self.yAxis.left.width () + self.yAxis.right.width ();
            self.yAxisTranslate = self.yAxis.left.width ();
        } else {
            self.yScale.range ([0, h - self.xAxis.height()]);
            self.yAxis.resizeTo (w, h - self.xAxis.height());
            self.yAxisContainer.translate (self.yAxis.width(), 0);
            self.yAxisTranslate = self.yAxisWidth = self.yAxis.width ();
        }

        self.yGrid.resizeTo (self.width - self.yAxisWidth, self.height - self.xAxis.height ());
    };

    LinearChart.prototype.update = function (_options) {
        var options = this.options;
        var series = _options.series;
        if(series) {
            for(var i=0; i<series.length; i++) {
                var idx = series[i].seriesIndex;
                var oldSeries = _.where(options.series, {seriesIndex: idx})[0];
                oldSeries.data = series[i].data;
            }
        }

        if(options.stacked) {
            updateStackedLinearChart (this);
        } else if(options.dualAxis) {
            updateDualAxisLinearChart (this);
        } else {
            updateLinearChart (this);
        }
    };

    function updateLinearChart (self) {
        var w = self.width,
            h = self.height;

        calcScaleBounds(self);
        self.yDomain = yAxisDomain (self);
        self.yScale.domain ([self.yDomain.min, self.yDomain.max]);
        self.yAxis.setTicks (self.yDomain.ticks);
        self.yAxis.update ();
        self.yGrid.setTicks (self.yDomain.ticks);
        self.yGrid.update ();
        self.yAxisContainer.translate (self.yAxis.width(), 0);
        updatePlots (self);
        // Resize the xAxis since the space taken by yAxis was not considered while rendering
        self.xScale.range ([0, w - self.yAxis.width()]);
        self.xAxis.resizeTo (w - self.yAxis.width(), h);
        self.xAxisContainer.translate(self.yAxis.width(), (h - self.xAxis.height()));
        resizePlots (self, w - self.yAxis.width(), h - self.xAxis.height());
        self.plotContainer.translate (self.yAxis.width(), 0);
    }

    function updateDualAxisLinearChart (self) {
        var w = self.width,
            h = self.height;
        calcDualAxisScaleBounds (self);
        var domains = dualYAxisDomain (self);
        self.yDomain.left = domains.left;
        self.yScale.left.domain ([self.yDomain.left.min, self.yDomain.left.max]);
        self.yAxis.left.setTicks (self.yDomain.left.ticks);
        self.yAxis.left.update ();
        self.yAxisContainer.left.translate (self.yAxis.left.width (), 0);
        self.yGrid.setTicks (self.yDomain.left.ticks);
        self.yGrid.update ();
        self.yDomain.right = domains.right;
        self.yScale.right.domain ([self.yDomain.right.min, self.yDomain.right.max]);
        self.yAxis.right.setTicks (self.yDomain.right.ticks);
        self.yAxis.right.update ();
        self.yAxisContainer.right.translate (w - self.yAxis.right.width (), 0);

        updatePlots (self);

        // Resize the xAxis since the space taken by yAxis was not considered while rendering
        self.xScale.range ([0, w - self.yAxisWidth]);
        self.xAxis.resizeTo (w - self.yAxisWidth, h);
        self.xAxisContainer.translate(self.yAxisTranslate, (h - self.xAxis.height()));
        resizePlots (self, w - self.yAxisWidth, h - self.xAxis.height());
        self.plotContainer.translate (self.yAxisTranslate, 0);
    }

    function updateStackedLinearChart (self) {
         var w = self.width,
            h = self.height;

        calcStackedScaleBounds(self);
        self.yDomain = yAxisDomain (self);
        self.yScale.domain ([self.yDomain.min, self.yDomain.max]);
        self.yAxis.setTicks (self.yDomain.ticks);
        self.yAxis.update ();
        self.yGrid.setTicks (self.yDomain.ticks);
        self.yGrid.update ();
        self.yAxisContainer.translate (self.yAxis.width(), 0);
        updatePlots (self);
        // Resize the xAxis since the space taken by yAxis was not considered while rendering
        self.xScale.range ([0, w - self.yAxis.width()]);
        self.xAxis.resizeTo (w - self.yAxis.width(), h);
        self.xAxisContainer.translate(self.yAxis.width(), (h - self.xAxis.height()));
        resizePlots (self, w - self.yAxis.width(), h - self.xAxis.height());
        self.plotContainer.translate (self.yAxis.width(), 0);
    }

    function createContainers (self) {
        var paper = self.paper;
        var core = self.core;

        self.xAxisContainer = paper.g();
        self.xAxisContainer.attr ('id', 'rc-xaxis');
        self.xAxisContainer.attr ('class', 'rc-axis');
        core.append (self.xAxisContainer);
        if(self.options.dualAxis) {
            self.yAxisContainer = {};

            self.yAxisContainer.left = paper.g ();
            self.yAxisContainer.left.attr ('id', 'rc-yaxis');
            self.yAxisContainer.left.attr ('class', 'rc-axis');
            core.append (self.yAxisContainer.left);

            self.yAxisContainer.right = paper.g ()
            self.yAxisContainer.right.attr ('id', 'rc-yaxis');
            self.yAxisContainer.right.attr ('class', 'rc-axis');
            core.append (self.yAxisContainer.right);
        } else {
            self.yAxisContainer = paper.g();
            self.yAxisContainer.attr('id', 'rc-yaxis');
            self.yAxisContainer.attr('class', 'rc-axis');
            core.append (self.yAxisContainer);
        }
            

        self.plotContainer = paper.g ();
        self.plotContainer.attr ('id', 'rc-plotcontainer');

        self.gridContainer = paper.g ();
        self.gridContainer.attr ('id', 'rc-gridcontainer');
        self.plotContainer.append (self.gridContainer);

        core.append (self.plotContainer);
    }

    function renderPlots (self, w, h) {
        for(var key in self.plots) {
            var plot = self.plots[key];
            plot.renderTo (self.paper, self.plotContainer, w, h);
        }
    }

    function resizePlots (self, w, h) {
        for(var key in self.plots) {
            var plot = self.plots[key];
            plot.resizeTo (w, h);
        }    
    }

    function updatePlots (self) {
        for(var key in self.plots) {
            var plot = self.plots[key];
            plot.update ();
        }    
    }

    function OptimizeAxisTicks (self) {
        var h = self.height,
            ticks = null;
        if(self.options.dualAxis) {
            if(!self.hideLeftAxis) {
                ticks = self.yDomain.left.ticks;
                var newTicks = OptimizeTicks.optimizeTicks (ticks, h);
                if(newTicks.optimized) {
                    self.yScale.left.domain ([newTicks.ticks[0], newTicks.ticks[newTicks.ticks.length - 1]]);
                    self.yAxis.left.setTicks (newTicks.ticks);
                    self.yAxis.left.reRender (self.paper, self.yAxisContainer.left, self.width, self.height);
                } 
            }
            if(!self.hideRightAxis) {
                ticks = self.yDomain.right.ticks;
                var newTicks = OptimizeTicks.optimizeTicks (ticks, h);
                if(newTicks.optimized) {
                    self.yScale.right.domain ([newTicks.ticks[0], newTicks.ticks[newTicks.ticks.length - 1]]);
                    self.yAxis.right.setTicks (newTicks.ticks);
                    self.yAxis.right.reRender (self.paper, self.yAxisContainer.right, self.width, self.height);
                } 
            }
            ticks = self.hideLeftAxis ? self.yAxis.right.getTicks () : self.yAxis.left.getTicks ();
            self.yGrid.setTicks (ticks);
            self.yGrid.reRender (self.paper, self.gridContainer, self.width, self.height); 
        } else {
            ticks = self.yDomain.ticks;
            var newTicks = OptimizeTicks.optimizeTicks (ticks, h);
            if(newTicks.optimized) {
                self.yAxis.setTicks (newTicks.ticks);
                self.yScale.domain ([newTicks.ticks[0], newTicks.ticks[newTicks.ticks.length - 1]]);
                self.yAxis.reRender (self.paper, self.yAxisContainer, self.width, self.height);
                self.yGrid.setTicks (newTicks.ticks);
                self.yGrid.reRender (self.paper, self.gridContainer, self.width, self.height);
            }
        }
            
    }

    return LinearChart;
});