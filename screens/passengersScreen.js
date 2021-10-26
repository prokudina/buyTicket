import React , { useState, useEffect , useRef } from 'react';
import { Text, Container , Button , Box, Image , Select , CloseIcon, VStack , Center , Stack , HStack , Input , ScrollView , NativeBaseProvider } from 'native-base';
import { ImageBackground , TouchableOpacity, } from 'react-native';
import styles from '../styleGobusPanel.js';
import MaskInput from 'react-native-mask-input';
import Autocomplete from 'react-native-autocomplete-input';
import axios from 'axios';
import {decode, encode} from 'base-64';
import Dialog from 'react-native-dialog';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon  } from '@fortawesome/react-native-fontawesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAsyncStorage } from '@react-native-async-storage/async-storage';
import { DoubleCircleLoader } from 'react-native-indicator';

export const PassengersScreen = function({route , navigation} ) {
  const [ countPasNow, setCountPasNow ] = React.useState(1);/*какого по счету пассажира оформляем сейчас*/
  //const { selectSits } = route.params;/*массив с номерами мест которые выбрал пользователь на предыдущем экране*/
  const [ selectedTarifValue, setSelectedTarifValue ] = React.useState([]);/*выбранный тариф. То что будет в комбобоксе тарифов в selectedValue
  если рейс свой. И этот массив будем отправлять на сервер вне зависимости от того свой рейс или нет*/
  const [ selectedAnotherTarifValue , setSelectedAnotherTarifValue ] = React.useState([]);/*выбранный тариф. То что будет в комбобоксе тарифов
  в selectedValue если рейс чужой*/
  const { isOwn } = route.params;/*признак того наш это рейс или нет*/
//  const { tarifs } = route.params;/*массив с тарифами*/
  const { idReis } = route.params;/*ид рейса*/
  const { dateParams } = route.params;/*данные с предыдущей стр для отправки на сервер*/
  const { flagPhone } = route.params;/*правильно ли пользов ввел тел*/
  const { flagEmail } = route.params;/*правильно ли пользов ввел емайл*/
  const { email } = route.params;/*email пользователя*/
  const { phone } = route.params;/*номер тел*/
  //const { returnPay } = route.params;
  const [ tarifs , setTarifs ] = React.useState([]);
  const [selectedBaggage , setSelectedBaggage] = React.useState([]);/*выбранный багаж*/
  const [inputF , setInputF] = React.useState([]);/*ввод фамилии*/
  const [inputI , setInputI] = React.useState([]);/*ввод имени*/
  const [inputO , setInputO] = React.useState([]);/*ввод отчества*/
  const [selectedGender , setSelectedGender] = React.useState([]);/*выбранный пол*/
  const [inputDate , setInputDate] = React.useState([]);/*ввод даты*/
  const [inputGrazd , setInputGrazd] = React.useState(['Россия']);/*выбранное гражданство*/
  const [filterGrazd , setFilterGrazd] = React.useState([]);/*список из гражданств удовлетворяющих условию из инпута*/
  const [filterDoc , setFilterDoc] = React.useState([]);/*список видов документов*/
  const [filterTypeDoc , setFilterTypeDoc] = React.useState([]);/*список кодов документов*/
  const [ filterTypeGrazd , setFilterTypeGrazd ] = React.useState([]);/*список кодов гражданства*/
  const [filterInfoRow , setFilterInfoRow] = React.useState([]);/*подсказка для правильного ввода номера документа*/
  const [filterMask , setFilterMask] = React.useState([]);/*список маск для ввода номера документа*/
  const [selectedItem , setSelectedItem] = React.useState([]);/*выбраный из выпадающего списка элемент. Гражданство*/
  const [mainJSON, setMainJSON] = React.useState([]);//список всех гражданств или видов документов
  const [ focusedInp , setFocusedInp ] = React.useState('');//содержимое инпута для ввода гражданства
  const [selectedInfo , setSelectedInfo] = React.useState(["4+6 цифр Пример: 2002 123456"]);/*инфо о выбранном документе*/
  const [selectedMask , setSelectedMask] = React.useState([]);/*маска для выбранного документа*/
  const [selectedDoc , setSelectedDoc] = React.useState([5]);/*выбраный тип документа*/
  const [ chooseCodeTypeDoc , setChooseCodeTypeDoc ] = React.useState([]);/*выбранный код типа документа*/
  const [ chooseCodeTypeGrazd , setChooseCodeTypeGrazd ] = React.useState([643]);/*выбраный код типа гражданства*/
  const [zipDocNumMask , setZipDocNumMask] = React.useState([]);/*маска для ввода номера документа*/
  const [ checkZipDocNumMask , setCheckZipDocNumMask ] = React.useState([/([0-9]{4})\ ([0-9]{6})/g]);/*маска для проверки правильности ввода номера докум*/
  const [inputDocNum , setInputDocNum] =React.useState([]);/*ввод номера документа*/
  const [selectedTypeDoc , setSelectedTypeDoc] = React.useState([]);/*тип выбранного документа*/
  //const [ changeSits , setChangeSits ] = React.useState(selectSits);/*ориентируясь на этот массив мы будем удалять строки-пассажиров*/
  const [ changeSits , setChangeSits ] = React.useState([]);/*массив с номерами мест для пассажиров*/
  const [ submitDate , setSubmitDate ] = React.useState({});/*данные пассажиров которые мы будем отправлять на сервер*/
  const [ flagF , setFlagF ] = React.useState([false]);/*флаг для правильности введения Ф*/
  const [ flagI , setFlagI ] = React.useState([false]);/*флаг для правильности введения И*/
  const [ flagO , setFlagO ] = React.useState([false]);/*флаг для правильности введения О*/
  const [ flagDate , setFlagDate ] = React.useState([false]);/*флаг для правильного ввода даты*/
  const [ flagDoc , setFlagDoc ] = React.useState([false]);/*флаг для правильного ввода номера документа удостов личность*/
  const [ flagGrazd , setFlagGrazd ] = React.useState([true]);/*флаг для правильного ввода гражданства */
  const [ flagGender , setFlagGender ] = React.useState()
  const { getItem, setItem } = useAsyncStorage('@storage_key_passengers');/*значение ключа для хранилища*/
  const [ nameCountry , setNameCountry ] = React.useState(['Россия']);/*названия стран которые выбрал пользователь*/
  const [ submitData , setSubmitData ] = React.useState([]);/*данные перед отправкой на сервер или сохранением*/
  const [ submitData1 , setSubmitData1 ] = React.useState([]);/*данные перед отправкой на сервер или сохранением*/
  const [ returnPay , setReturnPay ]=React.useState(0);/*флаг возврата с экрана с таблицей*/
  const [ idOrderScreen , setIdOrderScreen ] = React.useState(0);
  const [ formUrlScreen , setFormUrlScreen ] = React.useState('');
  const [loading, setLoading] = React.useState(false);/*состояние индикатора загрузки*/
  const [ flagAnotherTypeDoc , setFlagAnotherTypeDoc ] = React.useState(false);/*если пользов выбрал произвольный тип документа то этот флаг поднимется.
  И тогда флаг правильности введения номера будет true всегда. Если иные типы то он опустится. И 
  флан правильности введения номера будет работать по общим правилам*/
  const [ disabledButton , setDisabledButton ] = React.useState(true);/*если true то будет доступна кнопка Далее*/
  const [ responseFromServ , setResponseFromServ ] = React.useState({});/*то что вернет post-запрос Register*/
  const [msgError , setMsgError]=React.useState('');//текст в окне диалога об ошибке
  const [visibleDialog, setVisibleDialog] = useState(false);//показать/скрыть диалоговое окно
  const [visibleCrossingDialog, setVisibleCrossingDialog] = useState(false);//показать/скрыть диалоговое окно
  const [timer , setTimer] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/
  const [ timer2 , setTimer2 ] = React.useState(1);/*индикатор таймера. сбрасывается при событии касания экрана (если панель используют если нет-вернет на первый экран)*/   
  const stateRef = React.useRef();/*в эту ссылку сохраним количество кликов на экране*/  
  const timerRef = React.useRef();
  const timerRef2 = React.useRef();/*в эту ссылку сохраним идентиф таймера окна обратного отсчета*/
  const [ countTouch , setCountTouch ] = React.useState(0);/*количество касаний экрана*/ 
  const [visibleCountDial , setVisibleCountDial] = React.useState(false);
  const [countDial , setCountDial] = React.useState(10);/*обратный отсчет секунд*/
  
  
  
  
  
  
  const masBaggage=['Нет','1','2','3'];
  const zipCodeMask = [/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/
	,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/];
  const zipDateMask = [/\d/,/\d/,'.',/\d/,/\d/,'.',/\d/,/\d/,/\d/,/\d/];
  const masGender=['Ж','М'];
  stateRef.current = countTouch;
  
  const removeValueAnother = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key');
			  await AsyncStorage.removeItem('@storage_key_sits');
			  await AsyncStorage.removeItem('@storage_key_passengers');
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
  
  /*индикатор загрузки*/
	const LoadIndic=()=>{ //alert('load');
		if(loading==false) return <Box></Box>
		else return <Box style={[styles.loadIndicatorPas , styles.loadIndicPositionPas]}>
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
		else return <Box style={[styles.loadIndicator , styles.countPositionPas]}>
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
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button  style={styles.dialogStyle} label="OK" onPress={()=>{setCountTouch(countTouch=>countTouch+1);setVisibleDialog(false); setLoading(false);}} />
            </Box>
			</Center>
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
			<Center>
			<Box style={styles.dialogBox}>
			  <Dialog.Button style={styles.dialogStyle} label="Да" onPress={()=>{setCountTouch(countTouch=>countTouch+1);setVisibleCrossingDialog(false);
			                                        removeItemFromStorageAnother();
										            removeItemFromStorageReturn();
										            removeItemFromStorageSits();
													clearInterval(timerRef2.current);
                                                    timerRef2.current = 0;
													clearInterval(timerRef.current);
                                                    timerRef.current = 0;
				                                    stateRef.current = 0;
													
 			                                        navigation.navigate('FirstScreen'); }} />
			  <Dialog.Button style={styles.dialogStyle} label="Нет" onPress={()=>{setCountTouch(countTouch=>countTouch+1); setVisibleCrossingDialog(false); }} />
            </Box>
			</Center>
		   </Dialog.Container>
		)
  }
  
