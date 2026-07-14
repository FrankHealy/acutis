import Constants from "expo-constants";
import {ProductTabletApp} from "@acutis/mobile-ui";
export default function Home(){const x=Constants.expoConfig?.extra!;return <ProductTabletApp config={{kind:"practitioner",name:"Practitioner",strapline:"Clinical work, thoughtfully organised.",apiBaseUrl:x.apiBaseUrl,issuer:x.keycloakIssuer,clientId:x.keycloakClientId,scheme:"acutis-practitioner",accent:"#087f83"}}/>}
