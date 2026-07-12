import { ProductShell } from "@acutis/design-system";
import { directionForLocale, productText } from "@acutis/localization";

export default function Page() {
  const locale = "en-IE";
  const product = productText(locale, "product.outreach");
  return <ProductShell productName={product} organisationName={`${product} ${productText(locale, "common.demo")}`} poweredByLabel={productText(locale, "common.powered_by")} demoLabel={productText(locale, "common.demo")} isDemo direction={directionForLocale(locale)}><h1>{product}</h1><p>{productText(locale, "outreach.preview")}</p></ProductShell>;
}
