import React , { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Text, Container , Button , Heading, Box, Image , Center , Stack , VStack , HStack, Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground , TouchableOpacity } from 'react-native';
import styles from '../styleGobusPanel.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlane,faTrain,faBus,faTaxi,faAnchor } from '@fortawesome/free-solid-svg-icons';
import { faWordpress } from '@fortawesome/free-brands-svg-icons';
import Dialog from 'react-native-dialog';
import { confirmAlert } from 'react-confirm-alert';
import {decode, encode} from 'base-64';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'

export const ReisScreen = function({route , navigation}) { 
  let findReises=[];

  const { searchTrip } = route.params;	
  const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
  const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
  const [visibleCountDial , setVisibleCountDial] = React.useState(false);
  const [timer , setTimer] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
  const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/  
  const timerRef = React.useRef();
  const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/
  const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
  const [countDial , setCountDial] = React.useState(10);/*обратный отсчет секунд*/
  
  stateRef.current = countTouch;
  
  const Li = (props) => {//отдельный значек 
	   let iconFA=''; 
	   if (props.icon_==0) return <Box></Box>;
	   else
       switch(props.icon_){
		   case 'fa fa-plane': return <FontAwesomeIcon icon={faPlane} />;
		   case 'fa fa-train': return <FontAwesomeIcon icon={faTrain} />;
		   case 'fa fa-bus': return <FontAwesomeIcon icon={faBus} />;
		   case 'fa fa-taxi': return <FontAwesomeIcon icon={faTaxi} />;
		   case 'fa fa-anchor': return <FontAwesomeIcon icon={faAnchor} />;
		   default : return <FontAwesomeIcon icon={faWordpress} style={{transform: [{rotateY: '180deg'}]}}/>;
	   }	
	}
	
   useEffect(()=>{
	const unsubscribe = navigation.addListener('focus', () => {
	 const tim=setInterval( сallbackTouch,45000);
	 timerRef.current = tim;
     //setTimer(tim);				
     });
	return unsubscribe;
	},[]); 
	
	const removeValueAnother = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key');
			  await AsyncStorage.removeItem('@storage_key_sits');
			  await AsyncStorage.removeItem('@storage_key_passengers');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
  
    const removeValueReturn = async () => {
	 try {
		   await AsyncStorage.removeItem('@storage_key_return')
		 } 
	 catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
	/*колбек функция по которой если пользов не кликнул на экране то открыть окно с обратным отсчетом и запустить другой таймер иначе обнулить счетчик*/
	const сallbackTouch= ()=> {
		if(stateRef.current==0){
          setVisibleCountDial(true);		
          const tim2=setInterval(callbackTouch2,1000);
          timerRef2.current=tim2;
		}
		else setCountTouch(0);
	}
	
	/*калбек функция по которой будет уменьшаться цифры в счетчике в окне*/
	const callbackTouch2=()=>{ 
		setCountDial(countDial => countDial-1);
	}
	
	/*показать сообщение с обратным отсчетом
	Если во время отсчета кликнуть по экрану то окно закроется и 2-ой таймер остановится
	если не кликать то по окончании отсчета все таймеры очистятся, окно закроется и
	произойдет переход на первый экран*/
	const CountShow =(props) =>{  
		if(countDial>0){
		  if(stateRef.current!==0){  
		           setCountDial(10);
				   clearInterval(timerRef2.current);
                   timerRef2.current = 0;
				   setVisibleCountDial(false);
		  }
		}
        else {
			    setCountTouch(0);
			    clearInterval(timerRef2.current);
                timerRef2.current = 0;
			    stateRef.current=0;
				clearInterval(timerRef.current);
                timerRef.current = 0;
				removeValueAnother();
                removeValueReturn();
				navigation.navigate('FirstScreen',{});
		}
		
		if(visibleCountDial==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.countPosition]}>
                      <Text style={styles.textCountStyle}>До возвращения на экран поиска осталось {props.dCount} сек</Text>
			          <Text style={styles.textCountStyle}>Коснитесь экрана, чтобы остаться </Text>
                    </Box>	
	}
  
    const removeValue = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_return');
			  await AsyncStorage.removeItem('@storage_key');
			  await AsyncStorage.removeItem('@storage_key_passengers');
			  await AsyncStorage.removeItem('@storage_key_sits');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
  }	
  
  /*диалог*/
  const DialogShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialog}>
            <Dialog.Description>
			 {props.msg}
            </Dialog.Description>
			<Dialog.Button label="OK" onPress={()=>{setVisibleDialog(false)}} />
           </Dialog.Container>
		)
  }
  
  const Icon = (props) => { return props.ic.map((item) => <Li icon_={item} />); }//массив значков для рейса		
  
  const Titles = () => { if(searchTrip.length<1) return <Box></Box>;
	            else return <Box style={styles.searchResultDiv}>
                              <Text style={[styles.dispatchDiv,styles.textHeadReis ]}>Отправление</Text>
	                          <Text style={[styles.arrivalDiv,styles.textHeadReis ]}>Прибытие</Text>
	                          <Text style={[styles.tripDiv,styles.textHeadReis ]}>Рейс</Text>
	                          <Text style={[styles.priceDiv,styles.textHeadReis ]}>Цена</Text>
	                        </Box>};
  const SingleReis=(props)=>{//заполнение кнопок по каждому рейсу Отображаются ниже формы поиска
	  let timeDat1=props.timeStart;
	  let tim1=timeDat1.split(' ');
	  let time1=tim1[1];
	  var arr=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
	  let dat1=tim1[0].split('.');
	  let mon1=arr[dat1[1]-1];
	  console.log(props.isOwn);
	  let timeDat2=props.timeEnd;
	  let tim2=timeDat2.split(' ');
	  let time2=tim2[1];
	  let dat2=tim2[0].split('.');
	  let mon2=arr[dat2[1]-1];
	  let icons=[];
	  if( props.pointEndTags.length!==0){
        for (var prop in props.pointEndTags) {
         icons.push(props.pointEndTags[prop].icon)
        }
	  }
	  else icons.push(0);
	
	  const funcReturnOwn=() => { 
	                              clearInterval(timerRef2.current);
								  timerRef2.current = 0;
								  clearInterval(timerRef.current);
                                  timerRef.current = 0;
								  stateRef.current = 0;
								  
		                          navigation.navigate('SelectSeatsScreen',
								                {idReis: props.id,
												 isOwn: props.isOwn,
												 searchTrip: searchTrip})}
												 
      const funcReturnAlien=() => {
		                           clearInterval(timerRef2.current);
								  timerRef2.current = 0;
		                           clearInterval(timerRef.current);
                                   timerRef.current = 0;
								   stateRef.current = 0;

		                           navigation.navigate('SelectSeatsScreen',
								                {idReis: props.id,
												 isOwn: props.isOwn,
												 searchTrip: searchTrip,
												 provider: props.provider,
												 date: tim1[0]})}												 

	  if(searchTrip.length==0){
	    setMsgError('По вашему запросу ничего не найдено');
		setVisibleDialog(true); 
	  }
	  else
	  return(
	         <Box key={props.index.toString()} style={[styles.dispatchSingle ]}>
               <Stack >
                 <HStack  space={0} >			   
			       <Center  style={[styles.citySt ]}>
			         <Text  style={[styles.reisStyle , styles.infoReis ]}>{dat1[0]+' '+mon1+' '+time1}</Text>
			         <Text  style={[styles.reisStyle]}> {props.cityStart}</Text>
					 <Text  style={[styles.reisStyle]}>{props.pointStart}</Text>
			       </Center>
				   <Center  alignItems="flex-start" style={[styles.citySt]}>
			         <Text  style={[styles.reisStyle , styles.infoReis]}>{dat2[0]+' '+mon2+' '+time2}</Text>
				     <Text  style={[styles.reisStyle]}> {props.cityEnd}</Text>
					 <Text  style={[styles.reisStyle]}> {props.pointEnd}</Text>
			       </Center>
			       <Center  alignItems="flex-start" style={[styles.reisSt]}>
			         <Text  style={[styles.reisStyle , styles.infoReis]}>Время в пути {props.duration}</Text>
				     <Text  style={styles.reisStyleFreePl}> Cвободных мест: {props.numEmptySeats}</Text>
			       </Center>
				   <Center  alignItems="flex-start" style={[styles.costSt ]}>
			         <Text  style={[styles.reisStyle , styles.infoReis]}>{props.cost} P</Text>
				     <Icon   ic={icons} />	
			       </Center>
				   <Center style={[styles.buyButtonSt]}>
			         <Button style={styles.buttonB}
					         onPress={()=>{ 
								clearInterval(timerRef.current);
                                timerRef.current = 0;
								stateRef.current = 0;
								if(props.isOwn==true) funcReturnOwn();
								                 else funcReturnAlien(); 
							 }}>
					   <Text style={[styles.reisStyle,styles.textHeadReis , styles.infoReis]}>Купить</Text>
					 </Button>	
			       </Center>
			     </HStack>
			   </Stack>  
			 </Box>
			);
	}							
  findReises.push(searchTrip.map((trip,index) =>{ if(trip.is_own==true) return(<SingleReis index={index} timeStart={trip.timeStart} 
	                                                                                                     cityStart={trip.cityStart}
                                                                                                         pointStart={trip.pointStart}
                                                                                                         timeEnd={trip.timeEnd}
                                                                                                         cityEnd={trip.cityEnd}
                                                                                                         pointEnd={trip.pointEnd}
																			                             duration={trip.duration}
																			                             numEmptySeats={trip.numEmptySeats}
																			                             cost={trip.cost}
																			                             id={trip.id}
																			                             pointEndTags={trip.pointEndTags}
	                                                                                                     isOwn={trip.is_own}/>);
									                else return (<SingleReis index={index} timeStart={trip.timeStart} 
	                                                                                     cityStart={trip.cityStart}
                                                                                         pointStart={trip.pointStart}
                                                                                         timeEnd={trip.timeEnd}
                                                                                         cityEnd={trip.cityEnd}
                                                                                         pointEnd={trip.pointEnd}
																			             duration={trip.duration}
																			             numEmptySeats={trip.numEmptySeats}
																			             cost={trip.cost}
																			             id={trip.id}
																			             pointEndTags={trip.pointEndTags}
	                                                                                     isOwn={trip.is_own}
																						 provider={trip.provider}/>)}));
																						 
  return(
    <NativeBaseProvider>
       <Box style={styles.container}>
	     <ImageBackground  source={require('../assets/scrbg.png')} style={styles.image_}>
		   <TouchableOpacity style={styles.image_} onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1)}}>
		    <Titles />
		    <CountShow visDialogCount={visibleCountDial} dCount={countDial}/>
			<DialogShow msg={msgError} visDialog={visibleDialog}/>
		    <ScrollView style={[styles.fullWidth]}>
			 {findReises}
		    </ScrollView>
		    <View style={[styles.blockButtonsReisScreen]}>
			  <Button style={[styles.buttonsHeight , styles.mainButtons, styles.widthMainButtonFirstScreen ]} 
				         onPress={()=>{ 
						                clearInterval(timerRef2.current);
										timerRef2.current = 0;
						                clearInterval(timerRef.current);
                                        timerRef.current = 0;
						                stateRef.current = 0;
										
						                navigation.navigate('FirstScreen',
							                       {searchTrip: searchTrip,
												    flagFromReisScreen: true}); }}>
				 <Text style={styles.textButtonFirstScreen}>Выход</Text>
			  </Button>
		    </View>
		  </TouchableOpacity>
		 </ImageBackground>
	   </Box>
	</NativeBaseProvider>
  );
};