import {useEffect} from "react";
import {router} from "expo-router";
import {ActivityIndicator,StyleSheet,Text,View} from "react-native";
export default function AuthRedirect(){useEffect(()=>{const id=setTimeout(()=>router.replace("/"),2500);return()=>clearTimeout(id)},[]);return <View style={s.page}><ActivityIndicator size="large" color="#3c7b57"/><Text style={s.text}>Completing secure sign in…</Text></View>}
const s=StyleSheet.create({page:{flex:1,alignItems:"center",justifyContent:"center",backgroundColor:"#f3f6f7"},text:{marginTop:16,color:"#65777e",fontSize:16}});
