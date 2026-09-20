import type { Invoice, PurchaseOrder, Vendor } from "./types";

export const VENDORS: Vendor[] = [
  { id: "v-northwind", name: "Northwind Logistics" },
  { id: "v-bluepeak", name: "Bluepeak Consulting" },
  { id: "v-atlas", name: "Atlas Office Supplies" },
  { id: "v-vertex", name: "Vertex Marketing Group" },
  { id: "v-meridian", name: "Meridian Facilities Group" },
  { id: "v-cascade", name: "Cascade Technical Services" },
];

export const PURCHASE_ORDERS: PurchaseOrder[] = [
  { id: "PO-1001", vendorId: "v-northwind", amount: 8400, servicePeriod: { start: "2026-08-01", end: "2026-08-31" }, description: "Freight services — August" },
  { id: "PO-1002", vendorId: "v-northwind", amount: 3150, servicePeriod: { start: "2026-08-01", end: "2026-08-31" }, description: "Warehousing — August" },
  { id: "PO-1010", vendorId: "v-bluepeak", amount: 22000, servicePeriod: { start: "2026-07-01", end: "2026-09-30" }, description: "Q3 strategy engagement" },
  { id: "PO-1011", vendorId: "v-bluepeak", amount: 6500, servicePeriod: { start: "2026-09-15", end: "2026-09-19" }, description: "Workshop facilitation" },
  { id: "PO-1020", vendorId: "v-atlas", amount: 1240, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, description: "Office supplies restock" },
  { id: "PO-1021", vendorId: "v-atlas", amount: 860, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, description: "Printer toner and paper" },
  { id: "PO-1022", vendorId: "v-atlas", amount: 2015, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, description: "Office furniture" },
  { id: "PO-1030", vendorId: "v-vertex", amount: 14750, servicePeriod: { start: "2026-08-15", end: "2026-09-15" }, description: "Q3 campaign production" },
  { id: "PO-1031", vendorId: "v-vertex", amount: 4200, servicePeriod: { start: "2026-09-20", end: "2026-09-25" }, description: "Event signage" },
  { id: "PO-1040", vendorId: "v-meridian", amount: 50000, servicePeriod: { start: "2026-08-01", end: "2026-10-31" }, description: "HVAC retrofit project" },
  { id: "PO-2201", vendorId: "v-cascade", amount: 12000, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, description: "Q3 platform integration engagement" },
  { id: "PO-2318", vendorId: "v-cascade", amount: 18000, servicePeriod: { start: "2026-10-01", end: "2026-11-30" }, description: "Q4 platform integration engagement — phase rollout" },
];

/** Clean base set — every invoice below is the only one against its PO. */
export const CLEAN_INVOICES: Invoice[] = [
  { id: "inv-1", invoiceNumber: "INV-55012", vendorId: "v-northwind", poId: "PO-1001", amount: 8400, servicePeriod: { start: "2026-08-01", end: "2026-08-31" }, lineItemDescription: "August freight and delivery services", submittedAt: "2026-09-03" },
  { id: "inv-2", invoiceNumber: "INV-55090", vendorId: "v-northwind", poId: "PO-1002", amount: 3150, servicePeriod: { start: "2026-08-01", end: "2026-08-31" }, lineItemDescription: "Warehousing and storage, August", submittedAt: "2026-09-10" },
  { id: "inv-3", invoiceNumber: "INV-70211", vendorId: "v-bluepeak", poId: "PO-1010", amount: 22000, servicePeriod: { start: "2026-07-01", end: "2026-09-30" }, lineItemDescription: "Q3 strategy engagement, full retainer", submittedAt: "2026-09-05" },
  { id: "inv-4", invoiceNumber: "INV-70344", vendorId: "v-bluepeak", poId: "PO-1011", amount: 6500, servicePeriod: { start: "2026-09-15", end: "2026-09-19" }, lineItemDescription: "Leadership workshop facilitation", submittedAt: "2026-09-18" },
  { id: "inv-5", invoiceNumber: "INV-30021", vendorId: "v-atlas", poId: "PO-1020", amount: 1240, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "Office supplies restock", submittedAt: "2026-09-02" },
  { id: "inv-6", invoiceNumber: "INV-30099", vendorId: "v-atlas", poId: "PO-1021", amount: 860, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "Printer toner and paper", submittedAt: "2026-09-14" },
  { id: "inv-7", invoiceNumber: "INV-30150", vendorId: "v-atlas", poId: "PO-1022", amount: 2015, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "Office furniture replacement", submittedAt: "2026-09-21" },
  { id: "inv-8", invoiceNumber: "INV-91004", vendorId: "v-vertex", poId: "PO-1030", amount: 14750, servicePeriod: { start: "2026-08-15", end: "2026-09-15" }, lineItemDescription: "Q3 campaign production", submittedAt: "2026-09-08" },
  { id: "inv-9", invoiceNumber: "INV-91077", vendorId: "v-vertex", poId: "PO-1031", amount: 4200, servicePeriod: { start: "2026-09-20", end: "2026-09-25" }, lineItemDescription: "Event signage and printing", submittedAt: "2026-09-22" },
];

