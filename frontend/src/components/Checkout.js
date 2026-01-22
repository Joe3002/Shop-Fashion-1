import React, { useContext } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { ShopContext } from "../context/ShopContext/ShopContext";

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID || "AfCCRMp9qb5TN3M17e30Iiqy5m1SmFq1NXYfGJquFAIXpQYolVAdHXwiEhKuhlGHXZz4ZkHYnngH74G8";
function Checkout({ total, cartItems, user }) {
  const { backendUrl } = useContext(ShopContext);
  // cartItems: mảng sản phẩm trong giỏ hàng, user: thông tin người dùng
  const handleOrderSave = async (paypalDetails) => {
    try {
      await fetch(`${backendUrl}/api/paypal-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user,
          products: cartItems,
          total,
          paymentStatus: "Paid",
          paymentProvider: "PayPal",
          paypalOrderId: paypalDetails.id,
          payer: paypalDetails.payer,
        }),
      });
      alert("Đặt hàng PayPal thành công!");
    } catch (err) {
      alert("Lưu đơn hàng thất bại!");
    }
  };
  return (
    <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total.toString(),
                  currency_code: "USD",
                },
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          const details = await actions.order.capture();
          handleOrderSave(details);
        }}
        onError={(err) => {
          alert("Thanh toán PayPal thất bại!");
        }}
      />
    </PayPalScriptProvider>
  );
}
export default Checkout;
