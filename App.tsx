import React, { useEffect, useRef, useState } from 'react';
import MapView, { LatLng, Marker } from 'react-native-maps';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import * as Location from 'expo-location';

export default function App() {
  const map = useRef<MapView>(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 1000,
    longitudeDelta: 1000
  });
  const [currentLocation, setCurrentLocation] = useState<LatLng | undefined>(undefined);
  const [nextLocation, setNextLocation] = useState<LatLng | undefined>(undefined);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  


  useEffect(() => {
      if(currentLocation && nextLocation){
        centerMap([currentLocation, nextLocation]);
      }
      else {
        handleCenterMap();
      }

  }, [currentLocation, nextLocation]);


  const centerMap = (coords:Array<LatLng>) => {
    if(coords.length > 1){
      map.current?.fitToCoordinates(coords, {
        edgePadding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20,
        }
      });
    }
    else if(coords.length === 1){
      map.current?.animateToRegion({
        latitude: coords[0].latitude,
        longitude: coords[0].longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.05
      });
    }
  }


  const userLocation = async () => {
    let {status} = await Location.requestForegroundPermissionsAsync();
    
    if(status === 'granted'){
      let location = await Location.getCurrentPositionAsync({});
      
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    
    else {
      console.log("permission not granted");
    }
  }

  const handleCenterMap = () => {
    centerMap(currentLocation && nextLocation ? [currentLocation, nextLocation] :
      currentLocation ? [currentLocation] :
      nextLocation ? [nextLocation] :
      []);
  }


  const reset = () => {
    setCurrentLocation(undefined);
    setNextLocation(undefined);

    setMapRegion({
      latitude: 0,
      longitude: 0,
      latitudeDelta: 1000,
      longitudeDelta: 1000
    });

    map.current?.animateToRegion(mapRegion);
  }


  return <>
    <View style={styles.container}>
      
      <MapView 
        style={isMapFullScreen ? styles.mapFullScreen:  styles.map } 
        region={mapRegion} 
        onDoublePress={() => !isMapFullScreen && setIsMapFullScreen(true)}
        ref={map}
      >
        {currentLocation && <Marker coordinate={currentLocation} title={'Start'}/>}
        {nextLocation && <Marker coordinate={nextLocation} title={'End'}/>}
      </MapView>


      {isMapFullScreen && 
        <TouchableOpacity style={styles.xBtn} onPress={() => setIsMapFullScreen(false)}>
          <Text style={styles.btnText}>X</Text>
        </TouchableOpacity>
      }

      <TouchableOpacity style={styles.btn} onPress={userLocation}>
        <Text style={styles.btnText}>Set current position</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={() => setNextLocation({latitude: 45.48871350788562, longitude: -73.5682688419356})}>
        <Text style={styles.btnText}>Set Other Position</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={isMapFullScreen ? [styles.btn, styles.bottomBtn] : [styles.btn]} 
        onPress={handleCenterMap}
      >
        <Text style={styles.btnText}>Center Map</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.btn} onPress={reset}>
        <Text style={styles.btnText}>Reset</Text>
      </TouchableOpacity>
    </View>
  </>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: 400
  },
  mapFullScreen: {
    width: '100%',
    height: '100%'
  },
  btn: {
    backgroundColor: '#0ea5e9',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 10,
    marginTop: 10,
    borderRadius: 10,
  },
  bottomBtn:{
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '100%',
    marginHorizontal: 0,
    borderRadius: 0
  },
  xBtn:{
    backgroundColor: '#dc2626',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: 30,
    width: 30,
    borderRadius: 30,
    position: 'absolute',
    right: 30,
    top: 30
  },
  btnText:{
    color: 'white',
    fontSize: 20
  }

});