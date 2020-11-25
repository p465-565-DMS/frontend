import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Redirect, useHistory } from "react-router-dom";
// react plugin used to create google maps
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from "react-google-maps";
// reactstrap components
import { Card, CardHeader, CardBody, Row, Col } from "reactstrap";
import axios from 'axios';

const MapWrapper = withScriptjs(
  withGoogleMap((props) => (
    <GoogleMap
      defaultZoom={13}
      defaultCenter={{ lat: 39.1653, lng: -86.5264 }}
      defaultOptions={{
        scrollwheel: false, //we disable de scroll over the map, it is a really annoing when you scroll through page
        styles: [
          {
            featureType: "water",
            stylers: [
              {
                saturation: 43,
              },
              {
                lightness: -11,
              },
              {
                hue: "#0088ff",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [
              {
                hue: "#ff0000",
              },
              {
                saturation: -100,
              },
              {
                lightness: 99,
              },
            ],
          },
          {
            featureType: "road",
            elementType: "geometry.stroke",
            stylers: [
              {
                color: "#808080",
              },
              {
                lightness: 54,
              },
            ],
          },
          {
            featureType: "landscape.man_made",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#ece2d9",
              },
            ],
          },
          {
            featureType: "poi.park",
            elementType: "geometry.fill",
            stylers: [
              {
                color: "#ccdca1",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [
              {
                color: "#767676",
              },
            ],
          },
          {
            featureType: "road",
            elementType: "labels.text.stroke",
            stylers: [
              {
                color: "#ffffff",
              },
            ],
          },
          {
            featureType: "poi",
            stylers: [
              {
                visibility: "off",
              },
            ],
          },
          {
            featureType: "landscape.natural",
            elementType: "geometry.fill",
            stylers: [
              {
                visibility: "on",
              },
              {
                color: "#b8cb93",
              },
            ],
          },
          {
            featureType: "poi.park",
            stylers: [
              {
                visibility: "on",
              },
            ],
          },
          {
            featureType: "poi.sports_complex",
            stylers: [
              {
                visibility: "on",
              },
            ],
          },
          {
            featureType: "poi.medical",
            stylers: [
              {
                visibility: "on",
              },
            ],
          },
          {
            featureType: "poi.business",
            stylers: [
              {
                visibility: "simplified",
              },
            ],
          },
        ],
      }}
    >
      {/* user location: */}
      <Marker position={{ lat: props.lat, lng: props.lng }} />
      {/* random locations */}
      {/* <Marker position={{ lat: 39.1653, lng: -86.5264 }} />
      <Marker position={{ lat: 39.1630, lng: -86.5230 }} />
      <Marker position={{ lat: 39.1700, lng: -86.5210 }} /> */}
      <Marker position={{ lat: 39.1400, lng: -86.5890 }} /> 
    </GoogleMap>
  ))
);

export default function Map() {
  const [url, setUrl] = useState("");
  const [data, setData] = useState({});
  const { user, getAccessTokenSilently } = useAuth0();
  const apiUrl = process.env.REACT_APP_API_URL;
  const [formatAddress, setAddress]  = useState("");
  const [userLat, setLat]  = useState("");
  const [userLng, setLng]  = useState("");
  var autoDriveSteps = new Array();
  var speedFactor = 10; // 10x faster animated drive

  function setAnimatedRoute(origin, destination, map) {
      // init routing services
      var directionsService = new window.google.maps.DirectionsService;
      var directionsRenderer = new window.google.maps.DirectionsRenderer({
          map: map
      });

      //calculate route
      directionsService.route({
              origin: origin,
              destination: destination,
              travelMode: window.google.maps.TravelMode.DRIVING
          },
          function(response, status) {
              if (status == window.google.maps.DirectionsStatus.OK) {
                  // display the route
                  directionsRenderer.setDirections(response);

                  // calculate positions for the animation steps
                  // the result is an array of LatLng, stored in autoDriveSteps
                  autoDriveSteps = new Array();
                  var remainingSeconds = 0;
                  var leg = response.routes[0].legs[0]; // supporting single route, single legs currently
                  leg.steps.forEach(function(step) {
                      var stepSeconds = step.duration.value;
                      var nextStopSeconds = speedFactor - remainingSeconds;
                      while (nextStopSeconds <= stepSeconds) {
                          var nextStopLatLng = getPointBetween(step.start_location, step.end_location, nextStopSeconds / stepSeconds);
                          autoDriveSteps.push(nextStopLatLng);
                          nextStopSeconds += speedFactor;
                      }
                      remainingSeconds = stepSeconds + speedFactor - nextStopSeconds;
                  });
                  if (remainingSeconds > 0) {
                      autoDriveSteps.push(leg.end_location);
                  }
              } else {
                  window.alert('Directions request failed due to ' + status);
              }
          });
  }

  // helper method to calculate a point between A and B at some ratio
  function getPointBetween(a, b, ratio) {
      return new window.google.maps.LatLng(a.lat() + (b.lat() - a.lat()) * ratio, a.lng() + (b.lng() - a.lng()) * ratio);
  }

  // start the route simulation   
  function startRouteAnimation(marker) {
      var autoDriveTimer = setInterval(function () {
              // stop the timer if the route is finished
              if (autoDriveSteps.length === 0) {
                  clearInterval(autoDriveTimer);
              } else {
                  // move marker to the next position (always the first in the array)
                  marker.setPosition(autoDriveSteps[0]);
                  // remove the processed position
                  autoDriveSteps.shift();
              }
          },
          1000);
  }

  React.useEffect(() => {
    (async () => {
      try {
      const token = await getAccessTokenSilently();
      let result = await fetch(`${apiUrl}/api/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const res = await result.json();
      setUrl(res[0].googlelink);
      // console.log(res[0].address+", "+res[0].city + ", " + res[0].zipcode);
      setAddress(res[0].address + "," + res[0].city + "," + res[0].zipcode);
      
    } catch{}
  })(data);
  },[user]);

  // console.log(formatAddress);
  // console.log(url);
  axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
    params:{
      address: formatAddress,
      key:'AIzaSyCeyruKDAu13YYMgWVU6f4ZPk_zRFmzsgY'
    }
  })
  .then(function(response){
    let lat = response.data.results[0].geometry.location.lat;
    let lng = response.data.results[0].geometry.location.lng;
    setLat(lat);
    setLng(lng);
    setAnimatedRoute((39.1400,-86.5890),(lat,lng),GoogleMap)
    startRouteAnimation((39.1400,-86.5890))
    // console.log(response)
    // console.log(formatAddress)
    // console.log(lat)
    // console.log(lng)
  })
  .catch(function(error){
    console.log(error.response);
  });

  // render() {
    return (
      <>
        <div className="content">
          <Row>
            <Col md="12">
              <Card>
                <CardHeader>Google Maps</CardHeader>
                <CardBody>
                  <div
                    id="map"
                    className="map"
                    style={{ position: "relative", overflow: "hidden" }}
                  >
                    <MapWrapper
                      googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCeyruKDAu13YYMgWVU6f4ZPk_zRFmzsgY"
                      loadingElement={<div style={{ height: `100%` }} />}
                      containerElement={<div style={{ height: `100%` }} />}
                      mapElement={<div style={{ height: `100%` }} />}
                      lat = {userLat}
                      lng = {userLng}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </>
    );
  }