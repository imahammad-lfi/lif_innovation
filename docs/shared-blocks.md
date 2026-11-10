# Shared blocks

## solutions
| UID | Builder signature | Tina fields read |
| --- | --- | --- |
| `solutions.how-can-we-help` | `how_can_we_help(doc, *, anchor_id="")` | Header aliases `status1` / `status` / `eyebrow`, `heading1` / `heading` / `title`, `desc` / `description` / `body`; when passed a parent page object, sibling `Cards[]` or `sapCards[]` (`logo`, `heading`, `content`, `actionButton`) become editable cards. |
| `solutions.technology-details` | `technology_details(doc, *, anchor_id="")` | Generic `technologyDetails*` aliases, plus `dynamics365Section` / `dynamics365Cards` and `odooImplementationAreasSection` / `OdooImplementationAreasCards`; reads the conventional first/second text fields, logo, and cards. |
The builders accept either a raw block object or its owning page document and tolerate the casing/field aliases occurring in the SAP, Microsoft Dynamics, Odoo, About Us, and Innovation & Transformation source documents.

## services

The services family owns the original Linkfields blocks with CSS prefixes `whatweoffer_*`, `ProjectFlowCardSection_*`, `CollapseComponents_*`, and `ourSuperpowers_*`. Import them inside a consumer's `build()` function.

| UID | Builder signature | Tina fields read | Example call |
| --- | --- | --- | --- |
| `services.what-we-offer` | `what_we_offer(doc, *, anchor_id="")` | Direct `whatweoffer`: `heading`, `title`, `description`, `list[]`, `cardsData[].icon/title`. | `what_we_offer(doc["whatweoffer"], anchor_id="how-can-we-help")` |
| `services.flow-cards` | `flow_cards(doc, *, anchor_id="")` | Direct heading: `status1`, `heading1`, `desc`; cards: `logo\|icon`, `heading\|title`, `content\|description`. Supports the observed full-page fields (`Projectflow`/`ProjectFlowCards`/`achievementSection` etc. plus their sibling cards) or `{"headingBlock": ..., "cardItems": ..., "backgroundStyle": "image\|dark"}`. | `flow_cards({"headingBlock": doc["Projectflow"], "cardItems": doc["Cards"]}, anchor_id="what-we-offer")` |
| `services.process-accordion` | `process_accordion(doc, *, anchor_id="")` | Direct `CollapseComponentData`: `header`, `title`, `description`, `image`, `bg`, `list[].title/description`; `bg` selects the source process artwork versus solid #0a0a0a. | `process_accordion(doc["CollapseComponentData"], anchor_id="our-process")` |
| `services.superpowers` | `superpowers(doc, *, anchor_id="")` | Page document heading variants `OurSuperPowers`, `OurBenefits`, `Benefits`, or `benefits`, plus `darkAndLightComponentCards[].icon/title/description`; accepts a direct heading object too. | `superpowers(doc, anchor_id="benefits")` |

All builders are null-tolerant and return a Strapi dynamic-zone section dict. Pass an anchor id matching the hero tab target, such as `how-can-we-help`, `what-we-offer`, `our-process`, or `benefits`.
