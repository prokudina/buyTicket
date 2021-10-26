import React , { useState, useEffect } from 'react';
import { Text, Container , Center, Stack, VStack, HStack, Button , Box, Image , NativeBaseProvider } from 'native-base';
import { ImageBackground } from 'react-native';
import styles from '../styleGobusPanel.js';
import axios from 'axios';
 
export const FirstScreen = function({navigation}) {
   const Main= () => {

     
      
	   
	  return ( 
	    <Box style={styles.container}>
		  <ImageBackground source={require('../assets/scrbg.png')} style={styles.image_}>
		    <Box style={[styles.content]}>
			  <Box style={[styles.intro]}>
			   <Image alt="Canvas Logo"  style={styles.logo} source={require('../assets/new_gobus_log.png')} />
			  </Box>
			  <Box style={[styles.outro]}>
			    <Button
				style={[styles.buttonFirstScreen , styles.mainButtons , styles.widthMainButtonFirstScreen]}
				onPress={() => {navigation.navigate('SearchScreen')}}
			    >
				  <Text style={styles.textButtonFirstScreen}>КУПИТЬ БИЛЕТ</Text>
			    </Button>
			  </Box>
			</Box>
		  </ImageBackground>
        </Box>
	  )
  }
	
  return ( 
     <NativeBaseProvider>
	   <Main />
     </NativeBaseProvider>	 
  );
}

