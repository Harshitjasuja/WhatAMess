const Order = require("./models/orderModel");
const User = require("./models/userModel");

const handleSocketConnections = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔥 New client connected: ${socket.id}`);

        // ✅ Listen for order assignment
        socket.on("assignOrder", async (orderData) => {
            console.log("📦 Order Assigned:", orderData);

            try {
                // ✅ Update order in database
                const updatedOrder = await Order.findByIdAndUpdate(
                    orderData.orderId,
                    { deliveryPersonId: orderData.deliveryPersonId, deliveryStatus: "Out for Delivery" },
                    { new: true }
                );

                io.emit("orderAssigned", updatedOrder); // ✅ Broadcast to all clients
            } catch (error) {
                console.error("❌ Error assigning order:", error.message);
            }
        });

        // ✅ Listen for order status update
        socket.on("updateOrderStatus", async (statusData) => {
            console.log("✅ Order Status Updated:", statusData);

            try {
                const updatedOrder = await Order.findById(statusData.orderId);
                if (!updatedOrder) {
                    console.log("❌ Order not found");
                    return;
                }

                // ✅ If the order is delivered, reward the delivery person
                if (statusData.status === "Delivered" && updatedOrder.deliveryPersonId) {
                    const deliveryPerson = await User.findById(updatedOrder.deliveryPersonId);
                    if (deliveryPerson) {
                        deliveryPerson.credits += 10; // 🎉 Reward credits (modify if needed)
                        await deliveryPerson.save();
                        console.log(`🎊 Credits updated for ${deliveryPerson.name}: ${deliveryPerson.credits}`);
                    }
                }

                // ✅ Update order status in database
                updatedOrder.status = statusData.status;
                await updatedOrder.save();

                io.emit("orderUpdated", updatedOrder); // ✅ Broadcast update
            } catch (error) {
                console.error("❌ Error updating order status:", error.message);
            }
        });

        // ✅ Listen for real-time location update
        socket.on("updateLocation", async (locationData) => {
            console.log("📍 Location Update:", locationData);

            try {
                // ✅ Update order's current location in database
                const updatedOrder = await Order.findByIdAndUpdate(
                    locationData.orderId,
                    {
                        currentLocation: {
                            latitude: locationData.latitude,
                            longitude: locationData.longitude,
                        },
                    },
                    { new: true }
                );

                io.emit("locationUpdated", updatedOrder); // ✅ Notify all clients
            } catch (error) {
                console.error("❌ Error updating location:", error.message);
            }
        });

        // ✅ Handle disconnection
        socket.on("disconnect", () => {
            console.log(`❌ Client disconnected: ${socket.id}`);
        });
    });
};

module.exports = handleSocketConnections;
