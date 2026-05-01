import jsPDF from "jspdf";

export function generateInvoice(order) {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.text("INVOICE", 105, 20, { align: "center" });

  doc.setFontSize(12);
  doc.text(`Order ID: ${order.id}`, 20, 35);
  doc.text(`Date: ${order.date}`, 20, 43);
  doc.text(`Status: ${order.status}`, 20, 51);
  doc.text(`Payment: ${order.payment}`, 20, 59);

  // Customer
  doc.setFontSize(14);
  doc.text("Customer Details", 20, 75);

  doc.setFontSize(12);
  doc.text(`Name: ${order.customer.name}`, 20, 83);
  doc.text(`Email: ${order.customer.email}`, 20, 91);
  doc.text(`Phone: ${order.customer.phone}`, 20, 99);
  doc.text(`Address: ${order.customer.address}`, 20, 107);

  // Items
  doc.setFontSize(14);
  doc.text("Ordered Items", 20, 125);

  let y = 135;
  doc.setFontSize(12);

  order.items.forEach((item, index) => {
    doc.text(
      `${index + 1}. ${item.name} (x${item.qty}) - ₹${item.price}`,
      20,
      y,
    );
    y += 8;
  });

  // Summary
  y += 10;
  doc.setFontSize(14);
  doc.text("Order Summary", 20, y);

  doc.setFontSize(12);
  doc.text(`Subtotal: ₹${order.summary.subtotal}`, 20, y + 8);
  doc.text(
    `Shipping: ${order.summary.shipping === 0 ? "Free" : order.summary.shipping}`,
    20,
    y + 16,
  );
  doc.setFontSize(13);
  doc.text(`Total: ₹${order.summary.total}`, 20, y + 26);

  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for shopping with Graphura!", 105, 285, {
    align: "center",
  });

  doc.save(`Invoice-${order.id}.pdf`);
}
