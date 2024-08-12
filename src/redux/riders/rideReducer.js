import { SET_RIDE_STATUS, UPDATE_RIDE_ORDERS } from './riderAction';

const initialState = {
  rideId: null,
  isRideOngoing: false,
  orders: [],
};

const rideReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RIDE_STATUS:
      return {
        ...state,
        rideId: action.payload.rideId,
        isRideOngoing: action.payload.isOngoing,
        orders: action.payload.orders,
      };
    case UPDATE_RIDE_ORDERS:
      return {
        ...state,
        orders: action.payload,
      };
    default:
      return state;
  }
};

export default rideReducer;
