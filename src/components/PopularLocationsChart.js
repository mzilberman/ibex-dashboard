import Fluxxor from 'fluxxor';
import React from 'react';
import numeralLibs from 'numeral';
import {SERVICES} from '../services/services';

const MAX_ZOOM = 15;
const DEFAULT_LANGUAGE = "en";
const FluxMixin = Fluxxor.FluxMixin(React),
      StoreWatchMixin = Fluxxor.StoreWatchMixin("DataStore"),
      chartDivReference = "popularLocationsPieDiv";

export const PopularLocationsChart = React.createClass({
  mixins: [FluxMixin, StoreWatchMixin],
  
  getStateFromFlux: function() {
    return this.getFlux().store("DataStore").getState();
  },

  initializeGraph(){
    let self = this;

    this.popularLocationsChart = window.AmCharts.makeChart(chartDivReference, {
        "theme": "dark",
        "type": "pie",
        "startDuration": 1,
        "balloonText": "[[term]]: <b>[[mentionFmt]]</b>  mentions<br>Est Pop: <b>[[population]]</b> people",
        "labelColor": "#fff",
        "radius": 70,
        "pullOutRadius": 0,
        "labelRadius": 1,
        "innerRadius": 22,
        "gradientRatio": [-0.4, -0.4, -0.4, -0.4, -0.4, -0.4, 0, 0.1, 0.2, 0.1, 0, -0.2, -0.5],
        "outlineAlpha": 0,
        "valueField": "mentions",
        "labelText": "[[displayLabel]] - [[mentionFmt]]",
        "titleField": "displayLabel",
        "export": {
            "enabled": true
        },
        "allLabels": [{
            "text": "Top 5 Locations",
            "bold": true,
            "size": 12,
            "color": "#fff",
            "x": 0,
            "align": "center",
            "y": 200
        }]
    });

    this.popularLocationsChart.addListener("clickSlice", e => {
        if(e.dataItem.dataContext){
              let entity = {
                  "type": "Location",
                  "properties": {
                      "name": e.dataItem.dataContext.term,
                      "coordinates": e.dataItem.dataContext.coordinates,
                  }
              };
              self.getFlux().actions.DASHBOARD.changeSearchFilter(entity, this.props.siteKey);
        }
    });
 },

 refreshChart(locations){
    let maxAxesDisplayLabelChars = 16;
    let dataProvider = [];

    locations.forEach(location => {
              let label = location.properties.location;
              let mentions = location.properties.mentions;
              let coordinates = location.coordinates;
              let population = numeralLibs(location.properties.population).format(location.properties.population > 1000 ? '+0.0a' : '0a');
              let displayLabel = label.length > maxAxesDisplayLabelChars ? label.substring(0, maxAxesDisplayLabelChars) : label;
              let mentionFmt = numeralLibs(mentions).format(mentions > 1000 ? '+0.0a' : '0a');
              dataProvider.push({coordinates: coordinates, population: population, 
                                 displayLabel: displayLabel, term: label, category: "Location",
                                 mentions: mentions, mentionFmt: mentionFmt, color: '#ccc'});
    });

    this.popularLocationsChart.dataProvider = dataProvider;
    this.popularLocationsChart.validateData();
 },

 updateChart(period, timespanType){
     let self = this;

     SERVICES.getMostPopularPlaces(this.props.siteKey, period, timespanType, DEFAULT_LANGUAGE, MAX_ZOOM, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    if(body && body.data && body.data.popularLocations && body.data.popularLocations.features){
                        self.refreshChart(body.data.popularLocations.features);
                    }
                }else{
                    console.error(`[${error}] occured while processing tile request [${this.state.categoryValue}, ${this.state.datetimeSelection}`);
                }
      });
  },

  componentWillReceiveProps(nextProps){
      if(!this.popularLocationsChart){
          this.initializeGraph();
          this.updateChart(nextProps.datetimeSelection, nextProps.timespanType);
      }else if(this.props.datetimeSelection !== nextProps.datetimeSelection){
          this.updateChart(nextProps.datetimeSelection, nextProps.timespanType);
      }
  },
  
  render() {
    return (
        <div>
        </div>
     );
   }
});