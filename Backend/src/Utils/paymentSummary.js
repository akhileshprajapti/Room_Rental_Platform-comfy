const isConfirmedPayment = (booking) => (
  booking.status === "Confirmed"
  || booking.paymentStatus === "Paid"
  || booking.paymentStatus === "Partial"
);

const getPaymentSummary = (booking) => {
  const listingPrice = Number(booking.listing?.price) || 0;
  const storedTotal = Number(booking.totalPrice) || 0;
  const totalAmount = Math.max(storedTotal, listingPrice);
  const checkoutAmount = Number(booking.checkoutAmount) || 0;
  const storedPaid = Number(booking.amountPaid) || 0;
  const storedDue = Number(booking.remainingAmount) || 0;
  const confirmed = isConfirmedPayment(booking);

  if (booking.paymentMethod === "full") {
    const paidAmount = confirmed ? (storedPaid || totalAmount) : storedPaid;
    return {
      totalAmount,
      tokenAmount: 0,
      paidAmount,
      dueAmount: confirmed ? 0 : (storedDue || totalAmount),
      paymentStatus: confirmed ? "Paid" : "Pending",
    };
  }

  if (booking.paymentMethod === "token") {
    const tokenAmount = Number(booking.paymentBreakdown?.tokenAmount)
      || checkoutAmount
      || (storedTotal > 0 && storedTotal < listingPrice ? storedTotal : Math.round(totalAmount * 0.10));

    if (booking.paymentStatus === "Paid") {
      return {
        totalAmount,
        tokenAmount,
        paidAmount: storedPaid || totalAmount,
        dueAmount: 0,
        paymentStatus: "Paid",
      };
    }

    const paidAmount = confirmed ? (storedPaid || tokenAmount) : storedPaid;
    const dueAmount = confirmed
      ? (storedDue > 0 ? storedDue : Math.max(totalAmount - paidAmount, 0))
      : (storedDue || totalAmount);

    return {
      totalAmount,
      tokenAmount,
      paidAmount,
      dueAmount,
      paymentStatus: confirmed ? "Partial" : "Pending",
    };
  }

  return {
    totalAmount,
    tokenAmount: 0,
    paidAmount: storedPaid,
    dueAmount: storedDue || totalAmount,
    paymentStatus: booking.paymentStatus || "Pending",
  };
};

module.exports = {
  getPaymentSummary,
  isConfirmedPayment,
};
