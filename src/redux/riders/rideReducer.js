import {
  SET_RIDE_STATUS,
  UPDATE_RIDE_ORDERS,
  UPDATE_AVAILABLE_RIDE,
} from './riderAction';

const initialState = {
  rideId: null,
  isAvailable: false,
  orders: [],
  vueltaEstablecida: false,
};

const rideReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_RIDE_STATUS:
      return {
        ...state,
        rideId: action.payload.rideId,
        isAvailable: action.payload.isOngoing,
        orders: action.payload.orders,
        vueltaEstablecida: action.payload.vueltaEstablecida,
      };
    case UPDATE_RIDE_ORDERS:
      return {
        ...state,
        orders: action.payload,
      };

    case UPDATE_AVAILABLE_RIDE:
      return {
        ...state,
        isAvailable: action.payload.isAvailable,
      };
    default:
      return state;
  }
};

export default rideReducer;
