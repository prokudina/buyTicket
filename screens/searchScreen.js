
import React , { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Text, Container , Button , Heading,CloseIcon, Box, Image , Center , Stack , VStack , HStack, Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground , TouchableOpacity } from 'react-native';
import styles from '../styleGobusPanel.js';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons';
import { faCalendarAlt } from '@fortawesome/free-regular-svg-icons';
import { faArrowsAltV } from '@fortawesome/free-solid-svg-icons';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faPlane,faTrain,faBus,faTaxi,faAnchor } from '@fortawesome/free-solid-svg-icons';
import { faWordpress } from '@fortawesome/free-brands-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import axios from 'axios';
import Dialog from 'react-native-dialog';
import Autocomplete from 'react-native-autocomplete-input';
import { confirmAlert } from 'react-confirm-alert';
import {decode, encode} from 'base-64';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LocaleConfig} from 'react-native-calendars';

import { DoubleCircleLoader } from 'react-native-indicator';

export const SearchScreen = function({navigation , route} ) {
    LocaleConfig.locales['ru'] = {
      monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
      monthNamesShort: ['Янв.','Февр.','Март','Апр.','Май','Июнь','Июль','Авг.','Сент.','Окт.','Нояб.','Дек.'],
      dayNames: ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'],
      dayNamesShort: ['Воск.','Пон.','Втор.','Сред.','Четв.','Пятн.','Суб.'],
      today: 'Aujourd\'hui'
    };
    LocaleConfig.defaultLocale = 'ru';
	
	let now=new Date();
    let day=now.getDate();
	if(day<10) day='0'+day;
    let mon=now.getMonth()+1;
	if (mon < 10) mon = '0' + mon;
    let year=now.getFullYear();
    let nowD=day+'.'+mon+'.'+year;
	let titles=[];
	
	if (!global.btoa) { global.btoa = encode; }

    if (!global.atob) { global.atob = decode; }
	
	const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
	const [visibleCountDial , setVisibleCountDial] = React.useState(false);
	const [nowDate,setNowDate] = React.useState(nowD);//дата из календаря
	const [calendar,setCalendar] = React.useState('');//объект календарь
	const [from, setFrom] = React.useState('');//текст из инпута Откуда
	const [to, setTo] = React.useState('');//текст из инпута Куда
	const [kodFrom , setKodFrom] = React.useState('');/*код населенного пункта из Откуда для более точного поиска*/
	const [kodTo , setKodTo] = React.useState('');/*код населенного пункта из Куда для более точного поиска*/
	const [searchTrip,setSearchTrip]=React.useState([]);//найденые рейсы
	const [filterDataFrom, setFilterDataFrom] = React.useState([]);//список городов удовлетворяющих условию из инпута Куда
	const [filterDataTo, setFilterDataTo] = React.useState([]);//список городов удовлетворяющих условию из инпута Откуда
	const [filterOblTo , setFilterOblTo] = React.useState([]);/*название области*/
	const [filterOblFrom , setFilterOblFrom] = React.useState([]);
	const [filterKodFrom , setFilterKodFrom] = React.useState([]);/*код для точного поиска рейсов*/
	const [filterKodTo , setFilterKodTo] = React.useState([]);
	const [masFrom , setMasFrom] = React.useState([]);
	const [masTo , setMasTo] = React.useState([]);
	const [mainJSONFromTo, setMainJSONFromTo] = React.useState([]);//список всех городов
	const [selectedItem, setSelectedItem] =React.useState('');//выбранный пункт из выпадающего списка
    const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
    const [loading, setLoading] = React.useState(false);/*состояние индикатора загрузки*/
	const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/
	const [ timer , setTimer ] = React.useState(0);/*идентификатор таймера*/
	const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/
	const timerRef = React.useRef();/*в эту ссылку сохраним идентиф таймера главного*/
	const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
	const [countDial , setCountDial] = React.useState(10);/*обратный отсчет секунд*/
	
	const testPingText='testGobusPanel';
	
	const { getItem, setItem } = useAsyncStorage('@storage_key');
	
	const addProps1 = (x) => { x.is_own = true; return x; }
	const addProps2 = (x) => { x.is_own = false; return x; }
	
	const okDialogButton = () => { setVisibleDialog(false); };/*скрыть диалог*/
	
	stateRef.current = countTouch;
	
	useEffect(()=>{
    const unsubscribe = navigation.addListener('focus', () => {
	  const tim=setInterval( сallbackTouch,45000);				
	   timerRef.current = tim;
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
	    DialogShow(false);
		setCountDial(countDial => countDial-1);
	}
	
	/*индикатор загрузки*/
	const LoadIndic=()=>{ 
		if(loading==false) return <Box></Box>
		else return <Box style={[styles.loadIndicator , styles.loadIndicPosition]}>
                       <DoubleCircleLoader size={120} color={'#696969'}/>
                    </Box>		
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
		else return <Box  style={[styles.loadIndicator , styles.countPosition]}>
                      <Text style={styles.textCountStyle}>До возвращения на экран поиска осталось {props.dCount} сек</Text>
			          <Text style={styles.textCountStyle}>Коснитесь экрана, чтобы остаться </Text>
                    </Box>	
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
						
	function getReis(){//получить рейсы Кнопка Поиск   
           const pingData = async () => { 
               //const res=await axios('https://dev.gobus.online/api/Terminal/0.0.1/Ping?value='+testPingText); 
			   
			   
			   var username = 'p000892'; 
               var password = '123456'; 
               var basicAuth = 'Basic ' + btoa(username + ':' + password);
			   setLoading(true);
			   var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Ping?value='+testPingText;
			   fetch(session_url, {
                 method: "GET",
                 headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json"
                          },
                 }).then(async response => { 
                 if (response.ok) {
                             const data = await response.json();
							 
							 if(data.value==testPingText){
				               if(from==''||to==''||nowDate==''||from.length<4||to.length<4) {
					             setMsgError('Необходимо заполнить поля Откуда и Куда');
					             setVisibleDialog(true);
					             return; 
				               }
				               else{
	  	                         const tripSearchData = async () => {
									 
					             var session_url_own = 'https://dev.gobus.online/api/Terminal/0.0.1/Trip/Search?';
       		   
 					             if(kodFrom!=='') session_url_own=session_url_own+'fromId='+kodFrom+'&fromName='+from;
                                 else session_url_own=session_url_own+'fromName='+from;	//session_url_own=session_url_own+'fromName=';
						
					             if(kodTo!=='')session_url_own=session_url_own+'&toId='+kodTo+'&toName='+to+'&date='+nowDate+'&nearDays=5';
					             else session_url_own=session_url_own+'&toName='+to+'&date='+nowDate+'&nearDays=5';
					    
					             setLoading(true);
                                 const resultOwn =await axios.get(session_url_own, { 
                                                         headers: {
                                                                   "Accept": "application/json",
	                                                               "Authorization": basicAuth,
                                                                   "Content-Type": "application/json"}
					  					                }); 
                      													
					             resultOwn.data.trips = resultOwn.data.trips.map(x => addProps1(x));/*добавим в массив объектов свойство is_own =true каждому объекту*/

			 		             var session_url_alien='https://dev.gobus.online/api/Terminal/0.0.1/Trip/Another/Search?fromName='+from+'&toName='+to+'&date='+nowDate;									
                                 const resultAlien =await axios.get(session_url_alien, { 
                                                         headers: {
                                                                   "Accept": "application/json",
	                                                               "Authorization": basicAuth,
                                                                   "Content-Type": "application/json"}
					  					                });	
                                 resultAlien.data.trips = resultAlien.data.trips.map(x => addProps2(x));														
                        
					             setLoading(false); 
					             if((resultOwn.data.trips.length==0)&&(resultAlien.data.trips.length==0)){
					              setMsgError('По вашему запросу ничего не найдено');
						          setVisibleDialog(true);
					             }
                                 else  {						  
					               const mas=[...resultOwn.data.trips, ...resultAlien.data.trips];
						
                        
                                   if(mas.length==0){
	                                       setMsgError('По вашему запросу ничего не найдено');
		                                   setVisibleDialog(true);
	                               }
						           else{
									      clearInterval(timerRef2.current);
										  timerRef2.current=0;
									      clearInterval(timerRef.current);
                                          timerRef.current = 0;
										  
						                  navigation.navigate('ReisScreen',
							                       {searchTrip: mas});
							       }						
					             }														
                                };
					            tripSearchData();
				              }   
                             }
							 else  {
				               setMsgError('Отсутствует соединение с сервером. Повторите попытку позднее');
				               setVisibleDialog(true);
			                 }
                  } else {   throw await response.json();    }
                  }).catch(errors => {  
                      console.log('er=');
                      setMsgError(er.message);
		              setVisibleDialog(true); 
					  setLoading(false);
                  });
				  
		  }   
              
		  pingData();
	}

    const searchDataFromJSON = (quer) => {//для поля ввода Куда
	
	  setFrom(quer);
	  
	  if(quer.length>3) {
		                  setLoading(true);
						  getCitysFromTo(quer , setFilterDataFrom , setFilterOblFrom , setFilterOblTo , setMasFrom); 
						  setLoading(false);
	                    }
    };
	
	const searchDataToJSON = (quer) => {//для поля ввода Откуда
	  setTo(quer); 
	  if(quer.length>3) {
		                 setLoading(true);
		                 getCitysFromTo(quer , setFilterDataTo , setFilterOblTo , setFilterKodTo , setMasTo); 
						 setLoading(false);
	                    }
    };
	
    const getCitysFromTo = async (val , func , funcObl , funcKod , funcMas) => {
		
		//получить список городов удовлетворяющих условию 
      const res=await axios('https://dev.gobus.online/api/Terminal/0.0.1/Util/Search/City?query='+val); 
	  
	  
	  var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Util/Search/City?query='+val;
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
							              setLoading(false);
                                          setMainJSONFromTo(data);
	                                      if(val){
	                                        const regex = new RegExp(`${val.trim()}`, 'i');
	                                        var filterRes;
	                                        filterRes=data.citys.filter(function(dat){return  dat.value.search(regex) >= 0});
	                                        var filterCity=[];
		                                    var filterObl=[];
		                                    var filterKod=[];
	                                        filterCity.push(filterRes.map(trip => trip.value));
		                                    filterObl.push(filterRes.map(trip => trip.label));
		                                    filterKod.push(filterRes.map(trip => trip.id));
	                                        func(filterCity[0]);
		                                    funcObl(filterObl[0]);
		                                    funcKod(filterKod[0]);
        
                                            let mas=[];
	                                        for(var i=1;i<=filterCity[0].length;i++)
	                                        {
		 
		                                     var a={'city':filterCity[0][i-1],
		                                             'obl':filterObl[0][i-1],
				                                     'kod':filterKod[0][i-1],
				                                      'id':i};
	                                         mas.push(a);
	                                        } 
		                                    funcMas(mas);
                                          } 
	                                      else { func([]); funcObl([]); funcKod([]); }  
					                    } else {   throw await response.json();    }
                                       }).catch(errors => {  
                                                            console.log('er='); 
															setMsgError(er.message);
		                                                    setVisibleDialog(true);
															setLoading(false);
                                                          });	
    }
	
	
		
    //кнопка Поменять ОТКУДА на КУДА и обратно			
    function changeFromTo(){
		setVisibleCountDial(false);
		setCountTouch(countTouch => countTouch+1);
		setFrom(to); 
		setTo(from);
		setKodFrom(kodTo);
        setKodTo(kodFrom);
    }
	
    return ( 
	 <NativeBaseProvider>
	 
       <Box style={styles.container}>
	   
	     <ImageBackground  source={require('../assets/scrbg.png')} style={styles.image_}>
		  <TouchableOpacity style={[styles.image_]} onPress={()=>{ setVisibleCountDial(false);setCountTouch(countTouch => countTouch+1); setMasFrom([]); setMasTo([]); setCalendar(''); }}>
		   
		     <View style={[styles.header]}>
		       <Heading style={[styles.heading,styles.headingMain]}>Билеты на автобус
			   </Heading>
			 
			   <LoadIndic/>
			   <DialogShow msg={msgError} visDialog={visibleDialog}/>
               <CountShow visDialogCount={visibleCountDial} dCount={countDial}/>
			
               
			 
			   
			 
		     <View style={[styles.searchScreen ]}>
			   <Stack width={'88%'}  >
			     <VStack >
			       <Stack>
			         <HStack>
			           <View style={[styles.searchAutocompleteToView , styles.zIndFrom, styles.condensed , styles.autocompliteMargin]}>
						 <Autocomplete
				           value={from}
						   
					       style={[ styles.searchAutocomplete, styles.heightFromTo ]}
					       data={masFrom}
						   inputContainerStyle={[styles.containerAutocomplete , styles.borderMainButtons]}
					
					/*onBlur={() => {setMasFrom([])}}*/
					       onChangeText={(text) => searchDataFromJSON(text)}
					       placeholder="Откуда"
					       flatListProps={{
							 keyExtractor: (_, idx) => idx,
                             renderItem:({item}) => (
     			               <Button key={item.id.toString()}
						          style={[styles.fromToButtons , styles.fullWidth]}
    					          onPress={() => {
									setVisibleCountDial(false);
									setCountTouch(countTouch => countTouch+1);
					                setSelectedItem(item.city);
                                    setFilterDataFrom([]);
						            setFilterOblFrom([]);
						            setFilterKodFrom([]);
						            setMasFrom([]);
					                setFrom(item.city);
						            setKodFrom(item.kod);
									
				                  }}> 
						        <Text style={styles.searchRow} key={'obl'+item.id}>{item.city}, {item.obl}</Text> 
				              </Button>  
							  
				             ) 
                           }}  
				         />   
			           </View>
			           <Button width={'8%'}
				             style={[styles.clearButtons , styles.borderClearButton, styles.heightClearButtonSearch]}
						     onPress={() => { setFrom(''); setKodFrom(''); }}
					   >
				         <CloseIcon size={8} />
				       </Button>
			         </HStack>
			       </Stack>
			       <Stack>
			         <HStack>	
			           <View style={[styles.searchAutocompleteToView , styles.zIndTo, styles.condensed , styles.autocompliteMargin]}>
			             <Autocomplete
							   listStyle={{height:40}}
				               value={to}					
					           style={[ styles.searchAutocomplete , styles.heightFromTo ]}
							   inputContainerStyle={[styles.containerAutocomplete , styles.borderMainButtons]}
					           data={masTo}
					
					           onChangeText={(text) => searchDataToJSON(text)}
					           placeholder="Куда"
							   
					           flatListProps={{
							   keyExtractor: (_, idx) => idx,
                               renderItem:({ item}) => (
     			                 <Button style={styles.fromToButtons}
						           key={item.id.toString()}
						           onPress={() => { 
								     setVisibleCountDial(false);
								     setCountTouch(countTouch => countTouch+1);
					                 setSelectedItem(item.city);
                                     setFilterDataTo([]);
						             setFilterOblTo([]);
						             setFilterKodTo([]);
						             setMasTo([]);
					                 setTo(item.city);
						             setKodTo(item.kod);
									 
				                   }}> 
						           <Text style={styles.searchRow} key={'obl'+item.id}>{item.city}, {item.obl}</Text>
				                 </Button>  
				               ) 
                              }} 
				         />
			           </View>
			           <Button width={'8%'}
				             /*style={[ styles.clearButtonSearch]}*/
							 style={[styles.clearButtons , styles.borderClearButton, styles.heightClearButtonSearch]}
							 onPress={() => {setVisibleCountDial(false);setCountTouch(countTouch => countTouch+1);  setTo(''); setKodTo(''); }}
					   >
				         <CloseIcon size={8} />
				       </Button>
			         </HStack>
			       </Stack>
			     </VStack>
			   </Stack>
			   <View style={[styles.changeButton]}>
			     <Button onPress={changeFromTo} style={[styles.searchScreenButton]}>
				   <FontAwesomeIcon style={[styles.iconText]} size={40} icon={ faArrowsAltV } />
                 </Button>	
			   </View>
			   <View width={'93%'} style={[styles.condensed ,  styles.autocompliteMargin ]}>
			     <Stack>
				   <HStack space={3}>
				     <Input isDisabled={true} value={nowDate} style={[styles.searchAutocomplete , styles.heightCalendar, styles.formCalendar ]} />
					 
                     <Button style={styles.calendarButton} onPress={() => {
                                                     setVisibleCountDial(false);
					                                 setCountTouch(countTouch => countTouch+1);
										             setCalendar(<Calendar
													 
													 style={styles.calendarStyle}
													                       
													                       onDayPress={(day) => { 
																		                          var dat=day.dateString.split('-');
																		                          var date=dat[2]+'.'+dat[1]+'.'+dat[0]; 
																			                      setNowDate(date);
																								  setCalendar('');
													 											}}                                                                      
																		   />);
												   } } >
				        <FontAwesomeIcon size={40} style={styles.iconText} icon={ faCalendarAlt } />
				     </Button>  			  
				   </HStack>
				 </Stack>
			   </View>
			   <View style={[styles.condensed , styles.searchFieldFrom , styles.autocompliteMargin]}>
			     <Button style={[styles.mainButtons , styles.widthMainButtonFirstScreen, styles.fullWidth]} 
				         onPress={()=>{setVisibleCountDial(false);setCountTouch(countTouch=>countTouch+1); getReis(); }}>
				   <Text style={styles.mainButtonsText}>Найти</Text>
				 </Button>
			   </View>
			   
			   <Center>
			    
			         {calendar}
				  
			   </Center>
			 </View>
		    </View>	
           </TouchableOpacity>	   
		 </ImageBackground>
		 
       </Box>
	   	
	 </NativeBaseProvider> 
   );
}

