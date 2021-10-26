import React , { useState, useEffect, useRef } from 'react';
import { Text, Container , Button , Box, Image , Select , Center , Stack , HStack , Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground } from 'react-native';
import styles from '../styleGobusPanel.js';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import {decode, encode} from 'base-64';
import Dialog from 'react-native-dialog';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'

export const PayScreen = function({route , navigation} ) {
	const { sberUrl } = route.params;/*ссылка на сбер оплату*/
	const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
    const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
	const [ responceFromSrv , setResponceFromSrv ] = useState(0);
    const timerRef = React.useRef();
	
	/*стирание данных из хранилища*/
	const removeValue = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key');
			  await AsyncStorage.removeItem('@storage_key_passengers');
			  await AsyncStorage.removeItem('@storage_key_return');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
	/*диалог*/
	const DialogShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialog}>
            <Dialog.Description style={styles.textSmallInfo}>
			 {props.msg}
            </Dialog.Description>
			<Center >
			<Box style={[styles.dialogBox]}>
			  <Box style={styles.dialogBox1}>
			    <Dialog.Button  style={[styles.dialogStyle ]} label="OK" onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1);setVisibleDialog(false); setLoading(false);}} />
			  </Box>
            </Box>
			</Center>
		   </Dialog.Container>
		)
	}
	
	/*если зашли сюда сразу после passengersInfoScreen то появится <WebView.
	 в зависимости от ответа с сервера после оплаты установим ResponceFromSrv.
	 Сразу после этого установим таймер и выведим одну из двух картинок и перекинем
	 на нужный экран. Так как все данные для экрана passengersInfoScreen сохранены в хранилище
	 в случае неуспешной оплаты мы легко вернемся на него*/
	const Content=()=>{
		if(responceFromSrv==0) return (
		  <WebView
            source={{ uri: sberUrl }}
            style={styles.payImgWeb}
	        onMessage={event => {
                                  if(event.nativeEvent.data=='success'){
				                     setResponceFromSrv(1);
			                      }
			                      else if (event.nativeEvent.data=='fail'){ 
								     setResponceFromSrv(2); 
			                      }
          }}
        />
		)
		else{ 
		  const tim=setTimeout(()=> {
		   if(responceFromSrv==1){ removeValue();
		    navigation.navigate('FirstScreen', { });}
		   else if(responceFromSrv==2)navigation.navigate('PassengersInfoScreen', { });
		   
		   clearTimeout(timerRef.current);
           timerRef.current = 0;
	      },7000);
    	  timerRef.current = tim;
		return(
		<Box style={styles.payImgBox}>
	     <ImageBackground  source={require('../assets/scrbg.png')} style={styles.payImgBackground}>
	      <Center>
	        <Img resp={responceFromSrv}/>
	      </Center>
		 </ImageBackground>
		</Box>
		)}
	}

	/*колбек для таймера*/
	const сallbackEnd=(resp)=>{
		clearTimeout(timerRef.current);
        timerRef.current = 0;
		if(resp==1){ removeValue();
		navigation.navigate('FirstScreen', { });}
		else if(resp==2)navigation.navigate('PassengersInfoScreen', { });
		
	}
	
	const Img = (props) => { 
		if(props.resp==1) return (<Center>
		                            <Image source={require('../assets/success.png')}
                                           style={styles.payImgPict} />
								    <DialogShow msg={msgError} visDialog={visibleDialog}/>
		                            <Text style={styles.payImgText}>Ваш заказ подтвержден и оплачен! </Text>
									<Text style={styles.textSmallInfo}>Проверьте свой почту. В ней Вы найдете письмо со</Text>
									<Text style={styles.textSmallInfo}>ссылкой на страницу заказа, по которой можно распечатать</Text>
									<Text style={styles.textSmallInfo}>билет, а так же отменить поездку и вернуть деньги при необходимости</Text>
	    </Center>)
        else if(props.resp==2) return (<Center>
		                                 <Image source={require('../assets/fail.png')}
                                                style={styles.payImgPict} />
										 <DialogShow msg={msgError} visDialog={visibleDialog}/>
		                                 <Text style={styles.payImgText}>Ваш заказ не оплачен! </Text>
		                                 <Text style={styles.textSmallInfo}>Попробуйте оплатить снова или обратитесь в службу поддержки </Text>
		                               </Center>)
	}
	
	
    return (
	<NativeBaseProvider>
       <Content /> 
	</NativeBaseProvider>    
    );	
}
