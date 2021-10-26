import * as React from 'react';
import { StyleSheet, Image, ImageBackground, Linking, Text, TouchableOpacity, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import { FirstScreen } from './screens/firstScreen';
import { SearchScreen } from './screens/searchScreen';
import { SelectSeats } from './screens/selectSeatsScreen';
import { PassengersScreen } from './screens/passengersScreen';
import { PassengersInfoScreen } from './screens/passengersInfoScreen';
import { PayScreen } from './screens/payScreen';
import { ReisScreen } from './screens/reisScreen';
import { InfoEmailPhoneScreen } from './screens/infoEmailPhoneScreen';

const Stack = createStackNavigator();


const App = () => (

  <NavigationContainer>
    <Stack.Navigator>
      <Stack.Screen name="FirstScreen" component={FirstScreen} />	
      <Stack.Screen name="SearchScreen" component={SearchScreen} />
	  <Stack.Screen name="ReisScreen" component={ReisScreen} />
	  <Stack.Screen name="SelectSeatsScreen" component={SelectSeats} />
	  <Stack.Screen name="PassengersScreen" component={PassengersScreen} />
	  <Stack.Screen name="PassengersInfoScreen" component={PassengersInfoScreen} />
	  <Stack.Screen name="PayScreen" component={PayScreen} />
	  <Stack.Screen name="InfoEmailPhoneScreen" component={InfoEmailPhoneScreen} />
	  
    </Stack.Navigator>
  </NavigationContainer>
);


export default App;