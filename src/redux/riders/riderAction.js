export const SET_RIDE_STATUS = 'SET_RIDE_STATUS';
export const UPDATE_RIDE_ORDERS = 'UPDATE_RIDE_ORDERS';

export const setRideStatus = (rideId, isOngoing, orders) => ({
  type: SET_RIDE_STATUS,
  payload: { rideId, isOngoing, orders },
});

export const updateRideOrders = (orders) => ({
  type: UPDATE_RIDE_ORDERS,
  payload: orders,
});
