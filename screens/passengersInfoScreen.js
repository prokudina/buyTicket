import React , { useState, useEffect , useRef } from 'react';
import { Text, Container , Button , Box, Image , Select ,Heading , Center , VStack, Stack , HStack , Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground,TouchableOpacity } from 'react-native';
import styles from '../styleGobusPanel.js';
import axios from 'axios';
import {decode, encode} from 'base-64';
import Dialog from 'react-native-dialog';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { DoubleCircleLoader } from 'react-native-indicator';
import { WebView } from 'react-native-webview';

export const PassengersInfoScreen = function({route , navigation} ) {
  
  //const { idOrder } = route.params;/*номер заказа*/
  //const { formUrl } = route.params;/*ссылка сбербанка*/
  //const { email } = route.params;/*email пользователя*/
  //const { isOwn } = route.params;/*свой рейс или чужой*/
  const [ orderInfoTickets , setOrderInfoTickets ] = React.useState([]);/*информация о заказе*/
  const [ carrier , setCarrier ] = React.useState([]);/*перевозчик*/
  const [ bus , setBus ] = React.useState([]);/*автобус*/
  const [ timeStart , setTimeStart ] = React.useState([]);/*время отправления*/ 
  const [ timeEnd , setTimeEnd ] = React.useState([]);/*время отбытия*/ 
  const [dateStart , setDateStart] = React.useState('');/*дата отправления*/
  const [dateEnd , setDateEnd] = React.useState('');/*дата прибытия*/
  const [cityStart , setCityStart] = React.useState([]);/*город отправления*/
  const [pointStart , setPointStart] = React.useState([]);/*место отправления*/
  const [cityEnd , setCityEnd] = React.useState([]);/*город прибытия*/
  const [pointEnd , setPointEnd] = React.useState([]);/*место прибытия*/
  const [id , setId] = React.useState([]);/*id рейса*/
  const [baggagePrice , setBaggagePrice] = React.useState('');/*цена одного места багажа*/
  const [idOrderFromServer , setIdOrderFromServer] = React.useState('');/*id заказа с сервера*/
  const [urlFromServer , setUrlFromServer] = React.useState('');
  const [emailFromServer , setEmailFromServer] = React.useState('');
  const [isOwnFromServer , setIsOwnFromServer] = React.useState('');
  const { getItem, setItem } = useAsyncStorage('@storage_key_return');
  const [loading, setLoading] = React.useState(true);/*состояние индикатора загрузки*/
  const [ disabledButton , setDisabledButton ] = React.useState(true);/*если true то будет доступна кнопка Далее*/
  
  const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
  const [visibleCountDial , setVisibleCountDial] = React.useState(false);
  const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
  const [visibleCrossingDialog, setVisibleCrossingDialog] = useState(false);//показать/скрыть диалоговое окно
  const [visibleDialogPay, setVisibleDialogPay] = useState(false);//показать/скрыть диалоговое окно
  const [ visibleDialogCancel , setVisibleDialogCancel ] = React.useState(false);//показать/скрыть диалоговое окно отменить заказ
  const [timer , setTimer] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
  const [ timer2 , setTimer2 ] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
  
  const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/  
  const timerRef = React.useRef();
  const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
  const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/
  const [ countDial , setCountDial ] = React.useState(10);/*обратный отсчет секунд*/
  
  stateRef.current = countTouch;
  /*индикатор загрузки*/
  const LoadIndic=()=>{ 
    if(loading==false) return <Box></Box>
	else return <Box style={styles.loadIndicator}>
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
		  }
		}
        else {
			    //setCountTouch(0);
			    clearInterval(timerRef2.current);
                timerRef2.current = 0;
			    stateRef.current=0;
				clearInterval(timerRef.current);
                timerRef.current = 0;
				navigation.navigate('FirstScreen',{});
		}
		
		if(visibleCountDial==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.countPosition]}>
                      <Text style={styles.textCountStyle}>До возвращения на экран поиска осталось {props.dCount} сек</Text>
			          <Text style={styles.textCountStyle}>Коснитесь экрана, чтобы остаться </Text>
                    </Box>	
	}

  /*диалог если нажали на Отменить заказ*/
  const DialogCancel=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialogCancel}>
            <Dialog.Description style={styles.textSmallInfo}>
			 Вы действительно хотите отменить заказ?
            </Dialog.Description>
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button  style={styles.dialogStyle} label="Да" onPress={()=>{   
			    let strIdTickets=''; 
					orderInfoTickets.map((item,index)=>{
						strIdTickets=strIdTickets+item.id+','
					});
					strIdTickets=strIdTickets.substring(0, strIdTickets.length - 1);
					console.log('idtickets=');console.log(strIdTickets);
					removeValueAnother();
                    removeValueReturn();
					cancelTickets(idOrderFromServer,strIdTickets);  
					
					clearInterval(timerRef2.current);
				    timerRef2.current=0;
                    clearInterval(timerRef.current);
                    timerRef.current = 0;
				    stateRef.current = 0; 
                    removeValueAnother();
                    removeValueReturn();
                    setVisibleDialogCancel(false);					
				    navigation.navigate('FirstScreen', {  });
			  
			  }} />
			  <Dialog.Button style={styles.dialogStyle} label="Нет" onPress={()=>{ setVisibleDialogCancel(false); }} />
            </Box>
			</Center>
		   </Dialog.Container>
		)
	}

  /*диалог*/
  const DialogShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visDialog}>
            <Dialog.Description style={styles.textSmallInfo}>
			 {props.msg}
            </Dialog.Description>
			<Box style={styles.dialogBox}>
			  <Dialog.Button  style={styles.dialogStyle} label="OK" onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1); setVisibleDialog(false); setLoading(false);}} />
            </Box>
		   </Dialog.Container>
		)
	}
  
  	/*диалог если переходим на форму поиска*/
  const DialogCrossingShow=(props)=>{
		return(
		   <Dialog.Container visible={props.visCrossingDialog}>
            <Dialog.Description style={styles.textSmallInfo}>
			 Введенные Вами данные удалятся. Перейти? 
            </Dialog.Description>
			<Box style={styles.dialogBox}>
			  <Dialog.Button style={styles.dialogStyle} label="Да" onPress={()=>{setVisibleCrossingDialog(false);
			                                        removeItemFromStorageAnother();
										            removeItemFromStorageReturn();
										            removeItemFromStorageSits();
													
													clearInterval(timerRef2.current);
										            timerRef2.current=0;
													clearInterval(timerRef.current);
                                                    timerRef.current = 0;
				                                    stateRef.current = 0;
 			                                        navigation.navigate('FirstScreen'); }} />
			  <Dialog.Button style={styles.dialogStyle} label="Нет" onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1); setVisibleCrossingDialog(false); }} />
            </Box>
		   </Dialog.Container>
		)
  }
  
  useEffect(()=>{
	       const unsubscribe = navigation.addListener('focus', () => {
			        /*считаем из хранилища idReisFromEmailPhoneScreen если он не undefined будем его использовать*/
			        //removeValueReturn();
					/*const tim=setInterval( сallbackTouch,45000);
	                timerRef.current = tim;*/
				
			        readItemFromStorageReturn();
					});
		         return unsubscribe;
	            },[]); 
  
  /*запись в хранилище флага возвращения*/
  const writeItemToStorageReturn = async newValue => { 
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key_return',jsonValue); 
	  //const item = await AsyncStorage.getItem('@storage_key_return');
	  //debugger;
  };
	 
    /*стирание данных из хранилища*/
  const removeValueReturn = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_return')
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
  }
  
  const removeValueAnother = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key');
			  await AsyncStorage.removeItem('@storage_key_sits');
			  await AsyncStorage.removeItem('@storage_key_passengers');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
  }
   
   /*чтение из хранилища ключа возвращения на эту стр*/
    const readItemFromStorageReturn = async () => { 
	  //const item = await AsyncStorage.getItem('@storage_key_return');console.log('itemPassInfoScreen='); console.log(item);
	  const item = await AsyncStorage.getItem('@storage_key_passengers');
	  var session_url='';
	  
	  if((item!==null)&&(item!==undefined)) {
		var a=JSON.parse(item); 
		 session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Order?idOrder='+JSON.stringify(a.idOrder);
	     async function getOrder(session_url){//получим данные по выбранному рейсу 
					  var username = 'p000892';
                      var password = '123456';
                      var basicAuth = 'Basic ' + btoa(username + ':' + password);
					  
					  fetch(session_url, {
                      method: "GET",
                      headers: {
                            "Authorization": basicAuth,
                             "Content-Type": "application/json"
                               },
                      }).then(async response => { 
                      if (response.ok) {
						                 const data = await response.json();
							             
						                 setOrderInfoTickets(data.tickets); 
                                         setCarrier(data.trip[0].carrier);
	                                     setBus(data.trip[0].bus );
					                     setCityStart(data.trip[0].cityStart);
					                     setPointStart(data.trip[0].pointStart);
					                     setCityEnd(data.trip[0].cityEnd);
					                     setPointEnd(data.trip[0].pointEnd);
					                     setId(data.trip[0].id);
					                     setBaggagePrice(data.trip[0].tariffs.baggage.price);
					                     setIdOrderFromServer(data.idOrder);
										 setUrlFromServer(data.formUrl);
										 setEmailFromServer(data.email);
										 setIsOwnFromServer(data.isOwn);

	                                     let t1=data.trip[0].timeStart.split(' ');
	                                     setTimeStart(t1[1]);
					                     setDateStart(t1[0]);
					  
	                                     let t2=data.trip[0].timeEnd.split(' ');
	                                     setTimeEnd(t2[1]);
					                     setDateEnd(t2[0]);  
										 setDisabledButton(false);
					                     setLoading(false);
                                          
					                   } else {   throw await response.json();    }
                                       }).catch(errors => {  
                                                            console.log('er='); 
															setMsgError(errors.message);
		                                                    setVisibleDialog(true);
															setLoading(false);
                                                          });														  
				    }
				    getOrder(session_url);	
	  }
      //else session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Order?idOrder='+JSON.stringify(idOrder);
     else {
		setMsgError('Ошибка чтения данных из хранилища');
		setVisibleDialog(true); 
	 }
     
					
    }
			
   const Rows=(props)=>{ 
      let baggage='';
	  let sumBag=0;
	 
      if(props.bag==0) { baggage='Нет'; sumBag='0P'; }
	  else { baggage=props.bag; sumBag=baggage*baggagePrice+'P'; }
	  
	  let gender='';
	  if(props.gender==0)gender='Ж';
	  else gender='М';
	  
	  let docType='';
	  switch(props.docType){
		  case 0: { docType="Вид на жительство иностранного гражданина";break;}
		  case 1: {docType="Военный билет военнослужащего срочной службы";break;}
		  case 2: {docType="Временное удостоверение личности";break;}
		  case 3: {docType="Документ, удостоверяющий личность";break;}
		  case 4: {docType='Общегражданский заграничный паспорт';break;}
		  case 5: {docType='Паспорт гражданина РФ';break;}
		  case 6: {docType='Паспорт гражданина СССР';break;}
		  case 7: {docType='Паспорт дипломатический';break;}
		  case 8: {docType='Паспорт иностранного гражданина';break;}
		  case 9: {docType='Паспорт служебный';break;}
		  case 10: {docType='Свидетельство';break;}
		  case 11: {docType='Свидетельство';break;}
		  case 12: {docType='Свидетельство о рождении';break;}
		  case 13: {docType='Справка об освобождении из мест лишения свободы';break;}
		  case 14: {docType='Справка об утере паспорта';break;}
		  case 15: {docType='Удостоверение личности военнослужащего';break;}
		  case 16: {docType='Удостоверение личности';break;}
		  case 17: {docType='Удостоверение личности';break;}
		  default: {docType='Паспорт';break;}
	  }
	  
	  //alert(isOwn);
  
	  return( <>
	  <Center style={{marginTop: 7}}>
	    <VStack space={1} width={'99%'} style={[styles.blockInfoTarifs]}>
		  <Center>
	        <Stack space={1} width={'100%'}>
		      <HStack space={1} >
		        <Center style={[( isOwnFromServer==true ) ? styles.qq1 : styles.qq2]}><Text style={styles.bodyTable}>{props.numberPlace}</Text></Center>
			    <Center style={styles.ww1}><Text style={styles.bodyTable}>{props.tarif}</Text></Center>
			    
				
				<BagRow1 baggage={baggage} sumBag={sumBag} />
			    
				
				<Center style={styles.rr1}><Text style={styles.bodyTable}>{props.ticketCost} р</Text></Center>
		        <Center style={styles.tt1}><Text style={styles.bodyTable}>{props.f} {props.i} {props.o}, {gender}, {props.dr}</Text></Center>
		      </HStack>
	        </Stack>
		  </Center>
		  <Center>
		    <HStack space={1}>
		      <Center style={[styles.qq1]}><Text style={styles.bodyTable}> </Text></Center>
			  <Center style={styles.ww1}><Text style={styles.bodyTable}> </Text></Center>
			  
			  <BagRow2 />
			  
			  
			  <Center style={styles.rr1}><Text style={styles.bodyTable}> </Text></Center>
		      <Center style={styles.tt1}><Text style={styles.bodyTable}>{docType} {props.docNum} {props.country}</Text></Center>
			  
		     </HStack>
		  </Center>
        </VStack>		
	  </Center>
	  </>)
   }
   
   async function cancelTickets(id_order,id_tickets){ 
	      var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Order/CancelTickets';
		  var username = 'p000892'; 
          var password = '123456';
          var basicAuth = 'Basic ' + btoa(username + ':' + password); 
		  var objData = {'idOrder': id_order,'idTickets': id_tickets};

		  fetch(session_url, {
                      method: "PUT",
                      headers: {
                            "Authorization": basicAuth,
                             "Content-Type": "application/json"
                               },
                      body:JSON.stringify(objData)							   
                      }).then(async response => { 
                      if (response.ok) {
						                 const data = await response.json();
							             setLoading(false);
						                 //alert(data.idOrder)
                                          
					                   } else {   throw await response.json();    }
                                       }).catch(errors => {  
                                                            console.log('er=');
															
															setMsgError(er.message);
		                                                    setVisibleDialog(true); 
															setLoading(false);
                                                          });	
    }
   
   const BagTitle = () =>{
		if(isOwnFromServer==true) return (
		   <Center style={styles.ee1}><Text style={[styles.headTable]}>Багаж</Text></Center>
		) 
        else return (<></>)		
	  }
	  
	const BagRow1 = (props) =>{ 
		if(isOwnFromServer==true) return (
		  <Center style={styles.ee1}><Text style={styles.bodyTable}>{props.baggage}/{props.sumBag}</Text></Center> 
		) 
        else return (<></>)		
	  }
	  
	const BagRow2 = () =>{
		if(isOwnFromServer==true) return (
		  <Center style={styles.ee1}><Text style={styles.bodyTable}> </Text></Center>
		)
		else return (<></>)
	  }
   
   const Transport = ()=>{
		if((typeof bus === "string") || (bus instanceof String)) return <>
		 <Box style={styles.infoReisBold}>
		   <Text style={[styles.infoReis,styles.textInfoReis]}>Транспорт: </Text>
		   <Text style={styles.textSmallInfo}>{bus}</Text>
		 </Box>
		</>
		else return <>
		  <Box style={styles.infoReisBold}>
			<Text style={[styles.infoReis,styles.textInfoReis]}>Транспорт: </Text>
			<Text style={styles.textSmallInfo}>{bus.vendor} {bus.model} </Text>
          </Box>	
		  <Box style={styles.infoReisBold}>
		    <Text style={[styles.infoReis,styles.textInfoReis]}>Вместимость: </Text>
			<Text style={styles.textSmallInfo}>{bus.size} мест</Text>
		  </Box>
		</> 
	}
	
	const Inforeis = (props) => {
		if(isOwnFromServer==true) return ( <Heading style={[styles.headingInfoPas]}>Оформлен 30 минутный резерв на рейс № {props.id}</Heading>)
        else return ( <Heading style={[styles.headingInfo]}>Оформлен 30 минутный резерв на рейс.</Heading>)			
	}


   let rowsTable=[];
   rowsTable.push(orderInfoTickets.map((item,index) => { 
                                                        return <Rows numberTicket={item.id}
                                                                     numberPlace={item.seatNum}
																	 cityFrom={item.startPoint.city}
																	 placeFrom={item.startPoint.name}
																	 timeFrom={item.startPoint.date}
																	 bag={item.baggageNum}
																	 tarif={item.tariff.name}
                                                                     ticketCost={item.tariff.price}
																	 baggagePrice={item.trip}
																	 cityTo={item.endPoint.city}
																	 placeTo={item.endPoint.name}
																	 f={item.pax.f}
																	 i={item.pax.i}
																	 o={item.pax.o}
																	 gender={item.pax.sex}
																	 dr={item.pax.dr}
																	 docType={item.pax.passportType}
																	 docNum={item.pax.passport}
																	 country={item.pax.grazhdTxt}
															    />}));    
  
   return(
    <NativeBaseProvider>
        <Box style={styles.container}>
          <ImageBackground source={require('../assets/scrbg.png')} style={styles.image_}>
		  <TouchableOpacity style={styles.image_} onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1);}}>
		    <Center flex={1}>
			  <VStack space={0} width={'90%'}>
			    <Center>
				  <Heading style={[styles.headingInfoPas]}>Покупка и бронирование билета на автобус</Heading>
				</Center>
				<Center>
                  <Stack >
				    <HStack style={[styles.blockInfoTarifs]}>
					  <Box style={[styles.infoPas1]}>
					    <Box style={styles.infoReisBold}>
						  <Text style={[styles.infoReis,styles.textInfoReis]}>Посадка: </Text>
						  <Text style={styles.textSmallInfo}>{dateStart} {timeStart} </Text>
						</Box>
						<Box style={styles.infoReisBold}>
						  <Text style={styles.textSmallInfo}>{cityStart}  {pointStart} </Text>
						</Box>
						<Box style={styles.infoReisBold}>
						  <Text style={[styles.infoReis,styles.textInfoReis]}>Высадка: </Text>
						  <Text style={styles.textSmallInfo}>{dateEnd} {timeEnd} </Text>
						</Box>
						<Box style={styles.infoReisBold}>
						  <Text style={styles.textSmallInfo}>{cityEnd} {pointEnd} </Text>
						</Box>
					  </Box>
					  <Box style={[styles.infoPas2,]}>
					    <Box style={styles.infoReisBold}>
						  <Text style={[styles.infoReis,styles.textInfoReis]}>Перевозчик: </Text>
						  <Text style={styles.textSmallInfo}>{carrier.name} </Text>
                        </Box>	
						  <Transport />
					  </Box>
					</HStack>
				  </Stack>
				</Center>
				<Center>
				  <Inforeis id={id} />
				  
				  
				 
				  <DialogCrossingShow visCrossingDialog={visibleCrossingDialog}/>
				  <DialogShow msg={msgError} visDialog={visibleDialog}/>
				  <DialogPay visDialogPay={visibleDialogPay}/>
				
				 
				 
				  <CountShow visDialogCount={visibleCountDial} dCount={countDial}/>
				  
				</Center>
				
				<Center> 
				    <Stack space={1} width={'100%'}>
					
					  <HStack space={1}>
					  
						<Center style={[( isOwnFromServer==true ) ? styles.qq1 : styles.qq2 ]}><Text style={[styles.headTable]}>Место №</Text></Center>
						<Center style={styles.ww1}><Text style={[styles.headTable]}>Тариф</Text></Center>
						<BagTitle />
						
						<Center style={styles.rr1}><Text style={[styles.headTable]}>Стоимость билета</Text></Center>
						<Center style={styles.tt1}><Text style={[styles.headTable]}>Пассажир</Text></Center>
					  </HStack>
					</Stack>
				</Center>
				
				<Center> 
				  <ScrollView> 
				    {rowsTable}
				  </ScrollView>
				</Center>
				<Center> 
				
				
				
				<LoadIndic/>
				
				
				
				  <Heading style={[styles.headingInfoPas]}>Внимание! Вы должны произвести оплату в течение 30 минут!</Heading>
				</Center>
                <Center>
				  <Text style={styles.bodyTableFromTo}>Неоплаченный заказ будет автоматически отменен через 30 минут!
			         Копия инструкции и ссылки для действий с заказом отправлены на адрес {emailFromServer}
					 Спасибо Вам за то, что используете Гоубас!
				  </Text>
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button isDisabled={disabledButton} width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]} onPress={()=>{
				
					setVisibleDialogPay(true);
					clearInterval(timerRef2.current);
					timerRef2.current=0;
					clearInterval(timerRef.current);
                    timerRef.current = 0;
				    stateRef.current = 0;
					navigation.navigate('PayScreen', { 
													 sberUrl: urlFromServer
   									               });
			        }}>
				      <Text style={styles.textButtonFirstScreen}>Купить билеты
					  </Text>
				    </Button>
                  </Box>					
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button isDisabled={disabledButton} width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]} onPress={()=>{
					
					setVisibleDialogCancel(true);
					
			       }}>
				     <Text style={styles.textButtonFirstScreen}>Отменить заказ
					 </Text>
				    </Button>
				  </Box>
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]} onPress={()=>{
				 
					let obj={'flag':1,
					      'idOrder': idOrderFromServer};/*если переходим на след страницу то когда вернемся сюда из экрана с таблицей кнопка ВЕрнуться к оплате будет доступна*/
                    removeValueReturn(); 												 
				    writeItemToStorageReturn(obj);
					
					clearInterval(timerRef2.current);
					timerRef2.current=0;
					clearInterval(timerRef.current);
                    timerRef.current = 0;
				    stateRef.current = 0;
				    navigation.navigate('PassengersScreen', { 
													
   									               });
			        }}>
				      <Text style={styles.textButtonFirstScreen}>Изменить данные пассажира
					  </Text>
				    </Button>
				  </Box>
				</Center>
				<Center>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]} onPress={()=>{
				    
					  let obj={'flag':1,
					        'idOrder': idOrderFromServer};/*если переходим на след страницу то когда вернемся сюда из экрана с таблицей кнопка ВЕрнуться к оплате будет доступна*/
                      removeValueReturn(); 												 
					  writeItemToStorageReturn(obj);
					  
					  clearInterval(timerRef2.current);
					  timerRef2.current=0;
					  clearInterval(timerRef.current);
                      timerRef.current = 0;
				      stateRef.current = 0;
					  navigation.navigate('InfoEmailPhoneScreen', { 
													
   									               });
			        }}>
				      <Text style={styles.textButtonFirstScreen}>Изменить email и номер телефона
					  </Text>
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