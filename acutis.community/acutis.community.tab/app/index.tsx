import Constants from "expo-constants";
import {ProductTabletApp} from "@acutis/mobile-ui";
export default function Home(){const x=Constants.expoConfig?.extra!;return <ProductTabletApp config={{kind:"community",name:"Community",strapline:"Connected support across the community.",apiBaseUrl:x.apiBaseUrl,issuer:x.keycloakIssuer,clientId:x.keycloakClientId,scheme:"acutis-community",accent:"#3c7b57"}}/>}
