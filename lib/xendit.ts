import { Xendit, Invoice as InvoiceClient } from "xendit-node";

export const xenditClient = new Xendit({
  secretKey: process.env.XENDIT_API_KEY as string,
});

export const xenditInvoiceClient = new InvoiceClient({
  secretKey: process.env.XENDIT_API_KEY as string,
});
