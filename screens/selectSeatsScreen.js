import React , { useState, useEffect, useRef } from 'react';
import { Text, Container , View, Button , Heading, Box, VStack, Image , Select , Center , Stack , HStack , Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground , TouchableOpacity , TextInput} from 'react-native';
import styles from '../styleGobusPanel.js';
import axios from 'axios';
import MaskInput from 'react-native-mask-input';
import {decode, encode} from 'base-64';
import SelectMultiple from 'react-native-select-multiple';
import Dialog from 'react-native-dialog';
import ComboBox from 'react-native-combobox';
import { TextInputMask } from 'react-native-masked-text';
import Autocomplete from 'react-native-autocomplete-input';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon  } from '@fortawesome/react-native-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DoubleCircleLoader } from 'react-native-indicator';

export const SelectSeats = function({route , navigation}) { 
    const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
	const [visibleCountDial , setVisibleCountDial] = React.useState(false);
    const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
	const [visibleDialogQuestion, setVisibleDialogQuestion] = useState(false);//показать/скрыть диалоговое окно
	const { idReis } = route.params;/*идентификатор рейса полученый из предыдущего экрана*/
	const {isOwn} = route.params;/*признак того-является ли выбранный рейс своим или чужим*/
	const {provider} = route.params;/*если рейс не наш то это провайдер*/
	const {date} = route.params;/*если рейс не наш то это дата то это начало отправления*/
	const { searchTrip } = route.params;/*список рейсов если польз решит вернуться на пред стр*/
	const { emailFrom } = route.params;
	const { phoneFrom } = route.params;
	const [infoReis , setInfoReis]=React.useState([]);/*массив информации о выбраном рейсе*/
	const [timeStart , setTimeStart]=React.useState('');/*время отправления*/
	const [timeEnd , setTimeEnd]=React.useState('');/*время прибытия*/
	const [dateStart , setDateStart] = React.useState('');/*дата отправления*/
	const [carrier , setCarrier]=React.useState({});/*объект перевозчик*/
	const [idPointStart , setIdPointStart] = React.useState('');/*идентиф точки отправки*/
	const [idPointEnd , setIdPointEnd] = React.useState('');/*идентиф точки конечной остановки*/
	const [bus , setBus]=React.useState({});/*объект автобус*/
	const [tariffs , setTariffs]=React.useState([]);/*массив тарифов*/
	const [loading, setLoading] = React.useState(true);/*состояние индикатора загрузки*/

	const [phone, setPhone] = React.useState('11');/*значения вводимые в поле номера тел*/
	const [maskPhone , setMaskPhone] = React.useState([/[793]/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]);/*маска для тел*/
	
	const [flagEmail , setFlagEmail] = React.useState(false);/*определяет правильность ввода пользователем email*/
	const [flagPhone , setFlagPhone] = React.useState(false);/*определяет правильность ввода пользователем тел*/
	const [maskTel , setMaskTel] = React.useState('999999999999');/*маска для ввода тел*/
	const [email , setEmail] = React.useState('');/*значения вводимые в поле email*/
	
	const [ selectSits , setSelectSits ] = React.useState([]);/*номера мест которые выбрали*/
	const [ disabledButton , setDisabledButton ] = React.useState(false);/*если true то будет доступна кнопка Далее*/
	
	const [ countPassengers , setCountPassengers ] = React.useState(0);/*количество пассажиров которые поедут*/
	
	const [ flagReturn , setFlagReturn ] = React.useState(false);/*если вернулись сюда со страницы оформления пассажиров*/
	
	/*const { getItem, setItem } = useAsyncStorage('@storage_key_return_sits');*/
	const { getItem , setItem } = useAsyncStorage('@storsge_key_sits');
	
	const [timer , setTimer] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
    const [ timer2 , setTimer2 ] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/ 
	const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/
	
	const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/  
    const timerRef = React.useRef();
	const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
	const [countDial , setCountDial] = React.useState(10);/*обратный отсчет секунд*/
	
	stateRef.current = countTouch;
    
	/*индикатор загрузки*/
	const LoadIndic=()=>{ 
		if(loading==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.loadIndicPosition]}>
                       <DoubleCircleLoader size={120} color={'#696969'}/>
                    </Box>
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
				   //setVisibleCountDial(false);
		  }
		}
        else {
			    //setCountTouch(0);
			    clearInterval(timerRef2.current);
                timerRef2.current = 0;
			    stateRef.current=0;
				clearInterval(timerRef.current);
                timerRef.current = 0;
				removeItemFromStorage();
				removeValue();
				navigation.navigate('FirstScreen',{});
		}
		
		if(visibleCountDial==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.countPositionSeats]}>
                      <Text style={styles.textCountStyle}>До возвращения на экран поиска осталось {props.dCount} сек</Text>
			          <Text style={styles.textCountStyle}>Коснитесь экрана, чтобы остаться </Text>
                    </Box>	
	}
	
	const removeValue = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_passengers');
			  await AsyncStorage.removeItem('@storage_key_return');
			  await AsyncStorage.removeItem('@storage_key');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    } 
	
	
	/*диалог если произошла ошибка*/
	const DialogShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialog}>
            <Dialog.Description style={styles.textSmallInfo}>
			 {props.msg}
            </Dialog.Description>
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button  style={styles.dialogStyle} label="OK" onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1);setVisibleDialog(false); setLoading(false);}} />
            </Box>
			</Center>
		   </Dialog.Container>
		)
	}
	
	/*диалог для информирования о том как выбрать места*/
	const DialogQuestionShow=(props)=>{ 
		return(
	
		   <Dialog.Container visible={props.visQuestionDialog}>
		    <Dialog.Title  style={styles.dialogTitleStyle}>Как выбрать места в автобусе ?</Dialog.Title>
            <Dialog.Description>
			  
			  <Box
                   style={styles.dialogBoxInfo}
              >
			   <Text style={styles.dialogTitleInfo}>Кликните понравившиеся свободные места</Text>
               <View style={[styles.dialogViewMainStyle,styles.butFree]} >
			     <Text style={[styles.dialogTextInfo,styles.searchRow]}>Свободно</Text>
			   </View>
               <View style={[styles.butSold,styles.dialogViewMainStyle]} >
			     <Text style={[styles.dialogTextInfo,styles.searchRow]}>Продано</Text>
			   </View>
			   <View style={[styles.butBron,styles.dialogViewMainStyle]} >
			     <Text style={[styles.dialogTextInfo,styles.searchRow]}>Забронировано</Text>
			   </View>
			   <View style={[styles.butBlockThisUser,styles.dialogViewMainStyle]} >
			     <Text style={[styles.dialogTextInfo,styles.searchRow]}>Зарезервировано Вами на 5 минут</Text>
			   </View>
               <View style={[styles.butBlockAnotherUser,styles.dialogViewMainStyle],{borderWidth:1,borderColor:'black',borderRadius:5 } } >
			     <Text style={[styles.dialogTextInfo,styles.searchRow]}>Зарезервировано кем-то на 5 минут</Text>
			   </View>
             </Box>
            </Dialog.Description>
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button style={styles.dialogStyle} label="OK" onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1); setVisibleDialogQuestion(false)}} />
			</Box>
			</Center>
           </Dialog.Container>
		
		)
	}
		
	/*запись в хранилище ключа о том что мы вернулись*/
	/*const writeItemToStorage = async newValue => {  
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key',jsonValue); 
    };*/
	
	/*запись в хранилище количества выбранных мест*/
	const writeItemToStorage = async newValue => {  
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key_sits',jsonValue); 
    };
	
	/*чтение из хранилища мест*/
	const readItemFromStorage = async () => { 
	
      const item = await AsyncStorage.getItem('@storage_key_sits'); 
	  if((item!==null)&&(item!==undefined)) {
	    var a=JSON.parse(item);
		setSelectSits(a);
	  }
	  setDisabledButton(false);
    };
	
	const removeItemFromStorage = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_sits')
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
	let tarif_price=[];
	let mas11=['370','373','371','374','993','372'];
	let mas12=['380','375','998','995','994','996','992'];
	let countPas=0;
	
    let masAllSeatsInBus=[];/*массив всех мест в автобусе включая занятые. Все будет в виде кнопок отображаться*/
    const [seats,setSeats]=React.useState([]);/*массив всех мест в автобусе, полученый в запросе от сервера*/
	
	if (!global.btoa) { global.btoa = encode; }

    if (!global.atob) { global.atob = decode; }

	const okDialogButton = () => { setVisibleDialog(false); };/*скрыть диалог*/
	
	const tarifAndPrice = (name,price) =>{//массив тарифов и цен
	  return ( <Text style={styles.textInButtonsSearchScreen}> {name}  {price}</Text>  );
	}

	async function clickLock(numPlace){/*зарезервировать место*/ 

		setDisabledButton(false);
	    if(isOwn==true){ 
		  var customData = require('./terminal.json');
		  var idTerminal=customData.idTerminal; 
	      var idR=JSON.stringify(idReis).replace(/["']/g,''); 
	      var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Seat/Lock?id='+idR+'&num='+numPlace+'&idTerminal='+idTerminal;
		  var username = 'p000892'; 
          var password = '123456';
          var basicAuth = 'Basic ' + btoa(username + ':' + password); 
		  
		  fetch(session_url, {
                 method: "PUT",
                 headers: { "Accept": "application/json",
	                 "Authorization": basicAuth,
                      "Content-Type": "application/json"},
                 }).then(async response => { 
                 if (response.ok) {
                                    const data = await response.json();
				                    setLoading(false);			
							        /*если место получилось зарезервировать то обновить массив с местами вызвав getPlaces чтобы они перерисовались*/
 	                                if(data==true){ 
			                                        setSelectSits([...selectSits,numPlace]);
													var customData = require('./terminal.json');
			                                        var session_url_places='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Seats?id='+JSON.stringify(idReis)+'&idPointStart='+idPointStart+'&idPointEnd='+idPointEnd+'&idTerminal='+idTerminal; 
                                                    setLoading(true);
			                                        getPlaces(session_url_places);
		                            }
		                            else { setMsgError('Не удалось зарезервировать место!'); setVisibleDialog(true); return; }
                                  } else {   throw await response.json();    }
                 }).catch(errors => {  
                    console.log('er='); 
					setMsgError(erroros.message);
		            setVisibleDialog(true);
					setLoading(false);
                 });
		}
		else {
			   setSelectSits([...selectSits,numPlace]);
			   seats.map((item) => {if(item.code==numPlace) item.status='-1'});
			  
		}
    }
	
	async function clickUnlock(numPlace){/*снять бронь с места место*/
        	
	    if(isOwn==true){
		  var customData = require('./terminal.json');
	      var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Seat/Unlock?id='+JSON.stringify(idReis)+'&num='+numPlace+'&idTerminal='+customData.idTerminal;
		  var username = 'p000892'; 
          var password = '123456';
          var basicAuth = 'Basic ' + btoa(username + ':' + password); 
		  
		  
		  fetch(session_url, {
                 method: "PUT",
                 headers: { "Accept": "application/json",
	                 "Authorization": basicAuth,
                      "Content-Type": "application/json"},
                 }).then(async response => { 
                 if (response.ok) {
                                    const data = await response.json();
				                    //setLoading(false);			
							        /*если место получилось зарезервировать то обновить массив с местами вызвав getPlaces чтобы они перерисовались*/
 	                                if(data==true){ 
			                                        var kol=selectSits.indexOf(numPlace);
			                                        setSelectSits([...selectSits.slice(0, kol), ...selectSits.slice(kol + 1)]);
													var customData = require('./terminal.json');
			                                        var session_url_places='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Seats?id='+JSON.stringify(idReis)+'&idPointStart='+idPointStart+'&idPointEnd='+idPointEnd+'&idTerminal='+customData.idTerminal; 
                                                    //setLoading(true);
			                                        getPlaces(session_url_places);
		                                          }
		                            else { setMsgError('Не удалось снять бронь с места!'); setVisibleDialog(true); return; }
                                  } else {   throw await response.json();    }
                 }).catch(errors => {  
                    console.log('erTripSeats=');
                    setMsgError(errors.message);
		            setVisibleDialog(true);
					setLoading(false);
                 });
		}
		else {
		  var kol=selectSits.indexOf(numPlace);
		  setSelectSits([...selectSits.slice(0,kol), ...selectSits.slice(kol + 1)]); 
		  seats.map((item) => {if(item.code==numPlace) item.status=''});
		  
		}
    }
	
	const seatsInBus=(num,status)=>{/*кнопки-места в автобусе*/  
	  switch (status){ 
	  case '' : return <TouchableOpacity  onPress={() => { setVisibleCountDial(false);
	                                                       setCountTouch(countTouch=>countTouch+1);
		                                                   clickLock(num); 
														   let countPas=countPassengers;
														   countPas=countPas + 1;
														   setCountPassengers(countPas);
														  }} style={[styles.butFree,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>{num}</Text></TouchableOpacity>/*свободно*/
      case '0' : return <TouchableOpacity style={[styles.butBron,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>{num}</Text></TouchableOpacity>/*забронировано*/
	  case '1' : return <TouchableOpacity style={[styles.butSold,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>{num}</Text></TouchableOpacity>/*продано*/
	  case '-1' : return <TouchableOpacity onPress={()=>{ setVisibleCountDial(false);
	                                                      setCountTouch(countTouch=>countTouch+1);
		                                                  clickUnlock(num); 
														  let countPas=countPassengers;
														  countPas=countPas - 1;
														  setCountPassengers(countPas);

														}} style={[styles.butBlockThisUser,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>{num}</Text></TouchableOpacity>/*заблокировано текущим пользователем*/
	  case '-2' : return <TouchableOpacity style={[styles.butBlockAnotherUser,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>{num}</Text></TouchableOpacity>/*заблокировано другим пользователем*/
	  default: return <TouchableOpacity style={[styles.undefinedSeat,styles.buttonBus]}><Text style={styles.textSelectSeatsScreen}>" "</Text></TouchableOpacity>
	  }
    }
	

  const titlePlacesInBus = () => {
	  /*if(isOwn==true) return <Text style={[styles.heading ,styles.ww]}>Выберите места в автобусе</Text>
	  else return <Text style={styles.heading}>Свободные места в автобусе</Text>*/
	  return <Heading style={[styles.heading, styles.headingMain ]}>Выберите места в автобусе</Heading>
  }

  /*получить массив мест в автобусе (всех мест) для данного рейса*/
  async function getPlaces(session_url){ 
                      //setLoading(true);
					  var username = 'p000892'; 
                      var password = '123456';
                      var basicAuth = 'Basic ' + btoa(username + ':' + password); 
					  
					  
					  fetch(session_url, {
                      method: "GET",
                      headers: { "Accept": "application/json",
	                      "Authorization": basicAuth,
                           "Content-Type": "application/json"},
                      }).then(async response => { 
                      if (response.ok) {
                                         const data = await response.json();
				                         setSeats(data);
										 setLoading(false);
					                     /*каждый раз когда стр будет загружаться стр массив selectedSits будет заново формироваться
					                     исходя из забронированных этим пользхователем мест*/
					                     let k=0;
					                     const inputData = [];
					                     data.map((item,index)=>{ 
						                 switch (item.status){ 
	                                             case '-1' : { 
	                                                          inputData[k] = item.num;
											                  k++;
											  //setSelectSits([...selectSits,item.num]);
											                  }
	                                            }  
					                     });
                                         setSelectSits(inputData);
										 if (inputData.length==0)setDisabledButton(true);
                                         else setDisabledButton(false);	 
                                       } else {   throw await response.json();    }
                      }).catch(errors => {  
                         console.log('erGetPl=');
						 setMsgError(errors.message);
		                 setVisibleDialog(true);
						 setLoading(false);
                      });			  
  }
  	
    /*будем получать данные о рейсе выбранном и свободные места сразу после загрузки экрана*/
	useEffect(()=>{
		const unsubscribe = navigation.addListener('focus', () => { 
		            readItemFromStorage();
					const tim=setInterval( сallbackTouch,45000);
	                timerRef.current = tim;
		            async function getTrip(){//получим данные по выбранному рейсу 
					  if(selectSits.length==0) setDisabledButton(true);
	                  else setDisabledButton(false);
					  var username = 'p000892';
                      var password = '123456';
                      var basicAuth = 'Basic ' + btoa(username + ':' + password);
                      var result;
					  
					  if(isOwn==true) {
						                var session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Trip?id='+JSON.stringify(idReis);									
                                        result = await axios.get(session_url, { 
                                                                                      headers: {
                                                                                             "Accept": "application/json",
	                                                                                  "Authorization": basicAuth,
                                                                                       "Content-Type": "application/json"}
					  					                                            });
                                        var customData = require('./terminal.json');																					
										var session_url_places='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Seats?id='+JSON.stringify(idReis)+'&idPointStart='+result.data.idPointStart+'&idPointEnd='+result.data.idPointEnd+'&idTerminal='+customData.idTerminal; 
										getPlaces(session_url_places);/*получим места в автобусе сразу*/
										setIdPointEnd(result.data.idPointEnd);
					                    setIdPointStart(result.data.idPointStart);
										
										setSelectSits([]); setDisabledButton(false);
					  }
					  else { var idR=JSON.stringify(idReis).replace(/["']/g,'');
							 var session_url_places='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Another/Seats?id='+idR+'&provider='+provider+'&date='+date;
							 getPlaces(session_url_places);
							 setSelectSits([]); setDisabledButton(false);
				      }
                      
					/*  setInterval(() => {getPlaces(result.data.idPointStart,result.data.idPointEnd);}, 12000);*//*каждые 12 сек будем обновлять места*/
					}
					//setLoading(true);
					getTrip();	
					//setLoading(false);
        });
		return unsubscribe;
	        },[]); 
    tarif_price.push(tariffs.map((val,index) => ( tarifAndPrice(val.name,val.price) )));
	
	if(isOwn==true)	masAllSeatsInBus.push(seats.map((item,index) => (seatsInBus(item.num,item.status))));
	else masAllSeatsInBus.push(seats.map((item,index) => (seatsInBus(item.code,item.status))));

    return ( 
	  <NativeBaseProvider>
        <Box style={styles.container}>
          <ImageBackground source={require('../assets/scrbg.png')} style={styles.image_}>	
          <TouchableOpacity style={styles.image_} onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1); }}>		  
	        <Center flex={2}>
			  <VStack width={'90%'} space={0}>
			    <Center>
				  <Button style={styles.infoButton}
				          onPress={()=>{
							setVisibleDialogQuestion(true);
						  }}
				  ><FontAwesomeIcon size={40} icon={faQuestionCircle} /></Button>
				</Center>
			    <Center >
			      <Box>
				  
				  
				    <DialogShow msg={msgError} visDialog={visibleDialog}/>
				 <DialogQuestionShow visQuestionDialog={visibleDialogQuestion}/> 
				 <CountShow visDialogCount={visibleCountDial} dCount={countDial}/> 
				 
				 
				    {titlePlacesInBus()}
                  </Box>
                  <ScrollView style={[styles.scrollBus ]}> 
				    <Box style={[styles.bus]}>
					
					
				
					 <LoadIndic/>
					
					
					 
				     {masAllSeatsInBus}
					</Box>
                  </ScrollView>				  
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsSeatScreen]}>
				    <Button isDisabled={disabledButton} 
					        style={[styles.buttonsHeight , styles.selectSeatsScreenButtons, styles.mainButtons]}
				            onPress={()=>{ 
							              
						                 if(selectSits.length==0){
							                setMsgError('Введите места!');
							                setVisibleDialog(true);   
							                return;
						                 } 
						                 else 
						                 { 
                                          removeItemFromStorage();
                                          writeItemToStorage(selectSits);
                                          
										  clearInterval(timerRef2.current);
                                          timerRef2.current = 0;
										  clearInterval(timerRef.current);
                                          timerRef.current = 0;
                                          stateRef.current = 0;
                                          										  
						                  
										  navigation.navigate('InfoEmailPhoneScreen',{/*selectSits: selectSits,*/
						                                                              searchTrip: searchTrip,
														            	  		        countPas: countPas,
                                  						                                  idReis: idReis,
       															                           isOwn: isOwn,
																	                    provider: provider,
						                                                                    date: date})
						                 }
						               }}
										  >
					  <Text style={styles.textButtonFirstScreen}>Далее</Text>																
				    </Button>
				  </Box>
				</Center>
				
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsSeatScreen]}>
				    <Button style={[styles.buttonsHeight , styles.selectSeatsScreenButtons, styles.mainButtons]}
				          onPress={()=>{ 
						      clearInterval(timerRef2.current);
                              timerRef2.current = 0;
						      clearInterval(timerRef.current);
                              timerRef.current = 0;
							  stateRef.current = 0;
							  
							  
							  navigation.navigate('ReisScreen',{searchTrip: searchTrip})}}>
				      <Text style={styles.textButtonFirstScreen}>К списку рейсов</Text>
				    </Button>
				  </Box>
				</Center>
				
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsSeatScreen]}>
				    <Button style={[styles.buttonsHeight , styles.selectSeatsScreenButtons, styles.mainButtons]}
				          onPress={()=>{ 
							  removeItemFromStorage();
							  removeValue();
							  clearInterval(timerRef2.current);
                              timerRef2.current = 0;
							  clearInterval(timerRef.current);
                              timerRef.current = 0;
							  stateRef.current = 0;
							  
							  
							  navigation.navigate('FirstScreen')}}>
				      <Text style={styles.textButtonFirstScreen}>Выход</Text>
				    </Button> 
				  </Box>
				</Center>
				
			  </VStack>
            </Center>
			</TouchableOpacity>
	      </ImageBackground>
        </Box>
	   </NativeBaseProvider>);
}


