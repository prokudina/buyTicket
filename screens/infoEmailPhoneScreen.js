import React , { useState, useEffect , useRef} from 'react';
import { Text, Container , Button , Box, VStack, Heading ,Image , Select , CloseIcon, Center , Stack , HStack , Input , ScrollView , NativeBaseProvider } from 'native-base';
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
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DoubleCircleLoader } from 'react-native-indicator';

export const InfoEmailPhoneScreen = function({route , navigation}) {
	const { idReis } = route.params;/*идентификатор рейса полученый из предыдущего экрана*/
	const {isOwn} = route.params;/*признак того-является ли выбранный рейс своим или чужим*/
	const {provider} = route.params;/*если рейс не наш то это провайдер*/
	const {date} = route.params;/*если рейс не наш то это дата то это начало отправления*/
	//const { selectSits } = route.params;/*массив выбранных мест*/
	const { searchTrip } = route.params;/*массив выбранных рейсов*/
	const { countPas } = route.params;/*количество пассажиров которые поедут*/

	//const { datSelectSeats } = route.params;
	const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
    const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
	const [infoReis , setInfoReis]=React.useState([]);/*массив информации о выбраном рейсе*/
	const [timeStart , setTimeStart]=React.useState('');/*время отправления*/
	const [timeEnd , setTimeEnd]=React.useState('');/*время прибытия*/
	const [dateStart , setDateStart] = React.useState('');/*дата отправления*/
	const [carrier , setCarrier]=React.useState({});/*объект перевозчик*/
	const [idPointEnd , setIdPointEnd] = React.useState('');/*идентиф точки конечной остановки*/
	const [bus , setBus]=React.useState({});/*объект автобус*/
	const [tariffs , setTariffs]=React.useState([]);/*массив тарифов*/
	const [ returnPay , setReturnPay ]=React.useState(0);/*признак того что мы вернулись со страницы сводной таблицы сюда*/

	const [phone, setPhone] = React.useState('');/*значения вводимые в поле номера тел*/
	const [maskPhone , setMaskPhone] = React.useState([/[793]/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]);/*маска для тел*/
	
	const [flagEmail , setFlagEmail] = React.useState(false);/*определяет правильность ввода пользователем email*/
	const [flagPhone , setFlagPhone] = React.useState(false);/*определяет правильность ввода пользователем тел*/
	const [maskTel , setMaskTel] = React.useState('999999999999');/*маска для ввода тел*/
	const [email , setEmail] = React.useState('');/*значения вводимые в поле email*/
	
	const [loading, setLoading] = React.useState(false);/*состояние индикатора загрузки*/
	const [ disabledButton , setDisabledButton ] = React.useState(false);/*если true то будет доступна кнопка Далее*/

	const { getItem, setItem } = useAsyncStorage('@storage_key');
	const [timer , setTimer] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
    const [ timer2 , setTimer2 ] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/   
	
    const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/  
    const timerRef = React.useRef();
    const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/
	const [visibleCountDial , setVisibleCountDial] = React.useState(false);
	const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
	const [countDial , setCountDial] = React.useState(10);/*обратный отсчет секунд*/
		
	stateRef.current = countTouch;
	let tarif_price=[];
	let mas11=['370','373','371','374','993','372'];
	let mas12=['380','375','998','995','994','996','992'];
	

    const DialogShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialog}>
            <Dialog.Description style={styles.textSmallInfo}>
			 {props.msg}
            </Dialog.Description>
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button  style={styles.dialogStyle} label="OK" onPress={()=>{setCountTouch(countTouch=>countTouch+1);setVisibleDialog(false); setLoading(false);}} />
            </Box>
			</Center>
		   </Dialog.Container>
		)
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
		  }
		}
        else {
			    //setCountTouch(0);
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
		else return <Box style={[styles.loadIndicator , styles.countPositionEmail]}>
                      <Text style={styles.textCountStyle}>До возвращения на экран поиска осталось {props.dCount} сек</Text>
			          <Text style={styles.textCountStyle}>Коснитесь экрана, чтобы остаться </Text>
                    </Box>	
	}
	
	/*индикатор загрузки*/
	const LoadIndic=()=>{ 
		if(loading==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.loadIndicPosition]}>
                       <DoubleCircleLoader size={120} color={'#696969'}/>
                    </Box>
	}
  
	if (!global.btoa) { global.btoa = encode; }

    if (!global.atob) { global.atob = decode; }
		
	const tarifAndPrice = (name,price) =>{//массив тарифов и цен
	  return ( <Text style={[styles.reisStyle , styles.infoReis]}> {name}  {price}</Text>  );
	}
	
	/*запись в хранилище тел и емаил*/
	const writeItemToStorage = async newValue => {  
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key',jsonValue); 
    };
	
	/*чтение из хранилища тел и емаил*/
	const readItemFromStorage = async () => { 
	
      const item = await AsyncStorage.getItem('@storage_key'); 
	  if((item!==null)&&(item!==undefined)) {
	    var a=JSON.parse(item);
		setMaskPhone([/[7]/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/]);
        setPhone(a.phone); 
	    setEmail(a.email);
		setFlagEmail(true);
		setFlagPhone(true);
		if(a.phone[0]=='7')setMaskPhone([/[7]/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/]);
		var str=a.phone.slice(0,3);
		if(mas11.includes(str))setMaskPhone([/[39]/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/]);
		if(mas12.includes(str))setMaskPhone([/[93]/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/]);
	  }
	  setDisabledButton(false);
    };
	
	 /*чтение из хранилища ключа возвращения на эту стр*/
    const readItemFromStorageReturn = async () => { 
	  const item = await AsyncStorage.getItem('@storage_key_return');
      
	  if((item!==null)&&(item!==undefined)) {
		setReturnPay(1); 
		var a=JSON.parse(item);		
	  }	  
    }
	
	/*стирание данных из хранилища*/
	const removeValue = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key');
			} 
	    catch(e) {setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    } 

    const removeValueAnother = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_passengers');
			  await AsyncStorage.removeItem('@storage_key_return');
			  await AsyncStorage.removeItem('@storage_key_sits');
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

    
    /*будем получать данные о рейсе выбранном и свободные места сразу после загрузки экрана*/
	useEffect(()=>{ 
	              const unsubscribe = navigation.addListener('focus', () => {
	                //removeValueReturn();
	                //removeValue();
					/*const tim=setInterval( сallbackTouch,45000);
	                timerRef.current = tim;*/
					
		            async function getTrip(){//получим данные по выбранному рейсу 
					  var username = 'p000892';
                      var password = '123456';
                      var basicAuth = 'Basic ' + btoa(username + ':' + password);
                      var result;
					  setLoading(true);
                      setDisabledButton(true);
					  
					  
					  if(isOwn==true) {
					                    var session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Trip?id='+JSON.stringify(idReis);									
										result = await axios.get(session_url, { 
                                                                                      headers: {
                                                                                             "Accept": "application/json",
	                                                                                  "Authorization": basicAuth,
                                                                                       "Content-Type": "application/json"}
					  					                                            });
                                        if(result.lenght==0){ setMsgError('Ошибка при загрузке данных о рейсе');
										                      setVisibleDialog(true);	}			
					  }
					  else { var idR=JSON.stringify(idReis).replace(/["']/g,''); console.log(provider);
						     var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Another?id='+idR+'&provider='+provider+'&date='+date;
							 
							 /*var result=getResult(session_url);*/
							 result = await axios.get(session_url, { 
                                                                            headers: {
                                                                                    "Accept": "application/json",
	                                                                         "Authorization": basicAuth,
                                                                              "Content-Type": "application/json"}
					  					                                  });
							if(result.lenght==0){ setMsgError('Ошибка при загрузке данных о рейсе');
										                      setVisibleDialog(true);	}											  
				      } 
					  setInfoReis(result.data);  
                      setCarrier(result.data.carrier);
	                  setBus(result.data.bus);
					  
	                  setTariffs(result.data.tariffs.seating);
			  
	                  let t1=result.data.timeStart.split(' ');
	                  setTimeStart(t1[1]);
					  setDateStart(t1[0]);
					  
	                  let t2=result.data.timeEnd.split(' ');
	                  setTimeEnd(t2[1]);
                      setLoading(false);
					  readItemFromStorageReturn();
		              readItemFromStorage();
					  //setDisabledButton(false);
					/*  setInterval(() => {getPlaces(result.data.idPointStart,result.data.idPointEnd);}, 12000);*//*каждые 12 сек будем обновлять места*/
					}
					getTrip();	
					
				 });
		         return unsubscribe;
	        },[]); 
    tarif_price.push(tariffs.map((val,index) => ( tarifAndPrice(val.name,val.price) )));
	console.log(tariffs);
	
	const ReturnToPay = ()=>{
		if (returnPay==1) return <Center>
		                          <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
		                           <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
								   onPress={()=>{ 
								     clearInterval(timerRef2.current);
									 timerRef2.current = 0;
								     clearInterval(timerRef.current);
                                     timerRef.current = 0;
				                     stateRef.current = 0;
									 
									 navigation.navigate('PassengersInfoScreen',{
										
									 })  
								   }}
								   >
								     <Text style={styles.textButtonFirstScreen}>Вернуться к оплате</Text>
								   </Button>
								 </Box>
		                       </Center>
        else return <></>							   
	}
	
	const Transport = ()=>{
		if((typeof bus === "string") || (bus instanceof String)) 
			return <Box style={styles.infoReisBold}>
		    <Text style={[styles.infoReis,styles.textInfoReis]}>Транспорт: </Text>
		    <Text style={styles.textInfoReis}>{bus}</Text>
		  </Box>  
		else return <>
		  <Box style={styles.infoReisBold}>
		    <Text style={[styles.infoReis,styles.textInfoReis]}>Транспорт: </Text>
		    <Text style={styles.textInfoReis}>{bus.vendor} {bus.model}</Text>
		  </Box> 
		  <Box style={styles.infoReisBold}>
		    <Text style={[styles.infoReis,styles.textInfoReis]}>Вместимость: </Text>
		    <Text style={styles.textInfoReis}>{bus.size} мест</Text>
		  </Box> 
		</> 
	}
	
    return ( 
	  <NativeBaseProvider>
        <Box style={styles.container}>
          <ImageBackground source={require('../assets/scrbg.png')} style={styles.image_}>
		    <TouchableOpacity style={styles.image_} onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1)}}>
		    <Center flex={1}>
			  <VStack width={'90%'} space={1}>
			    <Center>
				  <Stack space={1}>
					<HStack width={'100%'} space={1}  style={{justifyContent: 'center'}}>
					  <Box style={[styles.infoTrip ]}>
					   
				          <Heading style={[styles.headingInfo]}>Информация о рейсе</Heading>
						
				      </Box>
					  <Box style={styles.tarifsAndPrices}>
					    <Heading style={[styles.headingTarif]}>Тарифы и цены:</Heading>
					  </Box>
				    </HStack>
				  </Stack>
				</Center>
				<Center>
				  <Stack>
				  
			
			<DialogShow msg={msgError} visDialog={visibleDialog}/>
			
				  
				    <HStack style={[styles.blockInfoTarifs ]}>
					
					  <Box style={styles.infoTrip}>
					    <Box style={styles.infoReisBold}>
					        <Text style={[styles.infoReis,styles.textInfoReis]}>Посадка: </Text>
			                <Text style={styles.textSmallInfo}> {timeStart} {infoReis.cityStart} {infoReis.pointStart}</Text>
						</Box>
						<Box style={styles.infoReisBold}>
					        <Text style={[styles.infoReis,styles.textInfoReis]}>Высадка: </Text>
			                <Text style={styles.textSmallInfo}> {timeEnd} {infoReis.cityEnd} {infoReis.pointEnd}</Text>
						</Box>
						<Box style={styles.infoReisBold}>
					        <Text style={[styles.infoReis,styles.textInfoReis]}>Перевозчик: </Text>
			                <Text style={styles.textSmallInfo}> {carrier.name}</Text>
						</Box>
						<Transport />
					  </Box>
                      <Box style={styles.tarifsAndPrices}>
					    {tarif_price}
                      </Box>					  
				    </HStack>
				  </Stack>
				</Center>
			<LoadIndic/>
				<Center>
				 <Stack>
				   <HStack style={{justifyContent: 'center'}}>
				     <Heading style={[styles.textContacts]}>Ваши контакты</Heading>
				   </HStack>
				 </Stack>
				</Center>
				<Box>
				  <Text style={styles.infoTarifsAndPrices}>E-mail</Text>
				  <Center>
				     <Stack space={4}>
					   <HStack>
				         <Input width={'92%'} 
				           placeholder='email@site.ru' 
						   placeholderTextColor="#FFFFFF" 
						 
						 //plaseholdetTextSize='25'
				           style={[flagEmail ? styles.blueSt : styles.redSt , styles.textInfoReis , styles.borderMainButtons]}
                           onChangeText={(val) => {
							 setVisibleCountDial(false);
                             setCountTouch(countTouch=>countTouch+1);							   
                             if(val.match(/^(([^<>()\[\]\.,;:\s@"]+(\.[^<>()\[\]\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)!=null)    
						      setFlagEmail(true);
                             else setFlagEmail(false);
					         setEmail(val);
                            }
				           }
				           value={email}
                         /> 
						 <Button width={'8%'}
				                style={[flagEmail ? styles.blueSt : styles.redSt , styles.heightClearButtonMailPhone , styles.clearButtonsPas , styles.borderClearButton]}
								onPress={() => { 
								                setVisibleCountDial(false);
								                setCountTouch(countTouch=>countTouch+1);
												setFlagEmail(false);
												setEmail('');
									            //setInputF([...inputF.slice(0, (countPasNow-1)), '', ...inputF.slice(countPasNow)]);
												//setFlagF([...flagF.slice(0, (countPasNow-1)),false,...flagF.slice(countPasNow)]);
											   }}
						 >
				           <CloseIcon size={7}  />
				         </Button>
				       </HStack>
				     </Stack>
				  </Center>
				</Box>
				<Box style={styles.marginBot}>
				  <Text style={styles.infoTarifsAndPrices}>Телефон</Text>
				  <Center>
				     <Stack space={4}>
					   <HStack>
				         <MaskInput width={'92%'} 
				             placeholderTextColor="#FFFFFF" 
				             style={[flagPhone ? styles.blueSt : styles.redSt , styles.phoneNumber , styles.textInfoReis , styles.borderMainButtons]}
                             value={phone}
							 placeholder='7-888-888-88-88' 
                             onChangeText={(val) => {
							   setVisibleCountDial(false);
							   setCountTouch(countTouch=>countTouch+1);
                               setPhone(val); 
		                       if(val=='7')setMaskPhone([/[7]/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/]);
		                       if(mas11.includes(val))setMaskPhone([/[39]/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,'-',/\d/,/\d/]);
		                       if(mas12.includes(val))setMaskPhone([/[93]/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/,'-',/\d/,/\d/,/\d/]);
		                       if(val.length==2)setMaskPhone([/[793]/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]);
							   
							   if(val[0]=='7'&&val.length==15)setFlagPhone(true);
							   else
							   if(mas11.includes(val.substring(0,3))&&val.length==17)setFlagPhone(true);
						       else
							   if(mas12.includes(val.substring(0,3))&&val.length==15)setFlagPhone(true);
						       else setFlagPhone(false);
                             }}
                             mask={maskPhone}
                         /> 
						 <Button width={'8%'}
				                style={[flagPhone ? styles.blueSt : styles.redSt , styles.heightClearButtonMailPhone , styles.clearButtonsPas , styles.borderClearButton]}
								onPress={() => { 
								                setVisibleCountDial(false);
								                setCountTouch(countTouch=>countTouch+1);
												setFlagPhone(false);
												setPhone('');
									            //setInputF([...inputF.slice(0, (countPasNow-1)), '', ...inputF.slice(countPasNow)]);
												//setFlagF([...flagF.slice(0, (countPasNow-1)),false,...flagF.slice(countPasNow)]);
											   }}
						 >
				           <CloseIcon size={7}  />
				         </Button>
				       </HStack>
				     </Stack>
				  </Center>
				</Box>
				
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button isDisabled = {disabledButton} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}>
				      <Text style={styles.textButtonFirstScreen}
					      onPress={() => { setVisibleCountDial(false);
						                   setCountTouch(countTouch=>countTouch+1);
										   let dat={};
						                   if((flagPhone==true)&&(flagEmail==true)){
				                             if(isOwn==true){
				                                dat={
		                                            'idTrip':JSON.stringify(idReis),
		                                          'provider':'',
		                                              'date': dateStart,
		                                           'idStart':infoReis.idPointStart,
		                                             'idEnd':infoReis.idPointEnd,
		                                             'phone': phone,
		                                             'email': email,
		                                             'paxes':[]
	                                            };
				                             }
									         else {
										         dat={
										          'idTrip':JSON.stringify(idReis),
		                                        'provider':provider,
		                                            'date': dateStart,
		                                           'phone': phone,
		                                           'email': email,
		                                           'paxes':[]
									             };
									         }
											 let obj={'email':email,
										              'phone':phone,
													  'tarifs': tariffs};
                                             removeValue();												 
										     writeItemToStorage(obj);
											 
											 clearInterval(timerRef2.current);
											 timerRef2.current = 0;
											 clearInterval(timerRef.current);
                                             timerRef.current = 0;
				                             stateRef.current = 0;
					                         
											 navigation.navigate('PassengersScreen', { 
											                                     /*selectSits: selectSits,*/
                       														     countPas: countPas,
																				 /*tarifs: tariffs,*/
																				 isOwn: isOwn,
																				 idReis: idReis,
																				 dateStart: dateStart,
																				 dateParams:dat,
																				 flagPhone: flagPhone,
																				 flagEmail: flagEmail,
																				 email: email,
																				 phone: phone,
																				/* flagReturn: true*/
   																								         });
                                          }
										  else { setMsgError('Введите номер телефона и адрес электронной почты'); setVisibleDialog(true);}
																										 }}
						>Далее</Text>
				    </Button>
				  </Box>
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
				          onPress={()=>{setVisibleCountDial(false); 
						                setCountTouch(countTouch=>countTouch+1);
							            let obj={'email':email,
										         'phone':phone,
												 'tarifs':tariffs};
                                        removeValue();												 
										writeItemToStorage(obj);
										/*стирание данных о пассажире из хранилища*/
										
										clearInterval(timerRef2.current);
										timerRef2.current=0;
										clearInterval(timerRef.current);
                                        timerRef.current = 0;
				                        stateRef.current = 0;
	                                    
							            navigation.navigate('ReisScreen',{searchTrip:searchTrip})
									   }}
						  >
				      <Text style={styles.textButtonFirstScreen}>К списку рейсов</Text>
				    </Button>
				  </Box>
				</Center>
				<ReturnToPay />
				
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
				          onPress={() => {setVisibleCountDial(false);
							              setCountTouch(countTouch=>countTouch+1);
										  removeValue();
										  removeValueAnother();
										  removeValueReturn();
										  
										  clearInterval(timerRef2.current);
										  timerRef2.current=0;
										  clearInterval(timerRef.current);
                                          timerRef.current = 0;
				                          stateRef.current = 0;
							              navigation.navigate('FirstScreen');
										 }}>
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

};