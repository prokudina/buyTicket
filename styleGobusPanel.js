  import React from 'react';
  import {StyleSheet} from 'react-native';
  
 const styles = StyleSheet.create({
	container: {
      flex: 1,
      padding: 0,
      backgroundColor: '#009240'
    },
	image_: {
      flex: 1,
      resizeMode: 'contain',
      justifyContent: 'center',
    },
	logo: {
	  width: 700,
	  height: 200
    },
	intro: {
	 flexDirection: 'row',
     alignItems: 'flex-end',
	 justifyContent:'center',
     height: 400
    },
	outro: {
		height: 200,
		alignItems: 'flex-start',
		justifyContent: 'center',
      flexDirection:'row',
	},
	content: {
      flex: 0.7,
    },
	buttonFirstScreen: {
	  height: 150,
    },
	mainButtons: {
	  alignContent: 'center',
	  backgroundColor: '#C0C0C0',
	  color: 'black',
	  borderColor:'black',
	  borderWidth:1,
	  borderRadius: 20,	
	},
	widthMainButtonFirstScreen: {
	  width: '70%'
	},
	textButtonFirstScreen:{
	  color:'black',
	  fontSize:30,
	},
	colorTextInfo: {
	   color: '#FFFFFF'
	},
	

	clearButtons: {
	  textAlign: 'center',
	  marginTop: 0.5,
	  borderRadius: 0,
	  backgroundColor: '#E0FFFF',
	  borderColor: 'transparent',
	},
	clearButtonsPas: {
	  textAlign: 'center',
	  marginTop: 0.5,
      borderWidth: 0.5,
      borderColor: 'gray',	  
	},
	borderClearButton: {
	  borderTopRightRadius: 7,
      borderBottomRightRadius: 7
	},
	borderMainButtons: {
	  borderTopLeftRadius: 7,
      borderBottomLeftRadius: 7	
	},
	heightClearButtonSearch: {
	  height: 61
	},
	heightClearButtonPas: {
	  height: 55
	},
	heightClearButtonMailPhone: {
	  height: 56
	},
	/*apptitle: {                                 
	  paddingBottom: 10, 
	  paddingTop: 10,
	  fontSize: 20,
	  fontWeight: 'bold',
	  color: '#333',
    },*/
	
	/*header:{
	  width: '100%',
	  position: 'relative',
	},*/
	heading: {
	  marginTop: 0,
      marginRight: 90,
      marginBottom: 23,
      marginLeft: 90,
	  color:'#fff',
      textAlignVertical: "center",
	},
	headingMain: {
	  textAlign: "center",
	  fontSize:50,	
	},
    headingInfo: {
	  textAlign: "left",
	  fontSize:30,
      marginBottom: 23,
      marginLeft: 20,
	  color:'#fff',
      textAlignVertical: "center",
	},
	headingTarif:{
	  marginTop: 0,
	  marginBottom: 23,
	  color:'#fff',
      textAlignVertical: "center",
	  textAlign: "left",
	  fontSize:28,	
	},
	searchScreen: {
      width: '100%',
	  position: 'relative',
	  marginLeft: 10
	},
	searchFieldFrom: {
	  width: '93%',
	},
	condensed: {
	  marginTop:0,
	  marginRight:0,
	  marginBottom:20,
	  marginLeft:0,
	  position:'relative',
	  flexDirection: 'row',
	  //borderRadius: 5
	},
	searchAutocomplete: {
	  fontSize: 30,
	  backgroundColor: '#E0FFFF',
	  textAlign: 'center',
	  borderRadius: 0,
	  borderColor: 'transparent'
	},
	heightFromTo: {
	  height: 40
	},
	heightPas: {
	  height: 45,
	  textAlign: 'center',
	},
	heightCalendar: {
	  height: 60
	},
	containerAutocomplete: {
	  height: 62,
	  paddingTop: 10,
	  borderTopLeftRadius:7, 
	  borderBottomLeftRadius: 7,
	  borderWidth: 1,
	  backgroundColor: '#E0FFFF'
	},
	containerAutocompletePas: {
	  height: 56 ,
	  paddingTop: 3,
	  borderTopLeftRadius:7, 
	  borderBottomLeftRadius: 7,
	  borderWidth: 1,
	},
	searchAutocompleteFromView: {
      width: '88.5%',
      //borderRadius: 5,
      flex: 0,
      position: 'absolute',
      top: 0,
      maxHeight: 235,
     // zIndex: 3,
      flexDirection: 'row',
	  borderColor: 'transparent',
	  borderWidth: 0
	  //backgroundColor: '#f00',

      },
	searchAutocompleteToView: {
      width: '88.5%',
      //borderRadius: 5,
      flex: 1,
      position: 'relative',
	  //top:20,
      //zIndex: 2,
      flexDirection: 'row',
      maxHeight: 250,
	  //backgroundColor: '#ff0',
	  marginBottom: 100,
    },
	
	zIndFrom: {
	  zIndex: 3,
	},
	zIndTo :{
	  zIndex: 2	
	},
	searchRow:{
	  fontSize: 20,
	  textAlign: 'center'
	},
	searchScreenButton: {
	  height: 144,
	  backgroundColor: '#333',
	  //marginBottom:15
	},
	iconText:{
	  color:'#fff'
	},
	iconChangeFromTo: {
	  height: 30
	},
	formCalendar: {
	  width: '91.8%',
      borderRadius: 7	  
    },
	
	calendarButton: {
      backgroundColor: "#333",
	  borderStyle: 'solid',
	  height: 60,
	  width: '6%',
	  marginLeft: 14
    },
	mainButtonsText: {
      fontSize: 30,
	  color:'black',
	  textAlign: 'center',
	  marginBottom: 10
    },
	fullWidth: {
	  width: '100%',
	},
	changeButton: {
	  position: 'absolute',
	  justifyContent: 'flex-end',
	  //top: 50,
	  left: '90%',
	  width: '6%',
	},
    fromToButtons: {
	  borderWidth: 1,
	  height: 60,
	  borderColor: '#32CD32',
	  borderRadius:0,
	  backgroundColor: 'white',
	  width: '100%'
	},
	calendarStyle: {
	  //flex: 1,
      borderWidth: 1,
      borderColor: 'gray',
	  width: 700,
	  height: 400,
	  marginBottom: 100,
	  borderRadius: 10
    },
	blockButtonsReisScreen: {
	  height: 100,
	  alignItems: 'flex-start',
	  justifyContent: 'center',
      flexDirection:'row',
	  marginTop: 20,
     // width: '97%'	  
	},
	
	searchResultDiv: {
	  flexDirection: 'row',
	  marginTop: 10,
	  marginBottom: 10
	  
    },
	textHeadReis: {
	  color: 'white'
	},
	dispatchDiv: {
	  width: '30%',
	  fontSize: 27,
	  marginLeft:10,
	  
    },
    arrivalDiv: {
	  width: '31.5%',
	  fontSize: 27,
    },
    tripDiv: {
	  width: '16%',
	  fontSize: 27,
    },
    priceDiv: {
	  width: '25%',
	  fontSize: 27,
    },
	infoReis: {
	  fontWeight: 'bold'
	},
	autocompliteMargin: {
      marginLeft: 35
	},
	dispatchSingle: {
	  marginTop: 10,
	  height: 135,
	  alignItems: "flex-start",
	  //borderWidth: 2,
      //borderColor: "#32CD32",
      borderStyle: 'solid',
	  backgroundColor: '#a8f7c3',
    },
	reisStyle: {
	  fontSize: 22,
	  marginLeft:10
	},
	
	reisStyleFreePl: {
	  fontSize: 21,
	  marginLeft:10
	},
	citySt: {
	  width: '30%',
	  height: 135,
	  alignItems: "flex-start",
	   justifyContent: 'flex-start',
	  marginLeft:7,
	  borderRightWidth: 1,
	  borderColor: 'green'
    },
	reisSt: {
	  width: '17%',
	  alignItems: "flex-start",
	  justifyContent: 'flex-start',
	  borderRightWidth: 1,
	  borderColor: 'green'
	  
    },
	costSt: {
	  width: '7%',
	  borderRightWidth: 1,
	  borderColor: 'green',
	  justifyContent: 'flex-start',
    },
	buyButtonSt: {
	  /*width: '9%',*/
	  width: 180,
	  height: 80,
     
	},
	buttonB: {
	  width: 150,
	  height: 80,
	  borderRadius:5,
	  marginLeft: 20,
	  marginTop: 55,
	  backgroundColor: 'black'
	},
	loadIndicator: {
	  position: 'absolute',
	  zIndex:10,
	  color: '#696969',
	  width: 200,
	  height: 200
	},
	loadIndicPosition: {
	  marginLeft:'45%',
	  marginTop:'15%',
	},
	countPositionSeats: {
	  marginLeft:'2%',
	  marginTop:'25%',
	  paddingTop: '5%',
	  paddingLeft: '5%',
	  height: 100,
	  backgroundColor : 'white',
	},
	countPositionEmail: {
	  marginLeft:'25%',
	  marginTop:'25%',
	  paddingTop: '3%',
	  paddingLeft: '5%',
	  height: 200,
	  width: 800,
	  backgroundColor : 'white',
	},
	countPosition: {
	  marginLeft:'15%',
	  marginTop:'15%',
	  paddingTop: '5%',
	  paddingLeft: '5%',
	  backgroundColor : 'white',
	},
	countPositionPas: {
	  marginLeft:'15%',
	  marginTop:'-15%',
	  paddingTop: '5%',
	  paddingLeft: '5%',
	  height: 200,
	  backgroundColor : 'white',	
	},
	textCountStyle: {
	  fontSize: 30,
	},
	loadIndicPositionInfPas: {
	  marginLeft:'85%',
	  marginTop:'15%',
	},
	loadIndicPositionPas: {
	  marginLeft:'45%',
	  marginTop:'-15%'
	},
    buttonsHeight: {
	  height: 55
	},
	textContacts: {
	  fontSize: 30,
	  marginTop: 0,
	  marginLeft: 20,
	  color:'#fff',
      textAlignVertical: "center",
	},
	
	
	
	
	
	blockButtonsSeatScreen: {
	  //height: 30,
	  alignItems: 'flex-start',
	  justifyContent: 'center',
      flexDirection:'row',
	  marginTop: 5,
     // width: '97%'	  
	},
	widthMainButtonsSeatScreen: {
	  width: '97%'
	},
	widthMainButtonsInfoScreen: {
	  width: '100%'
	},
	widthMainButtonsPasScreen: {
		width: '50%'
	},
	selectSeatsScreenButtons: {
	  width: '91%',
      marginRight: 30	  
	},
	headInButtonsSearchScreen: {
	  fontSize: 26,
	  fontWeight: 'bold',
	  marginBottom: 20,
	  color: 'white'
	},

	textCenter: {
	  textAlign:'center'
	},
	infoTrip: {
	  width: '80%',
	  paddingBottom: 2
	},
	infoPas1: {
	  width: '60%',
	  paddingBottom: 10
	},
	infoPas2: {
	  width: '40%',
	  paddingBottom: 10
	},
	
	infoReisBold: {
	  flexDirection: 'row',
	  marginLeft: 10,
	  marginTop: 6
	},
	textInfoReis: {
	   fontSize: 22,
	   borderTopLeftRadius: 7,
	   borderBottomLeftRadius: 7,
	   /*marginLeft: 10,
	   marginTop: 6*/
	},
	textSmallInfo: {
	  fontSize: 20,
	  /*marginLeft: 10,
	   marginTop: 6*/
	},
	dialogBox: {
	  width: '100%', 
	  borderTopWidth:1,
	  borderColor: 'gray',
	  marginTop: 10,
	  //flex: 1, 
	  /*flexDirection: 'row' , 
	  flexWrap: 'nowrap',*/
	   flexDirection: 'column',
	   justifyContent: 'space-around',
	   alignItems: 'stretch'
	},
	dialogBox1:{
		justifyContent: 'center'
	},
	dialogStyle: {
	 // justifyContent: 'center',
	 alignItems: 'center',
	  margin:0, 
	  fontSize: 25,
	  //marginLeft: 120
	},
	dialogTitleStyle: {
	  textAlign: 'center', 
	  fontSize: 22 , 
	  fontWeight: 'bold'  
	},
	dialogBoxInfo: {
	  flexDirection: "column",
      height: 250,
      padding: 15,	
	},
	dialogTitleInfo: {
	  fontSize: 20,
	  marginBottom: 10
	},
	dialogViewMainStyle: { 
	  width: '100%',
	  height:30, 
	  borderRadius: 5,
	  marginBottom:5
	},
	dialogTextInfo: {
	  textAlign: 'center',
	  paddingTop: 1,
	},
	seatsWidth: {
	  width: 60
	},
    infoButton: {
	  position: 'absolute',
	  left: '92%',
	  top:'8%',
	  backgroundColor: 'transparent'
	},
	infoTarifsAndPrices: {
	  fontSize: 23,
	  color: 'white',
	},
	tarifsAndPrices: {
	  width: '20%',
	},
    passengersInfo: {
	  width: '50%',
	  marginBottom: 10
	},	
	marginTextInBtn1: {
	  fontSize: 19,
	  marginBottom: 5
	},
	marginTextInBtn2: {
	  marginLeft: 110,  
	},
    textSelectSeatsScreen: {
      fontSize: 26,
	  fontWeight: 'bold'
    },
    textMarginSelectSeatScreen: {
      marginBottom: 10,
	  fontSize: 23,
    },
	bus: {
	  flexDirection: "row",
	  flexWrap: 'wrap',
	  marginTop:0,
	  marginRight:50,
	  marginBottom:0,
	  marginLeft:50,
	  width:'100%' ,
	  marginLeft: 10
	},
    butFree: {
	  backgroundColor: '#a8f7c3',
    },
	scrollBus:{
	  height: '60%',
	  marginBottom: 10
	},
	
	buttonBus: {
	  width: 140,
	  height: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
	  margin:17,
	  borderRadius: 10,
	}, 
	butBlockThisUser: {
	  backgroundColor: '#17e51e',	  
	},
	
    butBron: {
	  backgroundColor: '#FFD700',
    },
	
    butSold: {
	  backgroundColor: '#CD5C5C',
    },
	
	butBlockAnotherUser: {
	  backgroundColor: 'white',
    },
	
	
	
	
	
	
	blockInfoTarifs: {
	  backgroundColor: '#a8f7c3',
	  borderRadius: 20,
	  
	},
    redSt: {
	  backgroundColor : '#fac3c3',
	  marginTop: 1,
	  borderColor: '#fac3c3',
	  borderRadius:0
	},
	

	
	blueSt : {
	  backgroundColor : '#E0FFFF',
	  marginTop:1,
	  borderColor: '#E0FFFF',
	  borderRadius:0
	},
	phoneNumber: {
	  height: 55,
	  paddingLeft: 10
	},
    marginBot: {
	  marginBottom: 20
	},
    marginBotPas: {
	  marginBottom: 10,
	  borderRadius: 20
	},
	 marginBotPas1: {
	  marginBottom: 20,
	  marginTop: -35
	},
	marginTopPas: {
	  marginTop: -10
	},
	marginLeftNavigat:{
	  marginLeft: 15
		},
    headingInfoPas: {
	  marginTop: 5,
	  marginBottom: 5,
	  textAlign: "left",
	  fontSize:30,
      marginLeft: 20,
	  color:'#fff',
      textAlignVertical: "center",
	},
	
	marginBotPasFio: {
	  marginBottom: 11	
	},
    fioPas: {
	  height: 54,
	  textAlign: 'center',
	},
	
	autocompleteRedSt: {
	  fontSize: 20,
	  backgroundColor: '#fac3c3',
	  height: 50,
	  textAlign: 'center',
	  borderRadius:0
	},
	autocompleteBlueSt: {
	  fontSize: 20,
	  backgroundColor: '#E0FFFF',
	  height: 50,
	  textAlign: 'center',
	  borderRadius:0
	},
	autocompleteRedStGr: {
	  backgroundColor: '#fac3c3',
	},
	autocompleteBlueStGr: {
	  backgroundColor: '#E0FFFF',
	},
	
	
	
	clearButton: {
	  marginTop: 10,
	  borderRadius:0,
	  backgroundColor:'transparent'
	},
	clearButtonSearch:{
	  height: 61,
	  borderRadius:0,
	  backgroundColor:'#E0FFFF'
	},
	
	clearButtonGrazdDoc: {
	  marginTop: 1,
	  borderRadius:0,
	  backgroundColor: '#E0FFFF',
	  height: 60,
	  borderColor: 'transparent'
	  //backgroundColor: 'transparent'
	},
	autocompleteGrazdDoc:{
	  position:'relative',
	  flexDirection: 'row',
	  borderRadius: 5
	},
	buttonsPas: {
	  marginTop: -5
	},
	table:{
	  marginBottom: 20,
	  flex:1, borderWidth:2,borderColor:'red'
	},
	
	bodyTable:{
	  fontSize: 18,
	  textAlign: 'center'
	},
	bodyTableFromTo:{
	  fontSize: 18,
	  alignItems: "flex-start",
	  marginBottom: 5
	},
	headTable: {
	  fontSize:20,
	  fontWeight: 'bold'
	},
	fontBold:{
	  fontWeight: 'bold',
	  fontSize: 20
	},
	fontBoldBuy:{ fontWeight: 'bold'},
	marginLeft1:{marginLeft: 70},
	payImgWeb:{
		marginTop: 20,
        flex:1
	},
	payImgBox:{
		flex: 1,
        padding: 0,
        backgroundColor: '#009240'
	},
	payImgBackground:{
		flex: 1,
        resizeMode: 'contain',
        justifyContent: 'center'
	},
	payImgPict:{
		width: 500, 
		height: 500
	},
	payImgText:{
		marginTop: -40, 
		fontSize: 20
	},
	qq:{
		borderWidth:2,borderColor:'#FF69B4'
	},
	ww:{
		borderWidth:2,borderColor:'#FF1493'
	},
	ee: {
		borderWidth:2,borderColor:'#FF4500'
	},
	rr:{
		backgroundColor: '#FF00FF'
	},
	tt: {
		borderWidth:2,borderColor:'#DA70D6'
	},

	
	qq1: {width: '8%'},
    qq2: {width: '17%'},	
	ww1: {width: '7%',},
	ee1: {width: '10%'},  
	rr1:{width: '17%'},
	tt1:{width: '58%'},
	uu1:{width: '10%'},
    yy1:{borderColor:'gray',borderWidth:2},
	ii1:{borderColor:'gray',borderWidth:1,marginLeft:150},
	oo1:{width:'76%'},
    
  
 });
 
 export default styles;
  
