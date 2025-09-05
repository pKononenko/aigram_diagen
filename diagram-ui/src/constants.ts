import type { Engine, DiagramKind } from "./types";

export const API_BASE: string =
  import.meta.env?.VITE_API_BASE || "http://localhost:8000";
//export const KROKI: string = import.meta.env?.VITE_KROKI_URL || "";

export const ENGINES: Array<{ value: Engine; label: string }> = [
  { value: "mermaid", label: "Mermaid" },
  { value: "dot", label: "Graphviz (DOT)" },
];

export const EXAMPLES: Array<{
  label: string;
  diagram: DiagramKind;
  prompt: string;
}> = [
  {
    label: "Flow",
    diagram: "flow",
    prompt:
      "We’re modeling a multi-tenant marketplace platform. Use short ids in the graph.\n" +
      "Actors/clients:\n" +
      "- Web App (WEB), Mobile App (MOB), Admin Console (ADM).\n" +
      "Edge services:\n" +
      "- API Gateway (GW), Auth (AUTH), CDN (CDN).\n" +
      "Core microservices:\n" +
      "- Users (USR), Catalog (CAT), Search (SRCH), Inventory (INV), Cart (CART), Orders (ORD),\n" +
      "  Payments (PAY), Billing (BILL), Shipping (SHIP), Notifications (NTF), Files (FILE),\n" +
      "  Analytics (ANL), Audit (AUD), Feature Flags (FF).\n" +
      "Infra:\n" +
      "- Cache (CACHE), Message Broker (MQ), Relational DB (DB), Object Storage (S3), Data Warehouse (DWH).\n" +
      "External providers:\n" +
      "- Stripe (STRIPE), Email (SMTP), SMS (SMS), Shipping API (SHIPPROV).\n" +
      "Main interactions (edges; label with purpose):\n" +
      "- WEB -> GW : browse, login, buy\n" +
      "- MOB -> GW : browse, login, buy\n" +
      "- ADM -> GW : admin ops\n" +
      "- GW -> AUTH : verify JWT\n" +
      "- GW -> USR : user profile CRUD\n" +
      "- GW -> CAT : list products\n" +
      "- GW -> SRCH : full-text search\n" +
      "- GW -> INV : stock check\n" +
      "- GW -> CART : add/remove/view\n" +
      "- GW -> ORD : create order\n" +
      "- ORD -> PAY : create payment intent\n" +
      "- PAY -> STRIPE : charge\n" +
      "- PAY -> BILL : invoice\n" +
      "- BILL -> USR : resolve plan/discounts\n" +
      "- ORD -> SHIP : create shipment\n" +
      "- SHIP -> SHIPPROV : label/rates\n" +
      "- NTF -> SMTP : email\n" +
      "- NTF -> SMS : sms\n" +
      "- FILE -> S3 : upload/download\n" +
      "- CDN -> FILE : serve assets\n" +
      "- SRCH -> MQ : index updates\n" +
      "- CAT -> MQ : product indexed\n" +
      "- INV -> MQ : stock events\n" +
      "- MQ -> SRCH : consume indexing events\n" +
      "- GW -> CACHE : read-through cache\n" +
      "- USR -> DB : store users\n" +
      "- CAT -> DB : store products\n" +
      "- INV -> DB : stock\n" +
      "- CART -> DB : carts\n" +
      "- ORD -> DB : orders\n" +
      "- PAY -> DB : payment records\n" +
      "- BILL -> DB : invoices\n" +
      "- AUD -> DB : audit logs\n" +
      "- ANL -> DWH : analytics load\n" +
      "- GW -> AUD : record action\n" +
      "- FF -> GW : flags evaluation\n" +
      "- WEB -> CDN : static assets\n" +
      "Key flows (labels optional):\n" +
      "- User login: WEB -> GW -> AUTH -> USR\n" +
      "- Add to cart: WEB -> GW -> CART -> INV\n" +
      "- Checkout: WEB -> GW -> ORD -> PAY -> STRIPE -> PAY -> ORD -> SHIP -> SHIPPROV\n" +
      "- Notifications: ORD -> NTF -> SMTP/SMS\n" +
      "Make sure nodes are unique (ids shown above) and include edges for the relationships described.",
  },
  {
    label: "ER",
    diagram: "er",
    prompt:
      "Entities (use these ids):\n" +
      "User(usr), Seller(sel), Product(prod), Sku(sku), Category(cat),\n" +
      "Inventory(inv), Cart(cart), CartItem(ci), Order(ord), OrderItem(oi),\n" +
      "Payment(pay), Invoice(invx), Shipment(ship), Address(addr),\n" +
      "Coupon(cpn), Review(rev), EventLog(evt)\n" +
      "Relationships (one-to-many unless noted; label with role):\n" +
      "- usr -> addr : has\n" +
      "- usr -> cart : has\n" +
      "- usr -> ord  : places\n" +
      "- usr -> rev  : writes\n" +
      "- sel -> prod : owns\n" +
      "- prod -> cat : in\n" +
      "- prod -> sku : variants\n" +
      "- sku -> inv  : stocked_as\n" +
      "- cart -> ci  : contains\n" +
      "- ci -> sku   : for_sku\n" +
      "- ord -> oi   : contains\n" +
      "- oi -> sku   : for_sku\n" +
      "- ord -> pay  : pays_with\n" +
      "- ord -> invx : invoiced_as\n" +
      "- ord -> ship : ships_as\n" +
      "- ord -> addr : ship_to\n" +
      "- cpn -> ord  : applied_to\n" +
      "- rev -> prod : about\n" +
      "- evt -> usr  : actor (optional)\n" +
      "- evt -> ord  : about (optional)\n" +
      "Add other obvious relations if needed (e.g., usr -> pay for saved methods).\n",
  },
];