console.log('selectSits=');console.log(changeSits);
console.log('countPasNow=');console.log(countPasNow);
  
  /*запись в хранилище данных пассажиров*/
	const writeItemToStorage = async newValue => {  
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key_passengers',jsonValue); 
    };
	
	/*запись в хранилище мест*/
	const writeItemToStorageSits = async newValue => {  
      const jsonValue = JSON.stringify(newValue);
      await AsyncStorage.setItem('@storage_key_sits',jsonValue); 
    };
	
	 /*чтение из хранилища ключа возвращения на эту стр*/
    const readItemFromStorageReturn = async () => { 
	  const item = await AsyncStorage.getItem('@storage_key_return'); 
	  if((item!==null)&&(item!==undefined)) {
		setReturnPay(1); 	
	  }	  
    }
	
	 /*чтение из хранилища мест*/
    const readItemFromStorageSits = async () => { 
	  const item = await AsyncStorage.getItem('@storage_key_sits'); 
	  if((item!==null)&&(item!==undefined)) {
	    var mas=JSON.parse(item);
		setChangeSits(mas); 
        //setCountPasNow(mas.length);		
	  }	  
    }
	
	const readItemFromStorageTarifs = async() => {
	  const item = await AsyncStorage.getItem('@storage_key'); 
	  if((item!==null)&&(item!==undefined)) { 
	    var mas=JSON.parse(item);
		setTarifs(mas.tarifs); 	
	  }	 
	}
	
	const removeItemFromStorageReturn = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_return')
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
	const removeItemFromStorageSits = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_sits')
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
	const removeItemFromStorageAnother = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_passengers')
			  await AsyncStorage.removeItem('@storage_key')
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }
	
  /*чтение из хранилища данных пассажиров*/
	const readItemFromStorage = async(filterM) => { 
      const item = await getItem();  
   
	  if((item!==null)&&(item!==undefined)) { 
	    var mas=JSON.parse(item);
		
        console.log('masFromHranil=');console.log(mas);
       
		//setChangeSits(selectSits);
		
		const info = [];
		mas.info[0].map((item,index)=>{ info[index] = item;});
		setSelectedInfo(info);
		
		const bag = [];
		mas.paxes.map((item,index)=>{bag[index] = item.baggageNum;});
		setSelectedBaggage(bag);
		
		const tarif = [];
		mas.paxes.map((item,index)=>{ tarif[index] = item.idTariff; });
		if(isOwn==true)	setSelectedTarifValue(tarif);
		else setSelectedAnotherTarifValue(tarif);
		
		if(isOwn==false){
		  const onServ=[];
		  mas.paxes.map((item,index)=>{ onServ[index] = item.idTariffForServ });
		  setSelectedTarifValue(onServ);
		}
		
		const gender = [];
		mas.paxes.map((item,index)=>{ gender[index] = item.pax.sex; });
		setSelectedGender(gender);
        
		const grazd = [];
		mas.paxes.map((item,index)=>{ grazd[index] = item.pax.grazhd;	});
		setInputGrazd(grazd);
		
		const typeDoc = [];
		mas.paxes.map((item,index)=>{ typeDoc[index] = item.pax.passportType;	});
		setSelectedDoc(typeDoc);
		
		const fam=[];
		mas.paxes.map((item,index)=>{ fam[index] = item.pax.f;}); 
		setInputF(fam);
		
		const name = [];
		mas.paxes.map((item,index)=>{  name[index] = item.pax.i;	});
		setInputI(name);
		
		const ot = [];
		mas.paxes.map((item,index)=>{ ot[index] = item.pax.o;	});
		setInputO(ot);
		
		const dat = [];
		mas.paxes.map((item,index)=>{ dat[index] = item.pax.dr; });
		setInputDate(dat);
		
		const numDoc = [];
		mas.paxes.map((item,index)=>{ numDoc[index] = item.pax.passport;	});
		setInputDocNum(numDoc);
		
		const flag_f = [];
		mas.paxes.map((item,index)=>{ flag_f[index] = true;	});
		setFlagF(flag_f);
		
		const flag_i = [];
		mas.paxes.map((item,index)=>{ flag_i[index] = true;	});
		setFlagI(flag_i);
		
		const flag_o = [];
		mas.paxes.map((item,index)=>{ flag_o[index] = true;	});
		setFlagO(flag_o);
		
		const flag_date = [];
		mas.paxes.map((item,index)=>{ flag_date[index] = true;	});
		setFlagDate(flag_date);
		
		const flag_doc = [];
		mas.paxes.map((item,index)=>{ flag_doc[index] = true;	});
		setFlagDoc(flag_doc);
		
		const flag_gr = [];
		mas.paxes.map((item,index)=>{ flag_gr[index] = true;	});
		setFlagGrazd(flag_gr);
		
		const typeD = [];
		let mask=[];
		let checkMask=[];
		mas.paxes.map((item,index)=>{  
		  typeD[index] = item.pax.passportType;
		  let a='';
          a=typeD[index];
		  
		  switch(filterM[a])	  
	      {
	        case  '_______________' :{mask[0]=[/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/]; checkMask=[/([a-zA-Zа-яА-Я0-9]{15})/g]; setFlagAnotherTypeDoc(true); break;}
	        case  'CC 0000000' :{mask[0]=[/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([a-zA-Zа-яА-Я]{2})\ ([0-9]{7})/g]; setFlagAnotherTypeDoc(false);  break;}
	        case  '00 0000000' :{mask[0]=[/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{2})\ ([0-9]{7})/g]; setFlagAnotherTypeDoc(false); break;}
	        case  '0000 000000' : {mask[0]=[/\d/,/\d/,/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{4})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	        case  'Sss CC 000000' :{ mask[0]=[/[IVX]/,/[IVX]/,/[IVX]/,' ',/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([IVX]{3})\ ([a-zA-Zа-яА-Я]{2})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	        case  'Ssss CC 000000' :{ mask[0]=[/[IVX]/,/[IVX]/,/[IVX]/,/[IVX]/,' ',/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([IVX]{4})\ ([a-zA-Zа-яА-Я]{2})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	        default :{mask[0]=[/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{15})/g]; setFlagAnotherTypeDoc(true); break;}
	      }

	      let copy=Object.assign([], zipDocNumMask);
          copy[index] = mask[0]; 
          setZipDocNumMask(copy);
		  
		  let copy1=Object.assign([], checkZipDocNumMask);
          copy1[index] = checkMask[0];
          setCheckZipDocNumMask(copy1);
		});
		console.log('returnPay=');console.log(returnPay);
	    if(returnPay!==0){ console.log(mas.formUrl);
		  setIdOrderScreen(mas.idOrder);
		  setFormUrlScreen(mas.formUrl);
		}
		
	 }
	 setDisabledButton(false);
	 setLoading(false);
    }

  /*стирание данных из хранилища*/
	const removeValue = async () => {
		try {
			  await AsyncStorage.removeItem('@storage_key_passengers');
			} 
	    catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
    }

  /*снять бронь с места место*/  
  async function clickUnlock(numPlace){ 
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
				                    setLoading(false);			
							        /*если место получилось зарезервировать то обновить массив с местами вызвав getPlaces чтобы они перерисовались*/
 	                                if(data==true){ 
			                                        var kol=changeSits.indexOf(numPlace);
			                                        setChangeSits([...changeSits.slice(0, kol), ...changeSits.slice(kol + 1)]);
													removeItemFromStorageSits();
													writeItemToStorageSits([...changeSits.slice(0, kol), ...changeSits.slice(kol + 1)]);
			                                        return true;
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
		  var kol=changeSits.indexOf(numPlace);
		  setChangeSits([...changeSits.slice(0,kol), ...changeSits.slice(kol + 1)]);
		  removeItemFromStorageSits();
		  writeItemToStorageSits([...changeSits.slice(0,kol), ...changeSits.slice(kol + 1)]);
		}
    }
		
	
  //alert(disabledButton);
  useEffect(()=>{
		const unsubscribe = navigation.addListener('focus', () => {
			        /*const tim=setInterval( сallbackTouch,45000);
	                timerRef.current = tim;*/
			       
			        //removeItemFromStorageReturn ();
					setLoading(true);
					setDisabledButton(true);
                    
		            async function getTrip(){//получим данные по выбранному рейсу 
					 
					  var username = 'p000892';
                      var password = '123456';
                      var basicAuth = 'Basic ' + btoa(username + ':' + password);
                      var result;
					  //setLoading(true);
					  //setDisabledButton(true);
					  readItemFromStorageReturn();
					  
					  var session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Util/Documents';									
					  
					  
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
                                          var filterRes=[];
	                                      filterRes=data.documents;
	                                      var filterDocument1=[]; 
	                                      var filterMask1=[];
	                                      var filterInfoRow1=[];
	                                      var filterType1=[]; 
	                                      filterDocument1.push(filterRes.map(trip => trip.name)); 
	                                      filterType1.push(filterRes.map(trip => trip.code)); 
	                                      filterMask1.push(filterRes.map(trip => trip.mask)); 
	                                      filterInfoRow1.push(filterRes.map(trip => trip.example)); 

	                                      setFilterDoc(filterDocument1[0]);
	                                      setFilterMask(filterMask1[0]);
	                                      setFilterInfoRow(filterInfoRow1[0]);
	                                      setFilterTypeDoc(filterType1[0]);	
					  
					  //removeValue();
					                      readItemFromStorage(filterMask1[0]);/*прочитаем данные из хранилища*/
										  readItemFromStorageSits();
										  readItemFromStorageTarifs();
					   //setDisabledButton(false);
					  //setLoading(false);
                                       } else {   throw await response.json();    }
                      }).catch(errors => {  
                                           console.log('er='); 
										   setMsgError(errors.message);
		                                   setVisibleDialog(true); 
										  
                      });
	                }
					getTrip();	
                    					
					
        });
		return unsubscribe;
  },[]); 
			
  /*проверка правильности введения данных при оформлении пассажиров. Все ли введено?*/
  const checkParams = function () {   
    var id=true;console.log('idbeg=');console.log(id);
	/*проверяем правильность введения ФИО и даты*/
	flagF.map((item,index) => {console.log(item); if(item==false) id=false;}); console.log('idfamilia=');console.log(id);
    flagI.map((item,index) => {if(item==false) id=false;});console.log('idimia=');console.log(id);
    flagO.map((item,index) => {if(item==false) id=false;});console.log('idotchestvo=');console.log(id);
    flagDate.map((item,index) => {if(item==false)  id= false;});console.log('idDateRozdenie=');console.log(id); 
    /*проверка правильности введения тел и почты*/							   
    if((flagPhone==false) || (flagEmail==false)){id=false; }console.log('idFlagPhoneEmail=');console.log(id);
    /*проверка выбранного тарифа багажа пола*/ 
	let count=0;
	if(selectedTarifValue.length!==0){
		selectedTarifValue.map((item,index) => { count=count+1;});
	    if(count<countPasNow) id=false;	
	}
	else id=false;console.log('idtarif=');console.log(id);
	count=0;
	if(isOwn==true){
      if(selectedBaggage.length!==0){
		  selectedBaggage.map((item,index) => { count=count+1;});
	      if(count<countPasNow) id=false;	
	  }							   
	  else id=false;console.log('idBaggage=');console.log(id);
	}
	count=0;console.log('gender='); console.log(selectedGender);
	if(selectedGender.length!==0){ 
	    selectedGender.map((item,index) => { count=count+1;});
		if(count<countPasNow) id=false;
	}
	else id=false; console.log('idGender=');console.log(id);
    /*проверка правильности ввода гражданства типа документа номера документа*/	
console.log('inputGrazd in submit=');console.log(inputGrazd); 	
	if(inputGrazd.length!==0){
		inputGrazd.map((item,index) => { if((item==undefined) || (item==' '))id=false;});
	}
	else id=false; console.log('idgrazdanstvo=');console.log(id);
    if(selectedDoc.length!==0){
		selectedDoc.map((item,index) => {if((item==undefined) || (item==' '))id=false;});
	}
	else id=false;console.log('iddocType=');console.log(id);
	count=0;
console.log('flagDoc=');console.log(flagDoc);
    flagDoc.map((item,index) => {if(item==false) id=false;}); console.log('idnumdoc=');console.log(id);
    return id;  	
  }
  
  /*собрать данные для сохранения. Так как номер заказа, урл, почта и тд могут
  понадобиться для возвращения на экран passengersInfoScreen в случае неуспешной оплаты
  то сохоаним эти данные в хранилище*/
  const getSaveData = function(){
	var isAllRight=checkParams(); 
	let submInfoMask=[];
	if(isAllRight==true){	
	    submInfoMask={
          'paxes': [],
		  'info': [],
		  'idOrder':'',
		  'formUrl':'',
		  'email':'',
		  'isOwn':''
        };
	    changeSits.map((item,index)=> { 
		  const pax={
			'seatCode':changeSits[index],
			'selectedTypeDoc': selectedTypeDoc[index],
			'idTariff':(isOwn==true) ? selectedTarifValue[index] : selectedAnotherTarifValue[index],
			'idTariffForServ': (isOwn==true) ? '' : selectedTarifValue[index],
			'baggageNum':(isOwn==true) ? selectedBaggage[index] : 0,
			'pax':{
				'f':inputF[index],
				'i':inputI[index],
				'o':inputO[index],
				'sex':selectedGender[index],
				'dr':inputDate[index],
				'grazhd':chooseCodeTypeGrazd[index],
				'passportType': selectedDoc[index],
				'passport':inputDocNum[index]
			}
		  };
		  submInfoMask.paxes.push(pax);
	    }); 
        //submInfoMask.masks.push(zipDocNumMask); console.log('submInfoMask='); console.log(submInfoMask);
        submInfoMask.info.push(selectedInfo); 
        return submInfoMask;	 	
	}
	else return false;
  }
  
  /*собрать данные для отправки на сервер*/
  const getData = function(){
	var isAllRight=checkParams();  
	let submit_=[];
	var customData = require('./terminal.json');
    if(isAllRight==true){
      if(isOwn==true)		
	    submit_={
          "idTrip": idReis,
		  "idTerminal": customData.idTerminal,
          "provider": dateParams.provider,
          "date": dateParams.date,
          "idStart": dateParams.idStart,
          "idEnd": dateParams.idEnd,
          "phone": dateParams.phone,
          "email": dateParams.email,
          "paxes": [ ]
        };
	  else submit_={
		"idTrip": idReis, 
        "provider": dateParams.provider,
        "date": dateParams.date,		
		"phone": dateParams.phone,
        "email": dateParams.email,
        "paxes": [ ]
	  };
 
	  changeSits.map((item,index)=> { 
		 /*console.log('itog=');console.log(chooseCodeTypeGrazd[index]);*/
		const pax={
			'seatCode':changeSits[index],
			'idTariff': selectedTarifValue[index], 
			'baggageNum':(isOwn==true) ? selectedBaggage[index] : 0,
			'pax':{
				'f':inputF[index],
				'i':inputI[index],
				'o':inputO[index],
				'sex':selectedGender[index],
				'dr':inputDate[index],
				'grazhd':chooseCodeTypeGrazd[index],
				/*'passportType':chooseCodeTypeDoc[index],*/
				'passportType': selectedDoc[index],
				'passport':inputDocNum[index]
			}
		};
				
		submit_.paxes.push(pax); console.log('onServer=');console.log(submit_);
	  }); 
     return submit_;	 
	}
	else return false;
  }

  const removeValueReturn = async () => {
	 try {
		   await AsyncStorage.removeItem('@storage_key_return')
		 } 
	 catch(e) { setMsgError('Ошибка удаления данных из хранилища');
		           setVisibleDialog(true); }
  }	
	
 