/** Meridian: legitimate 3-phase milestone billing against one PO. Sums to the
 * PO total like a duplicate split would — but with non-overlapping periods
 * and distinct phase descriptions, which is what should clear it. */
export const MERIDIAN_INVOICES: Invoice[] = [
  { id: "inv-m1", invoiceNumber: "INV-41001", vendorId: "v-meridian", poId: "PO-1040", amount: 16500, servicePeriod: { start: "2026-08-01", end: "2026-08-31" }, lineItemDescription: "HVAC retrofit — Phase 1: demolition and site prep", submittedAt: "2026-09-02" },
  { id: "inv-m2", invoiceNumber: "INV-41045", vendorId: "v-meridian", poId: "PO-1040", amount: 18000, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "HVAC retrofit — Phase 2: equipment installation", submittedAt: "2026-09-16" },
  { id: "inv-m3", invoiceNumber: "INV-41098", vendorId: "v-meridian", poId: "PO-1040", amount: 15500, servicePeriod: { start: "2026-10-01", end: "2026-10-31" }, lineItemDescription: "HVAC retrofit — Phase 3: commissioning and controls", submittedAt: "2026-10-05" },
];

/** September incident: one $12,000 obligation split into two invoices. */
export const SEPTEMBER_INVOICES: Invoice[] = [
  { id: "inv-sep-a", invoiceNumber: "INV-88214", vendorId: "v-cascade", poId: "PO-2201", amount: 7000, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "Q3 platform integration — consulting services", submittedAt: "2026-09-04" },
  { id: "inv-sep-b", invoiceNumber: "INV-90561", vendorId: "v-cascade", poId: "PO-2201", amount: 5000, servicePeriod: { start: "2026-09-01", end: "2026-09-30" }, lineItemDescription: "Q3 platform integration — consulting services (continued)", submittedAt: "2026-09-07" },
];

/** October incident: the same vendor, an N-way rebill with staggered,
 * partially overlapping periods and reworded line items. */
export const OCTOBER_INVOICES: Invoice[] = [
  { id: "inv-oct-c", invoiceNumber: "INV-91002", vendorId: "v-cascade", poId: "PO-2318", amount: 9000, servicePeriod: { start: "2026-10-01", end: "2026-10-31" }, lineItemDescription: "Integration services — Q4 rollout, milestone A", submittedAt: "2026-10-03" },
  { id: "inv-oct-d", invoiceNumber: "INV-91145", vendorId: "v-cascade", poId: "PO-2318", amount: 5000, servicePeriod: { start: "2026-10-15", end: "2026-11-15" }, lineItemDescription: "Q4 platform rollout support — milestone B", submittedAt: "2026-10-14" },
  { id: "inv-oct-e", invoiceNumber: "INV-91289", vendorId: "v-cascade", poId: "PO-2318", amount: 4000, servicePeriod: { start: "2026-11-01", end: "2026-11-30" }, lineItemDescription: "Platform integration retainer — Q4 continuation", submittedAt: "2026-10-21" },
];

export const INCIDENT_ID_SEPTEMBER = "INC-014";
export const INCIDENT_ID_OCTOBER = "INC-021";

export function findVendor(id: string): Vendor {
  const v = VENDORS.find((v) => v.id === id);
  if (!v) throw new Error(`Unknown vendor ${id}`);
  return v;
}

export function findPO(id: string): PurchaseOrder {
  const po = PURCHASE_ORDERS.find((p) => p.id === id);
  if (!po) throw new Error(`Unknown PO ${id}`);
  return po;
}
