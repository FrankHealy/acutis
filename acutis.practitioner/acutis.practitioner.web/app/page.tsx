import { ProductShell } from "@acutis/design-system";
import { directionForLocale, productText } from "@acutis/localization";
import Membership from "./membership";

export default function Page() {
  const locale = "en-IE";
  const product = productText(locale, "product.practitioner");
  return <Membership><ProductShell productName={product} organisationName={`${product} ${productText(locale, "common.demo")}`} poweredByLabel={productText(locale, "common.powered_by")} demoLabel={productText(locale, "common.demo")} isDemo direction={directionForLocale(locale)}><h1>{product}</h1><nav aria-label={product}><a href="/appointments">{productText(locale, "common.appointments")}</a> · <a href="/forms">{productText(locale, "common.forms")}</a></nav></ProductShell></Membership>;
}