/*посылаем данные на сервер*/	
  const passOnServer = async ()=>{
	   //removeValueReturn(); 
	
	  if(returnPay==0){ 

	       var session_url='https://dev.gobus.online/api/Terminal/0.0.1/Order/Register';
	       var username = 'p000892'; 
           var password = '123456';
           var basicAuth = 'Basic ' + btoa(username + ':' + password); 
		 
		   console.log('submitData on server=');console.log(objData);
		   var objData=getData();
		
           fetch(session_url, {
                 method: "POST",
                 headers: {
                            "Authorization": basicAuth,
                            "Content-Type": "application/json"
                          },
                 body:JSON.stringify(objData)
           }).then(async response => { 
           if (response.ok) {
                             const data = await response.json();
							 setLoading(false);
							 /*после того как будет нажата кнопка Готово нужно не только сформировать объект с данными
	                                  пассажира и передать его на сервер, но и загрузить в хранилище этот объект 
	                                  что бы если чел вернется на эту стр извлеч их из хранилища и заполнить ими строки*/
							 let obj=getSaveData();
                             obj.paxes.map((item,index)=>{ item.pax.grazhd=nameCountry[index];  }); 
						     obj.idOrder=data.idOrder;
						     obj.formUrl=data.formUrl;
							 obj.email=JSON.stringify(email);
							 obj.isOwn=isOwn;
									  
	                          removeValue(); console.log('obj=');console.log(obj);
	                          writeItemToStorage(obj);
							  
							  setIdOrderScreen(data.idOrder);
							  setFormUrlScreen(data.formUrl);
							  
							  clearInterval(timerRef2.current);
                              timerRef2.current = 0;
							  clearInterval(timerRef.current);
                              timerRef.current = 0;
				              stateRef.current = 0;
							 
							  navigation.navigate('PassengersInfoScreen', { 
		                                                                    /*idOrder:data.idOrder,
		                                                                    formUrl:data.formUrl,
																			email: JSON.stringify(email),
                                                                            isOwn: isOwn*/
   																          });
							 
		  
                            } else {   throw await response.json();    }
           }).catch(errors => {  
                    console.log('er=');
					setMsgError(errors.message);
		            setVisibleDialog(true); 
					setLoading(false);
      
           });
	  }
	  else {
		     clearInterval(timerRef2.current);
             timerRef2.current = 0;
             clearInterval(timerRef.current);
             timerRef.current = 0;
			 stateRef.current = 0;
		     navigation.navigate('PassengersInfoScreen', { 
		                                                  /* idOrder:idOrderScreen,
		                                                   formUrl:formUrlScreen,
														   email: JSON.stringify(email),
                                                           isOwn: isOwn*/
   													   });
	       }
 }
	
  /*для поля ввода гражданства*/
  const searchDataGrazdToJSON = (quer,index) => {
	setVisibleCountDial(false);
	setCountTouch(countTouch=>countTouch+1);
	const inputData = [...inputGrazd]; 
    inputData[index] = quer; /*console.log('inputData=');console.log(inputData);*/
	setInputGrazd(inputData);
	if((quer.length>1))  { setLoading(true); getGrazd(quer , setFilterGrazd , index); setLoading(false); }
  };
  
  /*для поля ввода вид документа*/
  const searchDataDocToJSON = (quer,index) => {
	const inputData = [...selectedDoc];
	inputData[index] = quer;
	setInputDoc(inputData); 
	setLoading(trie);
	getDoc(quer , setFilterDoc , index); 
	setLoading(false);
  };

 /*получить список видов документов*/
  const getDoc = async (val , func , index) => {  
    var session_url = 'https://dev.gobus.online/api/Terminal/0.0.1/Util/Documents';		
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
                                          setMainJSON(data);
	                                      if(val){
	                                               const regex = new RegExp(`${val.trim()}`, 'i');
	                                               var filterRes=[];
	                                               filterRes=data.documents.filter(function(dat){ return dat.name.search(regex) >= 0}); 
	                                               var filterDocument1=[]; 
	                                               var filterMask1=[];
	                                               var filterInfoRow1=[];
	                                               var filterType1=[]; 
	                                               filterDocument1.push(filterRes.map(trip => trip.name)); 
	                                               filterType1.push(filterRes.map(trip => trip.code)); 
	                                               filterMask1.push(filterRes.map(trip => trip.mask)); 
	                                               filterInfoRow1.push(filterRes.map(trip => trip.example)); 
 
	                                               setFilterDoc([...filterDoc.slice(0, index), filterDocument1[0],...filterDoc.slice(index + 1)]);

	                                               setFilterMask([...filterMask.slice(0, index), filterMask1[0],...filterMask.slice(index + 1)]);
	                                               setFilterInfoRow([...filterInfoRow.slice(0, index), filterInfoRow1[0],...filterInfoRow.slice(index + 1)]);
	                                               setFilterTypeDoc(filterType1[0]);
                                                 }
                                                 else func([]); 
					                    } else {   throw await response.json();    }
                                       }).catch(errors => {  
                                                            console.log('er='); 
															setMsgError(errors.message);
		                                                    setVisibleDialog(true); 
															
                                                          });	  
  }  

  /*получить список гражданств*/
  const getGrazd = async (val , func, index) => {
	var session_url= 'https://dev.gobus.online/api/Terminal/0.0.1/Util/Search/Country?query='+val;
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
						                  setMainJSON(data);
	                                      if(val){
	                                           const regex = new RegExp(`${val.trim()}`, 'i');
	                                           var filterRes=[];
	                                           var filterType1=[]; 
	                                           filterRes=data.countrys.filter(function(dat){return dat.value.search(regex) >= 0});
	                                           var filterCity=[];
	                                           filterCity.push(filterRes.map(trip => trip.value));
	                                           filterType1.push(filterRes.map(trip => trip.okcm));
	  
	                                           const inputData = [...filterGrazd]; 
                                               inputData[index] = filterCity[0]; 
	                                           setFilterGrazd(inputData);
//debugger;
                                               const inputData1 = [...nameCountry]; 
                                               inputData1[countPasNow-1] = filterCity[0][0]; 
	                                           setNameCountry(inputData1);	  
	  
	                                           const inpDataGr=[...filterTypeGrazd];
	                                           inpDataGr[index]=filterType1[0];

	                                           setFilterTypeGrazd(inpDataGr);

	  /*setFilterTypeGrazd(filterType1[0]);*/
                                          } 
	                                      else func([]);  
                                       } else {   throw await response.json();    }
                                       }).catch(errors => {  
                                                            console.log('er=');
                                                            setMsgError(errors.message);
		                                                    setVisibleDialog(true); 
															
                                                          });	  
  }	
  /*console.log('nameCountry=');console.log(nameCountry);*/
  /*для того чтобы ввод в поле номер докум не дублировался в разных строчках*/
  const onChangeTextComp = function(value,index,inp,func){
	setVisibleCountDial(false);
	setCountTouch(countTouch=>countTouch+1);  
    const inputData = [...inp]; 
    inputData[index] = value; 
    func(inputData);
	checkDoc(value,index,inp);
  }

  /*для того чтобы выбор в комбобоксах (багаж,пол)не дублировались в разных строчках*/
  const onChangeCombo = function(value,index,inp,func){ 
      setVisibleCountDial(false);
      setCountTouch(countTouch=>countTouch+1);
	  const inputData = [...inp]; 
      inputData[index] = value; 
      func(inputData);
	}
  
  /*установка для каждого пассажира типа док,инфы о вводе правильном,маски,кода выбранного док*/
  const onChangeComboDoc = function(value){ 
 
	const inputData = [...selectedDoc]; 
    inputData[countPasNow-1] = value;
    setSelectedDoc(inputData); 
  }
  
  /*для того чтобы выбор в комбобоксе (тариф)не дублировались в разных строчках*/
  const onChangeComboTarif = function(value,index){
    setVisibleCountDial(false);	  
    setCountTouch(countTouch=>countTouch+1);

    const inputData = [...selectedTarifValue];
    if(isOwn==false){
	  let dates=tarifs[value].id;  
      inputData[index] = dates;
	  
	  const inpdat = [...selectedAnotherTarifValue];
	  inpdat[index]=value;
	  setSelectedAnotherTarifValue(inpdat);
	}
	else inputData[index] = value;
    setSelectedTarifValue(inputData);  
  }
  
  /*проверка ФИО*/
  const checkFIO = function(value,index,inputData,flagFIO,setFlagFIO) {
	const inputD = [...flagFIO]; 
    if((value.match(/[а-яА-ЯЁё]/g)!==null) || (value.match(/[a-zA-Z]/g)!==null))
	{ 
	  setFlagFIO(inputD); 
	}
    else { 
		  inputD[index] = false;
		  setFlagFIO(inputD); 
    }

	if(inputData[index]!==undefined){
      if(( (inputData[index].match(/[a-zA-Z]/g)!==null) && (inputData[index].match(/[а-яА-ЯЁё]/g)==null) ) || ( (inputData[index].match(/[a-zA-Z]/g)==null) && (inputData[index].match(/[а-яА-ЯЁё]/g)!==null) ))
	  {
		  inputD[index] = true;
		  setFlagFIO(inputD);; 
	  }
      else {
		    inputD[index] = false;
		    setFlagFIO(inputD); 
			}	
	} 
  }
  
  /*проверка даты*/
  const checkDate = function (value,index,inp){
	const inpDat=[...flagDate];
	
    if((value.match(/([0-9]{2})\.([0-9]{2})\.([1-2])([0-9]{3})/g)!==null))
	  inpDat[index]=true;
    else inpDat[index]=false; 

	setFlagDate(inpDat);
  }
  
  /*проверка правильности введение номера документа*/
  const checkDoc = function (value,index,inp){ 
    const inpDat=[...flagDoc]; 
    let mask=(checkZipDocNumMask[countPasNow-1]!==undefined) ? checkZipDocNumMask[countPasNow-1] : /([0-9]{4})\ ([0-9]{6})/g; 
	if(value.match(mask)!==null)
	{ inpDat[index]=true; }
    else {inpDat[index]=false; }

    if(flagAnotherTypeDoc==false)
	  setFlagDoc(inpDat);
    else {
	  inpDat[index]=true;
	  setFlagDoc(inpDat);
	}
  }
	
  /*для того чтобы ввод в поля Фамилия, Имя, Отчество (то есть инпуты в разных строчках) не дублировался в других строчках*/
  const onChangeTextCompFIO=(value,index,inp,func,flagFIO,setFlagFIO)=>{
	setVisibleCountDial(false);
	setCountTouch(countTouch=>countTouch+1);
    const inputData = [...inp]; 
    inputData[index] = value; 
    func(inputData);

	checkFIO(value,index,inputData,flagFIO,setFlagFIO);
  }
  
  /*для того чтобы ввод в поля дата (то есть инпуты в разных строчках) не дублировался в других строчках*/
  const onChangeTextCompDate=(value,index,inp,func)=>{
	setVisibleCountDial(false);
	setCountTouch(countTouch=>countTouch+1);  
    const inputData = [...inp]; 
    inputData[index] = value; 
    func(inputData);
	checkDate(value,index,inp);
  }
  
  /*формирование маски для ввода номера документа в зависимости от выбранного типа документа*/
   const chooseDoc = function(value){   
	const inputData = [...selectedDoc]; 
    inputData[countPasNow-1] = value;
    setSelectedDoc(inputData);
	
	var a=inputData[countPasNow-1]; 
	var selectedInfoRow=filterInfoRow[a];
	/*var selectedMask=filterMask[a];*/
	var index=countPasNow-1;

	var c=selectedInfoRow.replace(new RegExp("<br>",'g')," "); 
	setSelectedInfo([...selectedInfo.slice(0, index), c,...selectedInfo.slice(index + 1)]);
	/*setFilterInfoRow(b);*/
	let mask=[];
	let checkMask=[];
	checkMask[0]=[/([0-9]{15})/g];
	mask[0]=[/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/];

    switch(filterMask[a])	  
	{
	 case  '_______________' :{mask[0]=[/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/,/[a-zA-Zа-яА-Я0-9]/]; checkMask=[/([a-zA-Zа-яА-Я0-9]{15})/g]; setFlagAnotherTypeDoc(true); break;}
	 case  'CC 0000000' :{mask[0]=[/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([a-zA-Zа-яА-Я]{2})\ ([0-9]{7})/g]; setFlagAnotherTypeDoc(false); break;}
	 case  '00 0000000' :{mask[0]=[/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{2})\ ([0-9]{7})/g]; setFlagAnotherTypeDoc(false); break;}
	 case  '0000 000000' : {mask[0]=[/\d/,/\d/,/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{4})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	 case  'Sss CC 000000' :{ mask[0]=[/[IVX]/,/[IVX]/,/[IVX]/,' ',/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([IVX]{3})\ ([a-zA-Zа-яА-Я]{2})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	 case  'Ssss CC 000000' :{ mask[0]=[/[IVX]/,/[IVX]/,/[IVX]/,/[IVX]/,' ',/[a-zA-Zа-яА-Я]/,/[a-zA-Zа-яА-Я]/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([IVX]{4})\ ([a-zA-Zа-яА-Я]{2})\ ([0-9]{6})/g]; setFlagAnotherTypeDoc(false); break;}
	 default :{mask[0]=[/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; checkMask=[/([0-9]{15})/g]; setFlagAnotherTypeDoc(true); break;}
	}

	let copy=Object.assign([], zipDocNumMask);
    copy[index] = mask[0]; 
    setZipDocNumMask(copy);
	
	let copy1=Object.assign([], checkZipDocNumMask);
    copy1[index] = checkMask[0];
    setCheckZipDocNumMask(copy1);
  } 
  
  let tarifsForCombo=[];/*доступные тарифы. Если persent==0 то пропишем что тариф 100% в иных случаях будем ставить значение из percent без изменения*/
  tarifsForCombo.push(tarifs.map(function(val,index){if(val.percent==0) return ''+val.name+' '+'100%';
	                                                     else return ''+val.name+' '+val.percent+'%' }));	
	console.log('tarifsForComb=');console.log(tarifsForCombo);
   /*отрисовка комбо с багажем*/
  const Bag = () => { 
	  if(isOwn==true) return( 
	       <Box style={styles.marginBotPas}>
	         <Select 
			    style={[styles.textSmallInfo]}
			    selectedValue={selectedBaggage[countPasNow-1]!==undefined ? selectedBaggage[countPasNow-1] : ''}
				placeholder="Выберите количество мест багажа"
				placeholderTextColor="#FFFFFF" 
				onValueChange={(itemValue) => onChangeCombo(itemValue,(countPasNow-1),selectedBaggage,setSelectedBaggage)}	>
			    {optionsBaggage}
	          </Select>
		   </Box>)
	  else return <Box></Box>
  }	
  
  /*отрисовка комбо с тарифами*/
  const Tarifs = () => {
	  if(isOwn==true) return (
	    <Select
			selectedValue={selectedTarifValue[countPasNow-1]!==undefined ? selectedTarifValue[countPasNow-1] : ''}
			placeholder="Выберите тариф"
			style={[styles.textSmallInfo]}
			placeholderTextColor="#FFFFFF" 
			onValueChange={(itemValue) => onChangeComboTarif(itemValue,(countPasNow-1))}	>
			{optionsTarif}
		</Select>
	  )
	  else return (
	    <Select
			selectedValue={selectedAnotherTarifValue[countPasNow-1]!==undefined ? selectedAnotherTarifValue[countPasNow-1] : ''}
		    placeholder="Выберите тариф"
			style={[styles.textSmallInfo]}
			placeholderTextColor="#FFFFFF" 
			onValueChange={(itemValue) => onChangeComboTarif(itemValue,(countPasNow-1))}	>
			{optionsTarif}
		</Select>
	  )
  }

  /*выпадающие пункты для комбобокса*/
  const optionsTarif = tarifsForCombo[0].map((text, index) => {
		return <Select.Item label={text} value={index} />;
    });
  
  /*выпадающие пункты для багажа*/
  const optionsBaggage = masBaggage.map((text, index) => {
		return <Select.Item label={text} value={index} />;		
  });
  
  /*выпадающие пункты для Пол*/
  const optionsGender = masGender.map((text, index) => {
		return <Select.Item label={text} value={index} />;		
  });
  
  /*выпадающие пункты для типа документа*/
  const optionsGrazd = filterDoc.map((text, index) => {
		return <Select.Item label={text} value={index} />;		
  });
  
  /*прорисовать кнопки для навигации по пассажирам которых оформляем*/
  const getButtons=()=>{ 
	  if((JSON.stringify(changeSits.length)==1)&&(countPasNow==1))return( 
	                                                            <Stack>
																  <HStack>
																    <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
																      <Button isDisabled={disabledButton} width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
  	                                                                             onPress={()=>{ setVisibleCountDial(false);
																				                setCountTouch(countTouch=>countTouch+1);
																				                setLoading(true);
																				                passOnServer();
																								
																							  }}>
	                                                                    <Text style={styles.textButtonFirstScreen}>
																          Готово
																	    </Text>
																	  </Button>
																    </Box>
																  </HStack>
																</Stack>);
																
	  else if((JSON.stringify(changeSits.length)!==1)&&(countPasNow==1))return( 
	                                                            <Stack>
																  <HStack>
																    <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
	                                                                  <Button width={'100%'} style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
 	                                                                                    onPress={()=>{
																						  setVisibleCountDial(false);	
																						  setCountTouch(countTouch=>countTouch+1);	
		                                                                                  let count=countPasNow;
																						  count=count+1;
																						  setCountPasNow(count);
																				        
																						  const inpDat=[...flagGrazd];
                                                                                          inpDat[count-1]=true;
												                                          setFlagGrazd(inpDat);
																						   
																						  if((zipDocNumMask[count-1]==undefined)&&(zipDocNumMask[count-1]==null)){
																						    const inputData1 = [...zipDocNumMask]; 
                                                                                            inputData1[count-1] = [/\d/,/\d/,/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; 
	                                                                                        setZipDocNumMask(inputData1);
																						  }
																						
																					      if((nameCountry[count-1]==undefined)&&(nameCountry[count-1]==null)){
																						    const inputData1 = [...nameCountry]; 
                                                                                            inputData1[count-1] = 'Россия'; 
	                                                                                        setNameCountry(inputData1);
																						  }
																						  
																						  if((selectedInfo[count-1]==undefined)&&(selectedInfo[count-1]==null)){
																						    const inputData1 = [...selectedInfo]; 
                                                                                            inputData1[count-1] = '4+6 цифр Пример: 2002 123456'; 
	                                                                                        setSelectedInfo(inputData1);
																						  }

                                                                                          if((chooseCodeTypeGrazd[count-1]==undefined)&&(chooseCodeTypeGrazd[count-1]==null)){
                                                                                            const inpCon=[...chooseCodeTypeGrazd];
                                                                                            inpCon[count-1]=643;
												                                            setChooseCodeTypeGrazd(inpCon);																						
																						  }
																						  
																						  if((selectedDoc[count-1]==undefined)&&(selectedDoc[count-1]==null)){
                                                                                                 const inpD=[...selectedDoc];
                                                                                                 inpD[count-1]=5;
												                                                 setSelectedDoc(inpD);																						
																						  }
																						}}>
																	    <Text style={styles.textButtonFirstScreen}>
																		  Следующий пассажир
																	    </Text>	
																      </Button>
																    </Box>
																  </HStack>
																</Stack>);	
      else if((JSON.stringify(changeSits.length)!==1)&&(countPasNow==JSON.stringify(changeSits.length)))return (
	                                                            <Stack>
																  <HStack width={'99%'} space={3}>
																    <Box style={[styles.blockButtonsSeatScreen, styles.widthMainButtonsPasScreen]}>
	                                                                  <Button isDisabled={disabledButton} width={'100%'} style={[styles.buttonsHeight , styles.mainButtons]}
																								        onPress={()=>{
																											setVisibleCountDial(false);
																											setCountTouch(countTouch=>countTouch+1);
                                                                                                            setLoading(true);
																											passOnServer();
																											}}>
																	    <Text style={styles.textButtonFirstScreen}>
																		  Готово
																	    </Text>
																	  </Button>
																	</Box>
																	<Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsPasScreen,]}>
																	  <Button width={'100%'} style={[styles.buttonsHeight , styles.mainButtons]}
																								         onPress={()=>{
																											          setVisibleCountDial(false);
																											          setCountTouch(countTouch=>countTouch+1);
																	                                                  let count=countPasNow;
																						                              count=count-1;
																	                                                  setCountPasNow(count);
																													  
																					                                 }}>
																	    <Text style={styles.textButtonFirstScreen}>
																		  Предыдущий пассажир
																	    </Text>
																	  </Button>
																    </Box>
																  </HStack>
																</Stack>);
	  else if((JSON.stringify(changeSits.length)!==1)&&(countPasNow>1))return (
	                                                            <Stack>
																  <HStack width={'99%'} space={3}>
																    <Box style={[styles.blockButtonsSeatScreen, styles.widthMainButtonsPasScreen]}>
	                                                                  <Button width={'100%'} style={[styles.buttonsHeight , styles.mainButtons]}
																		         onPress={()=>{
                                                                                               setVisibleCountDial(false);																					 
																				               setCountTouch(countTouch=>countTouch+1);
		                                                                                       let count=countPasNow;
																		  				       count=count+1; 
																							   setCountPasNow(count); 
																							   
																							   const inpDat=[...flagGrazd];
                                                                                               inpDat[count-1]=true;
												                                               setFlagGrazd(inpDat);
																							  
																							   if((nameCountry[count-1]==undefined)&&(nameCountry[count-1]==null)){
																						         const inputData1 = [...nameCountry]; 
                                                                                                 inputData1[count-1] = 'Россия'; 
	                                                                                             setNameCountry(inputData1);
																							   }
																							    
																							   if((zipDocNumMask[count-1]==undefined)&&(zipDocNumMask[count-1]==null)){
																						         const inputData1 = [...zipDocNumMask]; 
                                                                                                 inputData1[count-1] = [/\d/,/\d/,/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/]; 
	                                                                                             setZipDocNumMask(inputData1);
																						       }
																							   
																							   if((selectedInfo[count-1]==undefined)&&(selectedInfo[count-1]==null)){
																						         const inputData1 = [...selectedInfo]; 
                                                                                                 inputData1[count-1] = '4+6 цифр Пример: 2002 123456'; 
	                                                                                             setSelectedInfo(inputData1);
																						       }
																								 
																							   if((chooseCodeTypeGrazd[count-1]==undefined)&&(chooseCodeTypeGrazd[count-1]==null)){
                                                                                                 const inpCon=[...chooseCodeTypeGrazd];
                                                                                                 inpCon[count-1]=643;
												                                                 setChooseCodeTypeGrazd(inpCon);																						
																						       } 
																							   
																							   if((selectedDoc[count-1]==undefined)&&(selectedDoc[count-1]==null)){
                                                                                                 const inpD=[...selectedDoc];
                                                                                                 inpD[count-1]=5;
												                                                 setSelectedDoc(inpD);																						
																						       }
																						       
																						     }}>
																	    <Text style={styles.textButtonFirstScreen}>
																		  Следующий пассажир
																	    </Text>
																	  </Button>
																	</Box>
																	<Box style={[styles.blockButtonsSeatScreen, styles.widthMainButtonsPasScreen]}>
	                                                                  <Button width={'100%'} style={[styles.buttonsHeight , styles.mainButtons]}
																		        onPress={()=>{
																					           setVisibleCountDial(false);
																					           setCountTouch(countTouch=>countTouch+1);
																	                           let count=countPasNow;
																				   		       count=count-1;
																	                           setCountPasNow(count);
																							   
																					         }}>
																	    <Text style={styles.textButtonFirstScreen}>
																		  Предыдущий пассажир
																	    </Text>
																	  </Button>
																	</Box>
																  </HStack>
																</Stack>);
	 
  }
  
  return ( 
	  <NativeBaseProvider>
        <Box style={styles.container}>
          <ImageBackground source={require('../assets/scrbg.png')} style={styles.image_}>
		  <TouchableOpacity style={styles.image_} onPress={()=>{setVisibleCountDial(false); setCountTouch(countTouch=>countTouch+1);}}>
		    <Center flex={1}>
			  <VStack width={'90%'} alignItems={'center'} space={1}>
			     
			     <Center>
				  <Stack space={1}>
				    <HStack width={'90%'} space={3} style={styles.clearButton}>
					  <Box width={'50%'}>
					 
					
					
					<DialogCrossingShow visCrossingDialog={visibleCrossingDialog}/>
					<DialogShow msg={msgError} visDialog={visibleDialog}/>
					
					
						<Text style={styles.headInButtonsSearchScreen}>
		                  Пассажир № {countPasNow}
			            </Text>
						<Bag />
						<Box style={styles.marginBotPas}>
				          <Tarifs />
				        </Box>
						<Box style={[styles.marginBotPas ]}>
				          <Select
			                selectedValue={selectedGender[countPasNow-1]!==undefined ? selectedGender[countPasNow-1] : ''}
			                placeholder="Выберите пол пассажира"
							style={[styles.textSmallInfo]}
			                placeholderTextColor="#FFFFFF" 
			                onValueChange={(itemValue) => {
							                                onChangeCombo(itemValue,(countPasNow-1),selectedGender,setSelectedGender);
														  }}	>
			                {optionsGender}
			              </Select>
			            </Box>
						<Center style={styles.marginBotPas}>
				          <Stack space={1}>
					        <HStack>
					          <Box width={'90%'} style={[styles.autocompleteGrazdDoc ]} >
					            <Autocomplete
				                  value={inputGrazd[countPasNow-1]!==undefined ? inputGrazd[countPasNow-1] : 'Россия'}
				                  style={[flagGrazd[countPasNow-1] ? styles.autocompleteBlueSt : styles.autocompleteRedSt , styles.heightPas  ]}
								  data={filterGrazd[countPasNow-1]}
								  inputContainerStyle={[flagGrazd[countPasNow-1] ? styles.autocompleteBlueStGr : styles.autocompleteRedStGr,  styles.containerAutocompletePas , styles.borderMainButtons]}
			                      onFocus={() => {
									               /*setInputGrazd([]);*/
												   setInputGrazd([...inputGrazd.slice(0, (countPasNow-1)), '', ...inputGrazd.slice(countPasNow)]);
												   const inpDat=[...flagGrazd];
                                                   inpDat[countPasNow-1]=false;
												   setFlagGrazd(inpDat);}}
				                  onChangeText={(text ) => searchDataGrazdToJSON(text,(countPasNow-1))}
				                  placeholder="Введите страну вашего гражданства"
				/*onFocus={(it,i) => {setFocusedInp(it.target.value);}}*/
				                  flatListProps={{
                                    renderItem:({ item, i }) =>{
						              if(inputGrazd[countPasNow-1]!==undefined)
						                return(
     			                          <Button style={styles.fromToButtons} key={i} onPress={() => { 
										    setVisibleCountDial(false);
										    setCountTouch(countTouch=>countTouch+1);
						                    const inputData = [...selectedItem]; 
                                            inputData[countPasNow-1] = item; 
                                            setSelectedItem(inputData); 
					                        setFilterGrazd([]);
											const inpGr=[...flagGrazd];
                                            inpGr[countPasNow-1]=true;
								            setFlagGrazd(inpGr);
                                            const inpData = [...inputGrazd];
					                        inpData[countPasNow-1] = item;
					                        setInputGrazd(inpData);
						
										    const inpDat = [...chooseCodeTypeGrazd];
					                        inpDat[countPasNow-1] = filterTypeGrazd[countPasNow-1][0];
										    /*console.log('inpDat=');console.log(inpDat);*/
					                        setChooseCodeTypeGrazd(inpDat);
										  
					                      /*setSelectedInfo(filterInfoRow[countPasNow-1]); */
				                            }}> 
				                            <Text key={i}>{item}</Text> 
				                         </Button>  
				                        )
						              else return false;} 
                                  }}                                              
			                    />
						      </Box>
						      <Button width={'10%'}
				                style={[flagGrazd[countPasNow-1] ? styles.blueSt : styles.redSt,  styles.borderClearButton, styles.heightClearButtonPas]}
								onPress={() => {
									setVisibleCountDial(false);
									setCountTouch(countTouch=>countTouch+1);
									const inpDat=[...flagGrazd];
                                    inpDat[countPasNow-1]=false;
								    setFlagGrazd(inpDat);
 									setInputGrazd([...inputGrazd.slice(0, (countPasNow-1)), '', ...inputGrazd.slice(countPasNow)]);}}
								>
				                <CloseIcon size={7} />
				              </Button>
					        </HStack>
					      </Stack>
				        </Center>
						
						<Box >
				         <Select
			                selectedValue={(selectedDoc[countPasNow-1]==undefined) ? 5: selectedDoc[countPasNow-1]}
			                placeholder="Выберите тип документа"
							style={[styles.textSmallInfo,styles.colorTextInfo]}
			               
			                onValueChange={(itemValue) => {setVisibleCountDial(false); 
							                               setCountTouch(countTouch=>countTouch+1);
								                           //onChangeCombo(itemValue,(countPasNow-1),selectedDoc,setSelectedDoc);
														   setInputDocNum([...inputDocNum.slice(0, (countPasNow-1)), '', ...inputDocNum.slice(countPasNow)]);
												           setFlagDoc([...flagDoc.slice(0,(countPasNow-1)),'',...flagDoc.slice(countPasNow)]);
														   chooseDoc(itemValue);
							                              }}	>
			                {optionsGrazd}
			             </Select>
						</Box>
				    
						
						<Center >
				          <Stack space={1}>
				            <HStack>
						      <Text style={styles.marginTextInBtn1}>{selectedInfo[countPasNow-1]}</Text>
							</HStack>
					      </Stack>
				        </Center>
				      </Box>
					  <Box width={'50%'}>
					    <Text style={styles.headInButtonsSearchScreen}>
			              Место: {changeSits[countPasNow-1]}
			            </Text> 
						<Center>
				          <Stack space={4}>
					        <HStack>
				              <MaskInput
						        width={'90%'}
			                    style={[flagF[countPasNow-1] ? styles.blueSt : styles.redSt , styles.marginBotPasFio , styles.fioPas , styles.borderMainButtons, styles.textSmallInfo]}
			                    value={inputF[countPasNow-1]}
			                    placeholder="Введите Фамилию"
			                    placeholderTextColor="#FFFFFF"
			                    onChangeText={(masked => onChangeTextCompFIO(masked,(countPasNow-1),inputF,setInputF,flagF,setFlagF))}
			                    mask={zipCodeMask}
			                  />
				              <Button width={'10%'}
				                style={[flagF[countPasNow-1] ? styles.blueSt : styles.redSt, styles.borderClearButton, styles.heightClearButtonPas , styles.clearButtonsPas]}
								onPress={() => {
									            setVisibleCountDial(false);
									            setCountTouch(countTouch=>countTouch+1);
									            setInputF([...inputF.slice(0, (countPasNow-1)), '', ...inputF.slice(countPasNow)]);
												setFlagF([...flagF.slice(0, (countPasNow-1)),false,...flagF.slice(countPasNow)]);
											   }}
								>
				                <CloseIcon size={7}  />
				              </Button>
				            </HStack>
				          </Stack>
				        </Center>
				        <Center>
				          <Stack space={1}>
					        <HStack>
				              <MaskInput
                                width={'90%'}						
			                    style={[flagI[countPasNow-1] ? styles.blueSt : styles.redSt ,  styles.borderMainButtons, styles.marginBotPasFio , styles.fioPas , styles.textSmallInfo]}
			                    value={inputI[countPasNow-1]}
			                    placeholder="Введите Имя"
								placeholderTextColor="#FFFFFF"
			                    onChangeText={(masked => onChangeTextCompFIO(masked,(countPasNow-1),inputI,setInputI,flagI,setFlagI))} 
			                    mask={zipCodeMask}
			                  />
						      <Button width={'10%'}
				                style={[flagI[countPasNow-1] ? styles.blueSt : styles.redSt, styles.borderClearButton,styles.heightClearButtonPas , styles.clearButtonsPas]}
								onPress={() => {
									            setVisibleCountDial(false);
									            setCountTouch(countTouch=>countTouch+1);
									            setInputI([...inputI.slice(0, (countPasNow-1)), '', ...inputI.slice(countPasNow)]);
												setFlagI([...flagI.slice(0, (countPasNow-1)),false,...flagI.slice(countPasNow)]);
											   }}
								>
				                <CloseIcon size={7}  />
				              </Button>
				            </HStack>
				          </Stack>
				        </Center>
				        <Center>
				          <Stack space={1}>
					        <HStack>
				              <MaskInput
                                width={'90%'}	
			                    style={[flagO[countPasNow-1] ? styles.blueSt : styles.redSt ,  styles.borderMainButtons, styles.marginBotPasFio , styles.fioPas , styles.textSmallInfo]}
			                    value={inputO[countPasNow-1]}
			                    placeholder="Введите Отчество"
								placeholderTextColor="#FFFFFF"
			                    onChangeText={(masked => onChangeTextCompFIO(masked,(countPasNow-1),inputO,setInputO,flagO,setFlagO))} 
			                    mask={zipCodeMask}
			                  />
						      <Button width={'10%'}
				                style={[flagO[countPasNow-1] ? styles.blueSt : styles.redSt,styles.borderClearButton, styles.heightClearButtonPas , styles.clearButtonsPas]}
								onPress={() => {
									            setVisibleCountDial(false);
									            setCountTouch(countTouch=>countTouch+1);
									            setInputO([...inputO.slice(0, (countPasNow-1)), '', ...inputO.slice(countPasNow)]);
												setFlagO([...flagO.slice(0, (countPasNow-1)),false,...flagO.slice(countPasNow)]);
											   }}
								>
				                 <CloseIcon size={7}  />
				              </Button>
				            </HStack>
				          </Stack>
				        </Center>
						<Center>
				          <Stack space={1}>
					        <HStack>
				              <MaskInput
                                width={'90%'}	
                                style={[flagDate[countPasNow-1] ? styles.blueSt : styles.redSt ,  styles.borderMainButtons, styles.marginBotPasFio , styles.fioPas , styles.textSmallInfo]}		 
			                    value={inputDate[countPasNow-1]}
			                    placeholder="дд.мм.гггг"
								placeholderTextColor="#FFFFFF"
			                    onChangeText={(masked => onChangeTextCompDate(masked,(countPasNow-1),inputDate,setInputDate))} 
			                    mask={zipDateMask}
			                  />
						      <Button width={'10%'}
				                style={[flagDate[countPasNow-1] ? styles.blueSt : styles.redSt,styles.borderClearButton, styles.heightClearButtonPas , styles.clearButtonsPas]}
								onPress={() => {
									            setVisibleCountDial(false);
									            setCountTouch(countTouch=>countTouch+1);
									            setInputDate([...inputDate.slice(0, (countPasNow-1)), '', ...inputDate.slice(countPasNow)]);
												setFlagDate([...flagDate.slice(0, (countPasNow-1)),false,...flagDate.slice(countPasNow)]);
											   }}
								>
				                <CloseIcon size={7}  />
				              </Button>
					        </HStack>
				          </Stack>
				        </Center>
						<Center >
				          <Stack space={1}>
				            <HStack>				  
					          <MaskInput 
					            placeholder='Введите серию и номер документа'
								placeholderTextColor="#FFFFFF"
						        width={'90%'}	
			                    style={[flagDoc[countPasNow-1] ? styles.blueSt : styles.redSt , styles.borderMainButtons, styles.marginBotPasFio , styles.fioPas, styles.textSmallInfo ]}	
			                    value={inputDocNum[countPasNow-1]}
			                    onChangeText={(masked) => {  onChangeTextComp(masked,(countPasNow-1),inputDocNum,setInputDocNum) }}  
			                    mask={(zipDocNumMask[countPasNow-1]==undefined) ? [/\d/,/\d/,/\d/,/\d/,' ',/\d/,/\d/,/\d/,/\d/,/\d/,/\d/] : zipDocNumMask[countPasNow-1]}
								//mask={zipDocNumMask[countPasNow-1]}
			                  />
						      <Button width={'10%'}
				                style={[flagDoc[countPasNow-1] ? styles.blueSt : styles.redSt,styles.borderClearButton, styles.heightClearButtonPas , styles.clearButtonsPas]}
								onPress={() => {
									            setVisibleCountDial(false);
									            setCountTouch(countTouch=>countTouch+1);
									            setInputDocNum([...inputDocNum.slice(0, (countPasNow-1)), '', ...inputDocNum.slice(countPasNow)]);
												setFlagDoc([...flagDoc.slice(0,(countPasNow-1)),'',...flagDoc.slice(countPasNow)]);
											   }}
								>
				                <CloseIcon size={7}  />
				              </Button>
					        </HStack>
				          </Stack>
				        </Center>
					  </Box>
				    </HStack>
				  </Stack>
				</Center>
				<Box width={'91%'} style={[styles.buttonsPas ]}>
			
			
			
			
			<LoadIndic/>
			
			
			
			
			
				<CountShow visDialogCount={visibleCountDial} dCount={countDial}/>
				   {getButtons()}	
				</Box>
				<Box width={'91%'} style={[styles.buttonsPas ]}>
				  <Box  style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}> 	    
				    <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
					onPress={(id) => {
					  setVisibleCountDial(false);
					  setCountTouch(countTouch=>countTouch+1);
					  setLoading(true);
				      clickUnlock(changeSits[countPasNow-1]); //удалим место в забронированное
					  //setLoading(false);
				      if(changeSits.length!==1){
					     setCountPasNow(1);//перейдем на первого пассажира
					     if(selectedTarifValue!==[])setSelectedTarifValue([...selectedTarifValue.slice(0, (countPasNow-1)), ...selectedTarifValue.slice(countPasNow)]);
					     if(inputF!==[])setInputF([...inputF.slice(0, (countPasNow-1)), ...inputF.slice(countPasNow)]);
                         if(inputI!==[])setInputI([...inputI.slice(0, (countPasNow-1)), ...inputI.slice(countPasNow)]);
					     if(inputO!==[])setInputO([...inputO.slice(0, (countPasNow-1)), ...inputO.slice(countPasNow)]);
					     if(selectedGender!==[])setSelectedGender([...selectedGender.slice(0, (countPasNow-1)), ...selectedGender.slice(countPasNow)]);
					     if(selectedBaggage!==[])setSelectedBaggage([...selectedBaggage.slice(0, (countPasNow-1)), ...selectedBaggage.slice(countPasNow)]);
					     if(filterGrazd!==[])setFilterGrazd([...filterGrazd.slice(0, (countPasNow-1)), ...filterGrazd.slice(countPasNow)]);
					     if(filterDoc!==[])setFilterDoc([...filterDoc.slice(0, (countPasNow-1)), ...filterDoc.slice(countPasNow)]);
					     if(filterInfoRow!==[])setFilterInfoRow([...filterInfoRow.slice(0, (countPasNow-1)), ...filterInfoRow.slice(countPasNow)]);
					     if(filterMask!==[])setFilterMask([...filterMask.slice(0, (countPasNow-1)), ...filterMask.slice(countPasNow)]);
					     if(selectedInfo!==[])setSelectedInfo([...selectedInfo.slice(0, (countPasNow-1)), ...selectedInfo.slice(countPasNow)]);
					     if(selectedDoc!==[])setSelectedDoc([...selectedDoc.slice(0, (countPasNow-1)), ...selectedDoc.slice(countPasNow)]);
						 if(selectedMask!==[])setSelectedMask([...selectedMask.slice(0, (countPasNow-1)), ...selectedMask.slice(countPasNow)]);
					     if(zipDocNumMask!==[])setZipDocNumMask([...zipDocNumMask.slice(0, (countPasNow-1)), ...zipDocNumMask.slice(countPasNow)]);
						 if(checkZipDocNumMask!==[])setCheckZipDocNumMask([...checkZipDocNumMask.slice(0, (countPasNow-1)), ...checkZipDocNumMask.slice(countPasNow)]);
					     if(inputDocNum!==[])setInputDocNum([...inputDocNum.slice(0, (countPasNow-1)), ...inputDocNum.slice(countPasNow)]);
					     if(selectedTypeDoc!==[])setSelectedTypeDoc([...selectedTypeDoc.slice(0, (countPasNow-1)), ...selectedTypeDoc.slice(countPasNow)]);
				      }
                      else {/*удаляем зарезервированное место и возвращаемся к выбору мест если удалили единственного пассажира*/
					    clickUnlock(changeSits[countPasNow-1]);
						clearInterval(timerRef2.current);
                        timerRef2.current = 0;
						clearInterval(timerRef.current);
                        timerRef.current = 0;
				        stateRef.current = 0;
						removeValueAnother();
                        removeValueReturn();
					    navigation.navigate('SelectSeatsScreen', { });
					  /*navigation.goBack();*/
				      }
				    }}>
			          <Text style={styles.textButtonFirstScreen}>Удалить строку</Text>
			         </Button>
				  </Box>
				</Box>
				
				<Box width={'91%'} style={[styles.buttonsPas ]}>
				  <Box  style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				    <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
				          onPress={() => {
							               setVisibleCountDial(false);
							               setCountTouch(countTouch=>countTouch+1);
							               if(getSaveData()!==false){ 
										    
											let obj=getSaveData(); 
                                            obj.paxes.map((item,index)=>{
		                                      item.pax.grazhd=nameCountry[index];
	                                        });
											/*obj.idOrder=resultOwn.data.idOrder;
									        obj.formUrl=resultOwn.data.formUrl;*/
											
	                                        removeValue();
	                                        writeItemToStorage(obj); console.log('obj=');console.log(obj);
										   }
										   clearInterval(timerRef2.current);
                                           timerRef2.current = 0;
										   clearInterval(timerRef.current);
                                           timerRef.current = 0;
				                           stateRef.current = 0;
							               navigation.navigate('SelectSeatsScreen',{  });
						  }}>
				    <Text style={styles.textButtonFirstScreen}>Добавить пассажира</Text>
				   </Button> 
				  </Box>
				</Box>
				<Box width={'91%'} style={[styles.buttonsPas ]}>
				  <Box style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}>
				   <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
                         onPress={() => {
							              
							              
										  if(getSaveData()!==false){ 
											let obj=getSaveData(); 
                                            obj.paxes.map((item,index)=>{
		                                      item.pax.grazhd=nameCountry[index];
	                                        });
											/*obj.idOrder=resultOwn.data.idOrder;
									        obj.formUrl=resultOwn.data.formUrl;*/
											
	                                        removeValue();
	                                        writeItemToStorage(obj);console.log('obj=');console.log(obj);  
										  }
										  clearInterval(timerRef2.current);
                                          timerRef2.current = 0;
										  clearInterval(timerRef.current);
                                          timerRef.current = 0;
				                          stateRef.current = 0;
										  
										  navigation.navigate('ReisScreen');
										 }}>
				     <Text style={styles.textButtonFirstScreen}>К списку рейсов</Text>
				   </Button> 				   
				  </Box>
				</Box>
				<Box width={'91%'} style={[styles.buttonsPas ]}>
				  <Box  style={[styles.blockButtonsSeatScreen , styles.widthMainButtonsInfoScreen]}> 
				    <Button style={[styles.buttonsHeight ,styles.widthMainButtonsInfoScreen, styles.mainButtons]}
				          onPress={() => { 
						                   setVisibleCountDial(false);
						                   setCountTouch(countTouch=>countTouch+1);
										   setVisibleCrossingDialog(true);  }}>
				      <Text style={styles.textButtonFirstScreen}>Выход</Text>
				   </Button> 
                  </Box>				  
				</Box>
			  </VStack>  
            </Center> 
			</TouchableOpacity>
	      </ImageBackground>
        </Box>
	   </NativeBaseProvider>);
}